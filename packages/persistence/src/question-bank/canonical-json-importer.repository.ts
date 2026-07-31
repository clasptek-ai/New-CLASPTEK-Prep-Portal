import { Pool } from 'pg';
import { randomUUID } from 'crypto';

export interface ValidationErrorItem {
  rowNumber: number;
  itemCode: string;
  field: string;
  error: string;
  recommendation: string;
}

export interface JsonValidationResult {
  isValid: boolean;
  totalRecords: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
  duplicateCount: number;
  passageCount: number;
  foundationCount: number;
  intermediateCount: number;
  advancedCount: number;
  errors: ValidationErrorItem[];
  warnings: string[];
}

export interface JsonExportContract {
  schemaVersion: string;
  examType: string;
  assessmentUsages: string[];
  metadata: {
    exportedAt: string;
    totalQuestions: number;
    source: string;
  };
  passages: any[];
  listeningTracks: any[];
  writingTasks: any[];
  speakingTasks: any[];
  mediaAssets: any[];
  questions: any[];
}

export class CanonicalJsonImporterRepository {
  private readonly supportedProducts = [
    'English Proficiency',
    'IELTS Academic',
    'IELTS General Training',
    'TOEFL iBT',
    'Digital SAT',
    'CELPIP General',
  ];

  constructor(private readonly pool: Pool) {}

