import { Pool } from 'pg';
import {
  Question,
  QuestionCode,
  QuestionStatus,
  QuestionRepository,
  AnswerOption,
  QuestionMedia,
  Solution,
  Rubric,
  QuestionVersion,
} from '@clasptek/domain-question-bank';
import { randomUUID } from 'crypto';

export class PostgresQuestionRepository implements QuestionRepository {
  private readonly pool: Pool;

  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.pool.query(
      'SELECT 1 FROM public.questions WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    return res.rows.length > 0;
  }

  public async save(question: Question): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Optimistic concurrency locking
      const lockRes = await client.query(
        'SELECT lock_version FROM public.questions WHERE id = $1',
        [question.id]
      );
      if (lockRes.rows.length > 0) {
        if (Number(lockRes.rows[0].lock_version) !== question.lockVersion) {
          throw new Error('Concurrency violation: Question altered by another transaction.');
        }
      }

      // 1. Save core question row
      await client.query(
        `
        INSERT INTO public.questions (id, code, parent_question_id, current_version_id, status, tenant_id, lock_version, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        ON CONFLICT (id) DO UPDATE SET
          parent_question_id = EXCLUDED.parent_question_id,
          current_version_id = EXCLUDED.current_version_id,
          status = EXCLUDED.status,
          lock_version = public.questions.lock_version + 1,
          updated_at = now()
      `,
        [
          question.id,
          question.code.value,
          question.parentQuestionId,
          question.currentVersionId,
          question.status.value,
          question.tenantId,
          question.lockVersion,
        ]
      );

      // 2. Save versions
      for (const ver of question.versions) {
        await client.query(
          `
          INSERT INTO public.question_versions (id, question_id, version_no, version_label, prompt, payload, explanation, status, lock_version)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            version_label = EXCLUDED.version_label,
            prompt = EXCLUDED.prompt,
            payload = EXCLUDED.payload,
            explanation = EXCLUDED.explanation,
            status = EXCLUDED.status,
            lock_version = EXCLUDED.lock_version
        `,
          [
            ver.id,
            ver.questionId,
            ver.versionNo,
            ver.versionLabel,
            ver.prompt,
            ver.payload,
            ver.explanation,
            ver.status,
            ver.lockVersion,
          ]
        );

        // Clear existing details to simplify updates
        await client.query('DELETE FROM public.answer_options WHERE question_version_id = $1', [
          ver.id,
        ]);
        for (const opt of ver.answerOptions) {
          await client.query(
            `
            INSERT INTO public.answer_options (id, question_version_id, option_code, option_text, is_correct, display_order)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
            [opt.id, ver.id, opt.optionCode, opt.optionText, opt.isCorrect, opt.displayOrder]
          );
        }

        await client.query('DELETE FROM public.question_media WHERE question_version_id = $1', [
          ver.id,
        ]);
        for (const media of ver.mediaAssets) {
          await client.query(
            `
            INSERT INTO public.question_media (id, question_version_id, storage_asset_id, association_type, display_order)
            VALUES ($1, $2, $3, $4, $5)
          `,
            [media.id, ver.id, media.storageAssetId, media.associationType, media.displayOrder]
          );
        }

        await client.query('DELETE FROM public.solutions WHERE question_version_id = $1', [ver.id]);
        for (const sol of ver.solutions) {
          await client.query(
            `
            INSERT INTO public.solutions (id, question_version_id, solution_type, content, target_option_id)
            VALUES ($1, $2, $3, $4, $5)
          `,
            [sol.id, ver.id, sol.solutionType, sol.content, sol.targetOptionId]
          );
        }

        await client.query('DELETE FROM public.rubrics WHERE question_version_id = $1', [ver.id]);
        for (const rub of ver.rubrics) {
          await client.query(
            `
            INSERT INTO public.rubrics (id, question_version_id, criterion_name, max_points, description, grading_guidelines)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
            [
              rub.id,
              ver.id,
              rub.criterionName,
              rub.maxPoints,
              rub.description,
              rub.gradingGuidelines,
            ]
          );
        }
      }

      // 3. Save dependencies
      await client.query('DELETE FROM public.question_dependencies WHERE parent_id = $1', [
        question.id,
      ]);
      for (const dep of question.dependencies) {
        await client.query(
          `
          INSERT INTO public.question_dependencies (id, parent_id, child_id, display_order)
          VALUES ($1, $2, $3, $4)
        `,
          [dep.id, question.id, dep.childId, dep.displayOrder]
        );
      }

      // 4. Save ownership
      if (question.ownership) {
        await client.query(
          `
          INSERT INTO public.question_ownership (id, question_id, owner_org_id, license_type, copyright_year, attribution_text)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (question_id) DO UPDATE SET
            owner_org_id = EXCLUDED.owner_org_id,
            license_type = EXCLUDED.license_type,
            copyright_year = EXCLUDED.copyright_year,
            attribution_text = EXCLUDED.attribution_text
        `,
          [
            question.ownership.id,
            question.id,
            question.ownership.ownerOrgId,
            question.ownership.licenseType,
            question.ownership.copyrightYear,
            question.ownership.attributionText,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<Question | null> {
    const res = await this.pool.query(
      'SELECT * FROM public.questions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    const question = new Question(
      row.id,
      new QuestionCode(row.code),
      row.parent_question_id,
      row.current_version_id,
      new QuestionStatus(row.status),
      row.tenant_id,
      row.lock_version
    );

    // Hydrate versions
    const verRes = await this.pool.query(
      'SELECT * FROM public.question_versions WHERE question_id = $1 ORDER BY version_no ASC',
      [id]
    );
    for (const vRow of verRes.rows) {
      const ver = new QuestionVersion(
        vRow.id,
        vRow.question_id,
        vRow.version_no,
        vRow.version_label,
        vRow.prompt,
        vRow.payload,
        vRow.explanation,
        vRow.status,
        vRow.lock_version
      );

      // Hydrate version options
      const optRes = await this.pool.query(
        'SELECT * FROM public.answer_options WHERE question_version_id = $1 ORDER BY display_order ASC',
        [ver.id]
      );
      ver.answerOptions = optRes.rows.map(
        (o) => new AnswerOption(o.id, o.option_code, o.option_text, o.is_correct, o.display_order)
      );

      // Hydrate media
      const mediaRes = await this.pool.query(
        'SELECT * FROM public.question_media WHERE question_version_id = $1 ORDER BY display_order ASC',
        [ver.id]
      );
      ver.mediaAssets = mediaRes.rows.map(
        (m) => new QuestionMedia(m.id, m.storage_asset_id, m.association_type, m.display_order)
      );

      // Hydrate solutions
      const solRes = await this.pool.query(
        'SELECT * FROM public.solutions WHERE question_version_id = $1',
        [ver.id]
      );
      ver.solutions = solRes.rows.map(
        (s) => new Solution(s.id, s.solution_type, s.content, s.target_option_id)
      );

      // Hydrate rubrics
      const rubRes = await this.pool.query(
        'SELECT * FROM public.rubrics WHERE question_version_id = $1',
        [ver.id]
      );
      ver.rubrics = rubRes.rows.map(
        (r) => new Rubric(r.id, r.criterion_name, r.max_points, r.description, r.grading_guidelines)
      );

      question.versions.push(ver);
    }

    return question;
  }

  public async findByCode(code: string): Promise<Question | null> {
    const res = await this.pool.query(
      'SELECT id FROM public.questions WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (res.rows.length === 0) {
      return null;
    }
    return this.findById(res.rows[0].id);
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query('UPDATE public.questions SET deleted_at = now() WHERE id = $1', [id]);
  }
}
