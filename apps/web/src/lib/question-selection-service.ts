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

    // Normalize exam type for accurate passage and inventory mapping
    let normalizedExamType = examType || 'English Proficiency';
    const lower = normalizedExamType.toLowerCase();
    if (lower.includes('ielts')) {
      normalizedExamType = 'IELTS Academic';
    } else if (lower.includes('english proficiency') || lower.includes('core')) {
      normalizedExamType = 'English Proficiency';
    } else if (lower.includes('toefl')) {
      normalizedExamType = 'TOEFL';
    } else if (lower.includes('sat')) {
      normalizedExamType = 'SAT';
    } else if (lower.includes('celpip')) {
      normalizedExamType = 'CELPIP';
    }

    // =======================================================================
    // 2. PASSAGE-LEVEL READING SELECTION
    // =======================================================================
    const passagesRes = await client.query(
      `
      SELECT rp.id, rp.code, rp.title, rp.content, rp.exam_type
      FROM public.reading_passages rp
      WHERE (rp.status = 'published' OR rp.status = 'PUBLISHED' OR rp.status IS NOT NULL)
        AND (
          rp.exam_type = $1
          OR rp.exam_type = $2
          OR ($1 = 'English Proficiency' AND (rp.code LIKE 'PAS-DIAG-%' OR rp.code LIKE 'PAS-READ-%' OR rp.exam_type = 'English Proficiency'))
          OR ($1 = 'IELTS Academic' AND (rp.code LIKE 'PAS-DIAG-%' OR rp.exam_type = 'IELTS Academic' OR rp.code LIKE 'PAS-READ-%'))
          OR rp.code LIKE 'PAS-DIAG-%'
        )
        AND rp.code NOT IN ('PAS-READ-001', 'PAS-READ-002', 'PAS-READ-003')
      ORDER BY 
        CASE WHEN rp.code LIKE 'PAS-DIAG-%' THEN 0 ELSE 1 END ASC,
        rp.created_at DESC
    `,
      [normalizedExamType, examType]
    );

    const allPassages = passagesRes.rows;
    let selectedPassage: any = null;

    if (allPassages.length > 0) {
      // Exclude recently used passages if unused passages exist
      const unusedPassages = allPassages.filter((p) => !recentlyUsedPassageIds.has(p.id));
      const poolToUse = unusedPassages.length > 0 ? unusedPassages : allPassages;

      // Select from highest priority group
      const diagPassages = poolToUse.filter((p) => String(p.code).startsWith('PAS-DIAG-'));
      const selectionPool = diagPassages.length > 0 ? diagPassages : poolToUse;

      // Randomly select 1 passage from pool
      const randomIndex = Math.floor(Math.random() * selectionPool.length);
      selectedPassage = selectionPool[randomIndex];
    }

    let readingSnapshot: any = null;

    if (selectedPassage) {
      // Query comprehension questions for the selected passage using exact payload passageCode mapping
      const compRes = await client.query(
        `SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.proficiency_level, qv.payload
         FROM public.questions q
         JOIN public.question_versions qv ON qv.question_id = q.id
         WHERE q.deleted_at IS NULL
           AND (qv.status = 'published' OR qv.status = 'PUBLISHED' OR qv.status IS NOT NULL)
           AND (qv.payload->>'passageCode' = $1 OR qv.payload->>'passageCode' = $2)
         ORDER BY q.code ASC`,
        [selectedPassage.code, selectedPassage.id]
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

        // Auto-generated fixed options for standardized question types
        const TFNG_OPTIONS = [
          { code: 'TRUE', text: 'TRUE' },
          { code: 'FALSE', text: 'FALSE' },
          { code: 'NOT_GIVEN', text: 'NOT GIVEN' },
        ];
        const YNNG_OPTIONS = [
          { code: 'YES', text: 'YES' },
          { code: 'NO', text: 'NO' },
          { code: 'NOT_GIVEN', text: 'NOT GIVEN' },
        ];

        comprehensionQuestions = compRes.rows.map((r: any, idx: number) => {
          const payload = r.payload || {};
          const rawType = (
            payload.type ||
            payload.questionType ||
            payload.itemType ||
            r.base_question_type ||
            'MCQ'
          )
            .toString()
            .toUpperCase()
            .replace(/[\s-]/g, '_');

          // Determine the resolved question type and item type
          let questionType = 'MCQ';
          let itemType = 'MCQ';
          let opts = compOptsByVer.get(r.version_id) || [];
          let correctCode = compCorrectByVer.get(r.version_id) || '';

          // If prompt explicitly mentions TRUE/FALSE/NOT GIVEN or YES/NO/NOT GIVEN
          const promptText = (r.prompt || '').toUpperCase();
          const isTFNGPrompt =
            promptText.includes('TRUE') &&
            promptText.includes('FALSE') &&
            promptText.includes('NOT GIVEN');
          const isYNNGPrompt =
            promptText.includes('YES') &&
            promptText.includes('NO') &&
            promptText.includes('NOT GIVEN');

          if (rawType === 'TRUE_FALSE_NOT_GIVEN' || rawType === 'TFNG' || isTFNGPrompt) {
            questionType = 'TRUE_FALSE_NOT_GIVEN';
            itemType = 'TFNG';
            opts = TFNG_OPTIONS;
            if (!correctCode && payload.correctAnswer) {
              correctCode = payload.correctAnswer.toUpperCase().replace(/\s+/g, '_');
            }
            correctCode = correctCode || 'TRUE';
          } else if (rawType === 'YES_NO_NOT_GIVEN' || rawType === 'YNNG' || isYNNGPrompt) {
            questionType = 'YES_NO_NOT_GIVEN';
            itemType = 'YNNG';
            opts = YNNG_OPTIONS;
            if (!correctCode && payload.correctAnswer) {
              correctCode = payload.correctAnswer.toUpperCase().replace(/\s+/g, '_');
            }
            correctCode = correctCode || 'YES';
          } else if (
            rawType === 'SHORT_ANSWER' ||
            rawType === 'SHORT_RESPONSE' ||
            rawType === 'COMPLETION' ||
            rawType === 'GAP_FILL' ||
            rawType === 'FILL_IN_BLANK' ||
            rawType === 'FILL_IN_THE_BLANK' ||
            rawType === 'SUMMARY_COMPLETION' ||
            rawType === 'SENTENCE_COMPLETION' ||
            rawType === 'TABLE_COMPLETION' ||
            rawType === 'DIAGRAM_COMPLETION' ||
            rawType === 'INPUT'
          ) {
            questionType = rawType;
            itemType = 'INPUT';
            opts = []; // Input-based question — options NOT required
            correctCode = '';
          } else if (
            rawType === 'MATCHING_HEADINGS' ||
            rawType === 'MATCHING_INFORMATION' ||
            rawType === 'MATCHING_FEATURES' ||
            rawType === 'MATCHING_SENTENCE_ENDINGS' ||
            rawType === 'MATCHING'
          ) {
            questionType = rawType;
            itemType = 'MATCHING';

            // Resolve options from payload sharedData or headingsList if answer_options empty
            if (opts.length < 2) {
              const headings =
                payload.sharedData?.headingsList || payload.headingsList || payload.options || [];
              if (headings.length >= 2) {
                opts = headings.map((h: any) => ({
                  code: h.code || h.id || String(h),
                  text: h.text || h.label || String(h),
                }));
              }
            }

            if (opts.length < 2) {
              throw new Error(
                `PREASSESSMENT_READING_INVALID_QUESTION_OPTIONS: ${rawType} question "${r.question_code || r.question_id}" requires ≥2 matching options but has ${opts.length}. passageCode="${selectedPassage.code}"`
              );
            }
            correctCode = correctCode || opts[0]?.code || 'A';
          } else {
            // Default: MCQ — must have options
            questionType = 'MCQ';
            itemType = 'MCQ';
            if (opts.length < 2) {
              throw new Error(
                `PREASSESSMENT_READING_INVALID_QUESTION_OPTIONS: MCQ question "${r.question_code || r.question_id}" requires ≥2 options but has ${opts.length}. passageCode="${selectedPassage.code}"`
              );
            }
            correctCode = correctCode || opts[0]?.code || 'A';
          }

          // Extract complete accepted answers for input-based questions
          let acceptedAnswers: string[] | undefined = undefined;
          if (itemType === 'INPUT') {
            const list: string[] = [];
            if (Array.isArray(payload.acceptedAnswers)) list.push(...payload.acceptedAnswers);
            if (Array.isArray(payload.acceptableAnswers)) list.push(...payload.acceptableAnswers);
            if (Array.isArray(payload.validAnswers)) list.push(...payload.validAnswers);
            if (Array.isArray(payload.correctAnswers)) list.push(...payload.correctAnswers);
            if (payload.correctAnswer && typeof payload.correctAnswer === 'string')
              list.push(payload.correctAnswer);
            if (payload.acceptedAnswer && typeof payload.acceptedAnswer === 'string')
              list.push(payload.acceptedAnswer);

            // Extract from option text if database answer_options had correct answer row
            const verOpts = compOptsByVer.get(r.version_id) || [];
            const correctOpt = verOpts.find(
              (o: any) => o.isCorrect || o.code === compCorrectByVer.get(r.version_id)
            );
            if (correctOpt?.text) list.push(correctOpt.text);

            // Extract from explanation quotes if present
            if (payload.explanation && typeof payload.explanation === 'string') {
              const matches = payload.explanation.match(/[“"']([^“”"']{1,50})[”"']/g);
              if (matches) {
                matches.forEach((m: string) => {
                  const cleaned = m.replace(/[“"']/g, '').trim();
                  if (cleaned.length > 0 && !cleaned.includes('statement is')) {
                    list.push(cleaned);
                  }
                });
              }
            }

            acceptedAnswers = Array.from(
              new Set(list.map((s) => String(s).trim()).filter(Boolean))
            );
            if (acceptedAnswers.length === 0) {
              const promptWords = (r.prompt || '').match(/______\s*([a-zA-Z0-9\s]+)/);
              if (promptWords && promptWords[1]) {
                acceptedAnswers = [promptWords[1].trim()];
              }
            }
          }

          return {
            id: r.question_id,
            versionId: r.version_id,
            code: r.question_code || `ENG-READ-${(idx + 1).toString().padStart(2, '0')}`,
            prompt: r.prompt,
            proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
            questionType,
            itemType,
            options: opts,
            correctOptionCode: itemType === 'INPUT' ? null : correctCode,
            acceptedAnswers,
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
        { code: 'A', text: 'Option A', isCorrect: true },
        { code: 'B', text: 'Option B', isCorrect: false },
        { code: 'C', text: 'Option C', isCorrect: false },
        { code: 'D', text: 'Option D', isCorrect: false },
      ];
      const correctCode =
        correctByVersion.get(r.version_id) ||
        opts.find((o) => o.isCorrect)?.code ||
        (opts.length > 0 ? opts[0].code : 'A');
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
      `SELECT id, code, task_number, title, prompt, instructions, min_words, max_words, time_recommended_minutes
       FROM public.writing_tasks
       WHERE exam_type = $1 OR exam_type IS NOT NULL
       ORDER BY task_number ASC`,
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
    // Sort strictly by task_number (Task 1 Letter, Task 2 Essay)
    selectedWriting.sort((a, b) => (a.task_number || 1) - (b.task_number || 1));

    const writingSnapshot = selectedWriting.map((w, idx) => ({
      id: w.id,
      code: w.code,
      taskNumber: w.task_number || idx + 1,
      title: w.title,
      prompt: w.prompt,
      instructions: w.instructions,
      minWords: w.min_words || (w.task_number === 2 ? 250 : 150),
      maxWords: w.max_words || (w.task_number === 2 ? 500 : 300),
      timeRecommendedMinutes: w.time_recommended_minutes || (w.task_number === 2 ? 25 : 15),
      itemType: w.task_number === 2 ? 'ESSAY' : 'LETTER',
      marks: 10,
      order: idx + 1,
    }));

    if (
      _passageCount > 0 &&
      (!readingSnapshot ||
        !readingSnapshot.content ||
        readingSnapshot.comprehensionQuestions?.length === 0)
    ) {
      throw new Error(
        `DIAGNOSTIC_INSUFFICIENT_INVENTORY: Reading passage inventory could not be assembled for examType "${examType}" (normalized: "${normalizedExamType}")`
      );
    }

    return {
      grammarQuestions: grammarSnapshot,
      readingPassage: readingSnapshot,
      writingTasks: writingSnapshot,
    };
  }
}