  public validateJsonPayload(payload: any, uiTargetProgramme?: string): JsonValidationResult {
    const errors: ValidationErrorItem[] = [];
    const warnings: string[] = [];

    // Level 1: Syntax & Object Structure
    if (!payload || typeof payload !== 'object') {
      return {
        isValid: false,
        totalRecords: 0,
        validCount: 0,
        warningCount: 0,
        invalidCount: 1,
        duplicateCount: 0,
        passageCount: 0,
        foundationCount: 0,
        intermediateCount: 0,
        advancedCount: 0,
        errors: [{ rowNumber: 0, itemCode: 'ROOT', field: 'payload', error: 'Invalid JSON payload format.', recommendation: 'Provide a valid JSON object.' }],
        warnings: [],
      };
    }

    // Level 2: Schema Version
    if (!payload.schemaVersion) {
      warnings.push('Missing schemaVersion property. Defaulting to 1.0.');
    }

    const examType = payload.examType || 'English Proficiency';

    // Target Programme Mismatch Check
    if (uiTargetProgramme && uiTargetProgramme !== 'General (All Programmes)' && payload.examType) {
      if (uiTargetProgramme.toLowerCase() !== payload.examType.toLowerCase()) {
        errors.push({
          rowNumber: 0,
          itemCode: 'PROGRAMME_MISMATCH',
          field: 'examType',
          error: `PROGRAMME_MISMATCH: Selected Target Programme "${uiTargetProgramme}" conflicts with JSON examType "${payload.examType}".`,
          recommendation: 'Align the target programme selector with the JSON package examType.',
        });
      }
    }

    const passages = Array.isArray(payload.passages) ? payload.passages : [];
    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    const totalRecords = questions.length;

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let foundationCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;

    const seenCodes = new Set<string>();

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const rowNo = idx + 1;
      const qCode = q.questionCode || `Q-${rowNo}`;
      let itemHasError = false;

      // Duplicate Check within JSON
      if (seenCodes.has(qCode)) {
        duplicateCount++;
        itemHasError = true;
        errors.push({
          rowNumber: rowNo,
          itemCode: qCode,
          field: 'questionCode',
          error: `Duplicate questionCode "${qCode}" detected in import payload.`,
          recommendation: 'Ensure each questionCode is unique.',
        });
      } else {
        seenCodes.add(qCode);
      }

      // Level 3: Canonical References (Exam Product)
      const targetExam = q.examType || examType;
      const isProductSupported = this.supportedProducts.some((p) => p.toLowerCase() === targetExam.toLowerCase());
      if (!isProductSupported) {
        itemHasError = true;
        errors.push({
          rowNumber: rowNo,
          itemCode: qCode,
          field: 'examType',
          error: `Unsupported examType "${targetExam}".`,
          recommendation: `Must be one of: ${this.supportedProducts.join(', ')}.`,
        });
      }

      // Level 4: Academic Validity (Digital SAT Check)
      const section = (q.section || '').toUpperCase();
      if (targetExam.toUpperCase().includes('SAT') || targetExam.toUpperCase().includes('DIGITAL SAT')) {
        if (section === 'SPEAKING' || section === 'LISTENING') {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'section',
            error: `Digital SAT does not support section "${section}".`,
            recommendation: 'Remove Listening and Speaking sections for SAT imports.',
          });
        }
      }

      // Proficiency & Difficulty Level Check (Grammar & Language)
      const levelStr = (q.proficiencyLevel || q.proficiency_level || q.difficulty || q.level || '').toString().toUpperCase();
      if (levelStr === 'FOUNDATION' || levelStr === 'EASY' || levelStr.includes('FOUND') || levelStr.includes('EASY')) {
        foundationCount++;
      } else if (levelStr === 'ADVANCED' || levelStr === 'HARD' || levelStr.includes('ADV') || levelStr.includes('HARD')) {
        advancedCount++;
      } else {
        intermediateCount++;
      }

      if (q.proficiencyLevel) {
        const level = q.proficiencyLevel.toUpperCase();
        if (!['FOUNDATION', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'proficiencyLevel',
            error: `Invalid proficiencyLevel "${q.proficiencyLevel}".`,
            recommendation: 'Expected FOUNDATION | INTERMEDIATE | ADVANCED.',
          });
        }
      }

      // Level 6: Question & Option Validity for MCQ
      const itemType = (q.questionType || 'MCQ').toUpperCase();
      if (itemType === 'MCQ' || itemType === 'MULTIPLE_RESPONSE') {
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.length === 0) {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'options',
            error: 'MCQ questions require non-empty options array.',
            recommendation: 'Provide option objects [{ code: "A", text: "..." }, ...].',
          });
        }

        if (q.correctAnswer) {
          const optionCodes = options.map((o: any) => (typeof o === 'string' ? 'A' : o.code));
          const matches = optionCodes.includes(q.correctAnswer);
          if (!matches && options.length > 0) {
            itemHasError = true;
            errors.push({
              rowNumber: rowNo,
              itemCode: qCode,
              field: 'correctAnswer',
              error: `correctAnswer "${q.correctAnswer}" does not match available options (${optionCodes.join(', ')}).`,
              recommendation: 'Ensure correctAnswer matches a valid option code.',
            });
          }
        }
      }

      if (itemHasError) {
        invalidCount++;
      } else {
        validCount++;
      }
    }

    return {
      isValid: errors.length === 0,
      totalRecords,
      validCount,
      warningCount: warnings.length,
      invalidCount,
      duplicateCount,
      passageCount: passages.length,
      foundationCount,
      intermediateCount,
      advancedCount,
      errors,
      warnings,
    };
  }

  public async importJsonBatch(
    payload: any,
    uploadedBy: string = 'admin-001'
  ): Promise<{ batchId: string; batchCode: string; importedCount: number }> {
    const validation = this.validateJsonPayload(payload);
    if (!validation.isValid) {
      throw new Error(`JSON validation failed with ${validation.errors.length} errors.`);
    }

    const client = await this.pool.connect();
    const batchId = randomUUID();
    const batchCode = `BATCH-${Date.now().toString().slice(-6)}`;

    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL statement_timeout = 300000');

      const validUuidUser = (uploadedBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uploadedBy)) ? uploadedBy : null;

      // 1. Insert import batch record
      await client.query(
        `INSERT INTO public.question_import_batches
         (id, batch_code, file_name, schema_version, exam_type, uploaded_by, status, total_records, successful_records, failed_records, warning_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'IMPORTING', $7, 0, 0, $8, now())`,
        [
          batchId,
          batchCode,
          payload.metadata?.title || payload.metadata?.source || 'json-import.json',
          payload.schemaVersion || '1.0',
          payload.examType || 'English Proficiency',
          validUuidUser,
          validation.totalRecords,
          validation.warnings.length,
        ]
      );

      // 2. Persist Reading Passages if present
      if (Array.isArray(payload.passages)) {
        for (const p of payload.passages) {
          const passageCode = p.passageCode || p.code || `PAS-${randomUUID().slice(0, 8)}`;
          await client.query(
            `INSERT INTO public.reading_passages (id, code, title, content, exam_type, status, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, 'published', now())
             ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content`,
            [passageCode, p.title || 'Untitled Passage', p.content || '', payload.examType || 'English Proficiency']
          );
        }
      }

      // 3. Persist Questions, Versions, and Answer Options in batch chunks of 25
      const questions = Array.isArray(payload.questions) ? payload.questions : [];
      let importedCount = 0;
      const chunkSize = 25;

      for (let i = 0; i < questions.length; i += chunkSize) {
        const chunk = questions.slice(i, i + chunkSize);

        const qClauses: string[] = [];
        const qParams: any[] = [];
        const preparedItems: any[] = [];

        chunk.forEach((q: any, idx: number) => {
          const qId = randomUUID();
          const qvId = randomUUID();
          const code = q.questionCode || q.code || `Q-${Date.now()}-${i + idx}`;
          const examType = q.examType || payload.examType || 'English Proficiency';
          const section = q.section || 'Reading';
          const itemType = (q.questionType || 'MCQ').toUpperCase();
          const usages = Array.isArray(q.usages) && q.usages.length > 0 
            ? q.usages 
            : (Array.isArray(payload.assessmentUsages) ? payload.assessmentUsages : ['DIAGNOSTIC', 'PRACTICE']);
          
          const proficiencyLevel = (q.proficiencyLevel || q.proficiency_level || '').toUpperCase() || null;
          const promptText = q.prompt || q.questionText || q.text || 'Imported question prompt';

          const base = qParams.length;
          qClauses.push(`($${base + 1}, $${base + 2}, now(), $${base + 3}, '00000000-0000-0000-0000-000000000000'::uuid)`);
          qParams.push(qId, code, batchId);

          preparedItems.push({
            qId,
            qvId,
            code,
            examType,
            section,
            itemType,
            usages,
            proficiencyLevel,
            promptText,
            grammarTopic: q.grammarTopic || q.topic || null,
            grammarSubtopic: q.grammarSubtopic || q.subtopic || null,
            difficulty: q.difficulty || proficiencyLevel || 'MEDIUM',
            explanation: q.explanation || '',
            passageCode: q.passageCode || null,
            mediaCode: q.mediaCode || null,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correctAnswer,
          });
        });

        const qRes = await client.query(
          `INSERT INTO public.questions (id, code, created_at, import_batch_id, tenant_id)
           VALUES ${qClauses.join(', ')}
           ON CONFLICT (code) WHERE deleted_at IS NULL 
           DO UPDATE SET import_batch_id = EXCLUDED.import_batch_id, updated_at = now()
           RETURNING id, code`,
          qParams
        );

        const codeToIdMap = new Map<string, string>();
        qRes.rows.forEach((r) => codeToIdMap.set(r.code, r.id));

        const qvClauses: string[] = [];
        const qvParams: any[] = [];
        const optClauses: string[] = [];
        const optParams: any[] = [];

        preparedItems.forEach((item) => {
          const actualQId = codeToIdMap.get(item.code) || item.qId;
          const versionPayload = {
            type: item.itemType,
            difficulty: item.difficulty,
            usages: item.usages,
            tags: [item.examType, item.section],
            explanation: item.explanation,
            passageCode: item.passageCode,
            mediaCode: item.mediaCode,
          };

          const qvBase = qvParams.length;
          qvClauses.push(`($${qvBase + 1}, $${qvBase + 2}, 1, 'published', $${qvBase + 3}, $${qvBase + 4}, now(), $${qvBase + 5}, $${qvBase + 6}, $${qvBase + 7}, $${qvBase + 8})`);
          qvParams.push(
            item.qvId,
            actualQId,
            item.promptText,
            JSON.stringify(versionPayload),
            batchId,
            item.proficiencyLevel,
            item.grammarTopic,
            item.grammarSubtopic
          );
        });

        const qvRes = await client.query(
          `INSERT INTO public.question_versions
           (id, question_id, version_no, status, prompt, payload, created_at, import_batch_id, proficiency_level, grammar_topic, grammar_subtopic)
           VALUES ${qvClauses.join(', ')}
           ON CONFLICT (question_id, version_no) DO NOTHING
           RETURNING id, question_id`,
          qvParams
        );

        const qidToQvIdMap = new Map<string, string>();
        qvRes.rows.forEach((r) => qidToQvIdMap.set(r.question_id, r.id));

        // For options, fetch version IDs for existing versions if ON CONFLICT DO NOTHING returned empty for those rows
        const allQIds = preparedItems.map((item) => codeToIdMap.get(item.code) || item.qId);
        const existingVersionsRes = await client.query(
          `SELECT id, question_id FROM public.question_versions WHERE question_id = ANY($1::uuid[]) AND version_no = 1`,
          [allQIds]
        );
        existingVersionsRes.rows.forEach((r) => qidToQvIdMap.set(r.question_id, r.id));

        preparedItems.forEach((item) => {
          const actualQId = codeToIdMap.get(item.code) || item.qId;
          const actualQvId = qidToQvIdMap.get(actualQId) || item.qvId;

          if (item.options.length > 0 && (item.itemType === 'MCQ' || item.itemType === 'MULTIPLE_RESPONSE' || item.itemType === 'MULTIPLE_CHOICE')) {
            item.options.forEach((opt: any, optIdx: number) => {
              const optCode = typeof opt === 'string' ? String.fromCharCode(65 + optIdx) : opt.code;
              const optText = typeof opt === 'string' ? opt : opt.text;
              const isCorrect = item.correctAnswer ? optCode === item.correctAnswer : optIdx === 0;

              const optBase = optParams.length;
              optClauses.push(`(gen_random_uuid(), $${optBase + 1}, $${optBase + 2}, $${optBase + 3}, $${optBase + 4}, $${optBase + 5})`);
              optParams.push(actualQvId, optCode, optText, isCorrect, optIdx + 1);
            });
          }
        });

        if (optClauses.length > 0) {
          await client.query(
            `INSERT INTO public.answer_options
             (id, question_version_id, option_code, option_text, is_correct, display_order)
             VALUES ${optClauses.join(', ')}
             ON CONFLICT (question_version_id, option_code) DO NOTHING`,
            optParams
          );
        }

        importedCount += chunk.length;
      }

      // Update import batch status to COMPLETED
      await client.query(
        `UPDATE public.question_import_batches SET
           status = 'COMPLETED',
           successful_records = $1,
           completed_at = now()
         WHERE id = $2`,
        [importedCount, batchId]
      );

      await client.query('COMMIT');
      return { batchId, batchCode, importedCount };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async exportJsonBank(filters?: { examType?: string; status?: string }): Promise<JsonExportContract> {
    let query = `
      SELECT q.code as question_code, qv.id as question_version_id, qv.prompt, qv.status,
             qv.proficiency_level, qv.grammar_topic, qv.grammar_subtopic, qv.payload
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE qv.status = 'published'
    `;

    const params: any[] = [];
    if (filters?.examType && filters.examType !== 'General (All Programmes)') {
      params.push(filters.examType);
      query += ` AND (qv.payload->>'tags' LIKE '%' || $1 || '%' OR qv.payload->>'examType' = $1)`;
    }

    const res = await this.pool.query(query, params);
    const questions = res.rows.map((r) => {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      return {
        questionCode: r.question_code,
        prompt: r.prompt,
        proficiencyLevel: r.proficiency_level,
        grammarTopic: r.grammar_topic,
        grammarSubtopic: r.grammar_subtopic,
        difficulty: payload.difficulty || 'MEDIUM',
        usages: payload.usages || ['DIAGNOSTIC', 'PRACTICE'],
        questionType: payload.type || 'MCQ',
      };
    });

    return {
      schemaVersion: '1.0',
      examType: filters?.examType || 'English Proficiency',
      assessmentUsages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
      metadata: {
        exportedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        source: 'Clasptek Universal Question Bank Importer',
      },
      passages: [],
      listeningTracks: [],
      writingTasks: [],
      speakingTasks: [],
      mediaAssets: [],
      questions,
    };
  }

  public async getImportHistory(): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.question_import_batches ORDER BY created_at DESC LIMIT 50`
    );
    return res.rows;
  }

  public async rollbackImportBatch(batchId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM public.questions WHERE import_batch_id = $1`, [batchId]);
      await client.query(
        `UPDATE public.question_import_batches SET status = 'ROLLED_BACK', rolled_back_at = now() WHERE id = $1`,
        [batchId]
      );
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
