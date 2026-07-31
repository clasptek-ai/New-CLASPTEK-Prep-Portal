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
      const levelStr = (q.difficulty || q.proficiencyLevel || '').toUpperCase();
      if (levelStr === 'FOUNDATION' || levelStr === 'EASY') foundationCount++;
      else if (levelStr === 'INTERMEDIATE' || levelStr === 'MEDIUM') intermediateCount++;
      else if (levelStr === 'ADVANCED' || levelStr === 'HARD') advancedCount++;

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

      // 1. Insert import batch record
      await client.query(
        `INSERT INTO public.question_import_batches
         (id, batch_code, file_name, schema_version, exam_type, uploaded_by, status, total_records, successful_records, failed_records, warning_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'IMPORTING', $7, 0, 0, $8, now())`,
        [
          batchId,
          batchCode,
          payload.metadata?.title || 'json-import.json',
          payload.schemaVersion || '1.0',
          payload.examType || 'English Proficiency',
          uploadedBy,
          validation.totalRecords,
          validation.warnings.length,
        ]
      );

      const questions = Array.isArray(payload.questions) ? payload.questions : [];
      let importedCount = 0;

      for (const q of questions) {
        const qId = randomUUID();
        const qvId = randomUUID();
        const code = q.questionCode || `Q-${Date.now()}-${importedCount}`;
        const examType = q.examType || payload.examType || 'English Proficiency';
        const section = q.section || 'Reading';
        const itemType = q.questionType || 'MCQ';
        const usages = Array.isArray(q.usages) ? q.usages : ['PRACTICE'];
        const proficiencyLevel = q.proficiencyLevel ? q.proficiencyLevel.toUpperCase() : null;

        // Insert into public.questions
        await client.query(
          `INSERT INTO public.questions (id, code, created_at, import_batch_id)
           VALUES ($1, $2, now(), $3)
           ON CONFLICT (code) DO NOTHING`,
          [qId, code, batchId]
        );

        // Build version payload
        const versionPayload = {
          type: itemType,
          difficulty: q.difficulty || 'MEDIUM',
          usages,
          tags: q.tags || [examType, section],
          explanation: q.explanation || '',
          passageCode: q.passageCode || null,
          mediaCode: q.mediaCode || null,
        };

        // Insert into public.question_versions
        await client.query(
          `INSERT INTO public.question_versions
           (id, question_id, version_no, status, prompt, payload, created_at, import_batch_id, proficiency_level, grammar_topic, grammar_subtopic)
           VALUES ($1, $2, 1, 'published', $3, $4, now(), $5, $6, $7, $8)`,
          [
            qvId,
            qId,
            q.prompt || 'Imported question prompt',
            JSON.stringify(versionPayload),
            batchId,
            proficiencyLevel,
            q.grammarTopic || null,
            q.grammarSubtopic || null,
          ]
        );

        // Insert answer_options if MCQ
        if (Array.isArray(q.options)) {
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            const opt = q.options[optIdx];
            const optCode = typeof opt === 'string' ? String.fromCharCode(65 + optIdx) : opt.code;
            const optText = typeof opt === 'string' ? opt : opt.text;
            const isCorrect = q.correctAnswer ? optCode === q.correctAnswer : optIdx === 0;

            await client.query(
              `INSERT INTO public.answer_options
               (id, question_version_id, option_code, option_text, is_correct, display_order)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
              [qvId, optCode, optText, isCorrect, optIdx + 1]
            );
          }
        }

        importedCount++;
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
      JOIN public.question_versions qv ON q.id = qv.question_id
      WHERE qv.status IS NOT NULL
    `;
    const params: any[] = [];

    if (filters?.examType) {
      params.push(`%${filters.examType}%`);
      query += ` AND (qv.payload->'tags' @> jsonb_build_array($${params.length}) OR q.code ILIKE $${params.length})`;
    }

    query += ` ORDER BY q.created_at DESC LIMIT 500`;

    const res = await this.pool.query(query, params);

    const questionsPayload = await Promise.all(
      res.rows.map(async (r) => {
        const payload = r.payload || {};
        const optRes = await this.pool.query(
          `SELECT option_code, option_text, is_correct FROM public.answer_options 
           WHERE question_version_id = $1 ORDER BY display_order ASC`,
          [r.question_version_id]
        );

        const options = optRes.rows.map((o) => ({ code: o.option_code, text: o.option_text }));
        const correctOpt = optRes.rows.find((o) => o.is_correct === true);

        return {
          questionCode: r.question_code,
          examType: filters?.examType || 'English Proficiency',
          section: payload.tags ? payload.tags[1] || 'READING' : 'READING',
          proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
          grammarTopic: r.grammar_topic || undefined,
          grammarSubtopic: r.grammar_subtopic || undefined,
          questionType: payload.type || 'MCQ',
          difficulty: payload.difficulty || 'MEDIUM',
          prompt: r.prompt,
          options,
          correctAnswer: correctOpt ? correctOpt.option_code : 'A',
          explanation: payload.explanation || '',
          usages: payload.usages || ['PRACTICE'],
          status: r.status,
        };
      })
    );

    return {
      schemaVersion: '1.0',
      examType: filters?.examType || 'English Proficiency',
      assessmentUsages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
      metadata: {
        exportedAt: new Date().toISOString(),
        totalQuestions: questionsPayload.length,
        source: 'Clasptek Universal Question Bank',
      },
      passages: [],
      listeningTracks: [],
      writingTasks: [],
      speakingTasks: [],
      mediaAssets: [],
      questions: questionsPayload,
    };
  }

  public async getImportHistory(): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.question_import_batches ORDER BY created_at DESC LIMIT 50`
    );
    return res.rows.map((r) => ({
      batchId: r.id,
      batchCode: r.batch_code,
      fileName: r.file_name,
      schemaVersion: r.schema_version,
      examType: r.exam_type,
      status: r.status,
      totalRecords: r.total_records,
      successfulRecords: r.successful_records,
      failedRecords: r.failed_records,
      warningCount: r.warning_count,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
  }

  public async rollbackBatch(batchId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM public.question_versions WHERE import_batch_id = $1`, [batchId]);
      await client.query(`DELETE FROM public.questions WHERE import_batch_id = $1`, [batchId]);
      await client.query(
        `UPDATE public.question_import_batches SET status = 'ROLLED_BACK', rolled_back_at = now() WHERE id = $1`,
        [batchId]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
