import { Pool, PoolClient } from 'pg';

export interface QuestionSelectionOptions {
  studentId: string;
  programmeId?: string;
  examType?: string;
  grammarCount?: number; // default 30
  passageCount?: number; // default 1
  writingCount?: number; // default 2
}

export interface PaperSnapshotPayload {
  grammarQuestions: any[];
  readingPassage: any;
  writingTasks: any[];
}

export class QuestionSelectionService {
  /**
   * Generates a balanced, attempt-aware, randomized question set for an assessment attempt.
   */
  public static async generatePaperSnapshot(
    client: PoolClient | Pool,
    options: QuestionSelectionOptions
  ): Promise<PaperSnapshotPayload> {
    const {
      studentId,
      grammarCount = 30,
      passageCount: _passageCount = 1,
      writingCount = 2,
      examType = 'English Proficiency',
    } = options;

    // 1. Retrieve recently encountered question IDs and passage IDs for this student
    const historyQuestionRes = await client
      .query(
        `SELECT DISTINCT question_id
         FROM public.assessment_attempt_answers aaa
         JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id
         WHERE aa.student_id = $1 AND aa.status IN ('SUBMITTED', 'COMPLETED')
         ORDER BY question_id LIMIT 300`,
        [studentId]
      )
      .catch(() => ({ rows: [] }));

    const recentlyUsedQuestionIds = new Set<string>(
      historyQuestionRes.rows.map((r: any) => r.question_id)
    );

    const historyPassageRes = await client
      .query(
        `SELECT DISTINCT (paper_snapshot->'readingPassage'->>'id')::text as passage_id
         FROM public.assessment_attempts
         WHERE student_id = $1 
           AND status IN ('SUBMITTED', 'COMPLETED')
           AND paper_snapshot->'readingPassage'->>'id' IS NOT NULL`,
        [studentId]
      )
      .catch(() => ({ rows: [] }));

    const recentlyUsedPassageIds = new Set<string>(
      historyPassageRes.rows.map((r: any) => r.passage_id)
    );

    // =======================================================================
    // 2. PASSAGE-LEVEL READING SELECTION
    // =======================================================================
    const passagesRes = await client.query(`
      SELECT DISTINCT rp.id, rp.code, rp.title, rp.content, rp.created_at
      FROM public.reading_passages rp
      JOIN public.questions q ON (
        (q.code ILIKE '%' || rp.code || '%') OR 
        EXISTS (
          SELECT 1 FROM public.question_versions qv 
          WHERE qv.question_id = q.id AND (
            qv.payload->>'passageCode' = rp.code OR 
            qv.payload->>'passageCode' = rp.id::text
          )
        )
      )
      WHERE (rp.status = 'published' OR rp.status = 'PUBLISHED' OR rp.status IS NOT NULL)
        AND q.deleted_at IS NULL
      ORDER BY rp.created_at DESC
    `);

    const allPassages = passagesRes.rows;
    let selectedPassage: any = null;

    if (allPassages.length > 0) {
      // Exclude recently used passages if unused passages exist
      const unusedPassages = allPassages.filter((p) => !recentlyUsedPassageIds.has(p.id));
      const poolToUse = unusedPassages.length > 0 ? unusedPassages : allPassages;

      // Randomly select 1 passage from pool
      const randomIndex = Math.floor(Math.random() * poolToUse.length);
      selectedPassage = poolToUse[randomIndex];
    }

    let readingSnapshot: any = null;

    if (selectedPassage) {
      // Query comprehension questions for the selected passage
      const compRes = await client.query(
        `SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.proficiency_level, qv.payload
         FROM public.questions q
         JOIN public.question_versions qv ON qv.question_id = q.id
         WHERE q.deleted_at IS NULL
           AND (qv.status = 'published' OR qv.status = 'PUBLISHED' OR qv.status IS NOT NULL)
           AND (qv.payload->>'passageCode' = $1 OR qv.payload->>'passageCode' = $2 OR q.code ILIKE $3)
         ORDER BY q.code ASC`,
        [selectedPassage.code, selectedPassage.id, `%${selectedPassage.code}%`]
      );

      let comprehensionQuestions: any[] = [];

      if (compRes.rows.length > 0) {
        const compVersionIds = compRes.rows.map((r: any) => r.version_id);
        const compOptRes = await client.query(
          `SELECT question_version_id, option_code, option_text, is_correct, display_order
           FROM public.answer_options
           WHERE question_version_id = ANY($1::uuid[])
           ORDER BY question_version_id, display_order ASC`,
          [compVersionIds]
        );

        const compOptsByVer = new Map<string, any[]>();
        const compCorrectByVer = new Map<string, string>();
        compOptRes.rows.forEach((o: any) => {
          if (!compOptsByVer.has(o.question_version_id)) {
            compOptsByVer.set(o.question_version_id, []);
          }
          compOptsByVer
            .get(o.question_version_id)!
            .push({ code: o.option_code, text: o.option_text });
          if (o.is_correct) {
            compCorrectByVer.set(o.question_version_id, o.option_code);
          }
        });

        comprehensionQuestions = compRes.rows.map((r: any, idx: number) => {
          const opts = compOptsByVer.get(r.version_id) || [];
          const correctCode = compCorrectByVer.get(r.version_id) || opts[0]?.code || 'A';
          return {
            id: r.question_id,
            versionId: r.version_id,
            code: r.question_code || `ENG-READ-${(idx + 1).toString().padStart(2, '0')}`,
            prompt: r.prompt,
            proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
            itemType: 'MCQ',
            options: opts,
            correctOptionCode: correctCode,
            marks: 1,
            order: idx + 1,
          };
        });
      }

      readingSnapshot = {
        id: selectedPassage.id,
        code: selectedPassage.code,
        title: selectedPassage.title,
        content: selectedPassage.content,
        comprehensionQuestions,
      };
    }

    // =======================================================================
    // 3. LEVEL-BALANCED GRAMMAR QUESTION SELECTION
    // =======================================================================
    const targetPerLevel = Math.floor(grammarCount / 3); // e.g. 10 each
    const levels = [
      { key: 'FOUNDATION', patterns: ['FOUNDATION%', 'BASIC%', 'EASY%'] },
      { key: 'INTERMEDIATE', patterns: ['INTERMEDIATE%', 'MEDIUM%'] },
      { key: 'ADVANCED', patterns: ['ADVANCED%', 'HARD%'] },
    ];

    const selectedGrammarRows: any[] = [];
    const selectedGrammarIds = new Set<string>();

    for (const levelObj of levels) {
      const levelRes = await client.query(
        `SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
                COALESCE(qv.proficiency_level, $1) as proficiency_level, qv.payload
         FROM public.questions q
         JOIN public.question_versions qv ON qv.question_id = q.id
         WHERE q.deleted_at IS NULL
           AND (qv.status = 'published' OR qv.status = 'PUBLISHED' OR qv.status IS NOT NULL)
           AND (qv.proficiency_level ILIKE $2 OR qv.proficiency_level ILIKE $3 OR qv.proficiency_level ILIKE $4)
         ORDER BY random()`,
        [
          levelObj.key,
          levelObj.patterns[0],
          levelObj.patterns[1],
          levelObj.patterns[2] || levelObj.patterns[1],
        ]
      );

      const rows = levelRes.rows.filter((r: any) => !selectedGrammarIds.has(r.question_id));

      // Separate into unused by candidate vs used
      const unused = rows.filter((r: any) => !recentlyUsedQuestionIds.has(r.question_id));
      const used = rows.filter((r: any) => recentlyUsedQuestionIds.has(r.question_id));

      // Pick unused first, then fill from used
      const chosenForLevel = unused.slice(0, targetPerLevel);
      if (chosenForLevel.length < targetPerLevel) {
        const needed = targetPerLevel - chosenForLevel.length;
        chosenForLevel.push(...used.slice(0, needed));
      }

      chosenForLevel.forEach((r: any) => {
        selectedGrammarIds.add(r.question_id);
        selectedGrammarRows.push(r);
      });
    }

    // Fallback if we haven't reached target grammarCount
    if (selectedGrammarRows.length < grammarCount) {
      const fallbackRes = await client.query(
        `SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
                COALESCE(qv.proficiency_level, 'INTERMEDIATE') as proficiency_level, qv.payload
         FROM public.questions q
         JOIN public.question_versions qv ON qv.question_id = q.id
         WHERE q.deleted_at IS NULL
           AND (qv.status = 'published' OR qv.status = 'PUBLISHED' OR qv.status IS NOT NULL)
         ORDER BY random()`,
        []
      );

      const fallbackRows = fallbackRes.rows.filter(
        (r: any) => !selectedGrammarIds.has(r.question_id)
      );

      const unusedFallback = fallbackRows.filter(
        (r: any) => !recentlyUsedQuestionIds.has(r.question_id)
      );
      const usedFallback = fallbackRows.filter((r: any) =>
        recentlyUsedQuestionIds.has(r.question_id)
      );

      const needed = grammarCount - selectedGrammarRows.length;
      const additional = unusedFallback.slice(0, needed);
      if (additional.length < needed) {
        additional.push(...usedFallback.slice(0, needed - additional.length));
      }

      additional.forEach((r: any) => {
        selectedGrammarIds.add(r.question_id);
        selectedGrammarRows.push(r);
      });
    }

    // Fetch answer options for selected grammar questions
    const qvIds = selectedGrammarRows.map((r) => r.version_id);
    const optRes =
      qvIds.length > 0
        ? await client.query(
            `SELECT question_version_id, option_code, option_text, is_correct, display_order
             FROM public.answer_options
             WHERE question_version_id = ANY($1::uuid[])
             ORDER BY question_version_id, display_order ASC`,
            [qvIds]
          )
        : { rows: [] };

    const optionsByVersion = new Map<
      string,
      { code: string; text: string; isCorrect: boolean }[]
    >();
    const correctByVersion = new Map<string, string>();

    optRes.rows.forEach((o: any) => {
      if (!optionsByVersion.has(o.question_version_id)) {
        optionsByVersion.set(o.question_version_id, []);
      }
      optionsByVersion.get(o.question_version_id)!.push({
        code: o.option_code || 'A',
        text: o.option_text,
        isCorrect: Boolean(o.is_correct),
      });
      if (o.is_correct) {
        correctByVersion.set(o.question_version_id, o.option_code);
      }
    });

    // Shuffle the final grammar list so ordering is randomized
    const shuffledGrammarRows = [...selectedGrammarRows].sort(() => Math.random() - 0.5);

    const grammarSnapshot = shuffledGrammarRows.map((r, i) => {
      const opts = optionsByVersion.get(r.version_id) || [
        { code: 'A', text: 'Option A', isCorrect: false },
        { code: 'B', text: 'Option B', isCorrect: true },
        { code: 'C', text: 'Option C', isCorrect: false },
        { code: 'D', text: 'Option D', isCorrect: false },
      ];
      const correctCode =
        correctByVersion.get(r.version_id) || opts.find((o) => o.isCorrect)?.code || 'B';
      return {
        id: r.question_id,
        versionId: r.version_id,
        code: r.code || `ENG-GRAM-${(i + 1).toString().padStart(3, '0')}`,
        prompt: r.prompt,
        section: 'Grammar',
        itemType: 'MCQ',
        proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
        options: opts.map((o) => ({ code: o.code, text: o.text })),
        correctOptionCode: correctCode,
        marks: 1,
        order: i + 1,
      };
    });

    // =======================================================================
    // 4. WRITING TASKS SELECTION & ROTATION
    // =======================================================================
    const writingRes = await client.query(
      `SELECT id, code, task_number, title, prompt, instructions, min_words, max_words
       FROM public.writing_tasks
       WHERE exam_type = $1 OR exam_type IS NOT NULL
       ORDER BY random()`,
      [examType]
    );

    let writingTasksPool = writingRes.rows;
    if (writingTasksPool.length > writingCount) {
      // Exclude recently used if possible
      const historyWritingRes = await client
        .query(
          `SELECT DISTINCT (wt_elem->>'id')::text as task_id
           FROM public.assessment_attempts,
                jsonb_array_elements(paper_snapshot->'writingTasks') wt_elem
           WHERE student_id = $1 AND status IN ('SUBMITTED', 'COMPLETED')`,
          [studentId]
        )
        .catch(() => ({ rows: [] }));

      const recentlyUsedWritingIds = new Set<string>(
        historyWritingRes.rows.map((r: any) => r.task_id)
      );

      const unusedWriting = writingTasksPool.filter((w) => !recentlyUsedWritingIds.has(w.id));
      if (unusedWriting.length >= writingCount) {
        writingTasksPool = unusedWriting;
      }
    }

    const selectedWriting = writingTasksPool.slice(0, writingCount);
    const writingSnapshot = selectedWriting.map((w, idx) => ({
      id: w.id,
      code: w.code,
      taskNumber: w.task_number || idx + 1,
      title: w.title,
      prompt: w.prompt,
      instructions: w.instructions,
      minWords: w.min_words || 150,
      maxWords: w.max_words || 400,
      itemType: 'ESSAY',
      marks: 10,
    }));

    return {
      grammarQuestions: grammarSnapshot,
      readingPassage: readingSnapshot,
      writingTasks: writingSnapshot,
    };
  }
}
