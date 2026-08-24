import { Pool } from 'pg';

export interface MockBlueprintSection {
  name: string;
  orderIndex: number;
  timeLimitMinutes: number;
  questionCount: number;
}

export interface MockBlueprintRecord {
  id: string;
  examCode: string;
  examType: string;
  title: string;
  description: string;
  scoringStrategy: string;
  status: string;
  versionNo: number;
  sections: MockBlueprintSection[];
}

export interface InventoryDeficit {
  sectionName: string;
  required: number;
  available: number;
  deficit: number;
}

export interface MockPassageData {
  id: string;
  code: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface MockGroupData {
  id: string;
  code: string;
  title: string;
  instructions: string;
  questionType?: string | undefined;
  sharedData?: any | undefined;
}

export interface MockAudioData {
  trackId: string;
  trackCode: string;
  trackTitle: string;
  trackUrl: string;
  durationSeconds: number;
  sectionNumber: number;
  sectionTitle: string;
}

export interface MockSpeakingData {
  partNumber: number;
  topic?: string | undefined;
  prepTimeSeconds?: number | undefined;
  speakingTimeSeconds?: number | undefined;
  criteria?: { name: string; weight: number; bandRange: string }[] | undefined;
}

export interface MockEligibleQuestion {
  questionId: string;
  questionVersionId: string;
  code: string;
  prompt: string;
  itemType: string;
  difficulty: string;
  sectionName: string;
  options: { code: string; text: string }[];
  imageUrl?: string | undefined;
  /** Reading: full passage content attached */
  passage?: MockPassageData | undefined;
  /** Question group metadata (instructions, sharedData for headings lists etc.) */
  group?: MockGroupData | undefined;
  /** Listening: audio track metadata */
  audio?: MockAudioData | undefined;
  /** Speaking: part/timing/criteria metadata */
  speaking?: MockSpeakingData | undefined;
}

export interface MockSessionRecord {
  id: string;
  studentId: string;
  examType: string;
  blueprintId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  evaluationState: 'IN_PROGRESS' | 'EVALUATING' | 'COMPLETED';
  currentSectionIndex: number;
  timeRemainingSeconds: number;
  startedAt: Date;
  expiresAt: Date;
  tenantId?: string;
}

export class PostgresCanonicalMockRepository {
  constructor(private readonly pool: Pool) {}

  public async getBlueprintById(id: string): Promise<MockBlueprintRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.mock_blueprints
       WHERE (id::text = $1 OR exam_code = $1) AND (status = 'PUBLISHED' OR status = 'APPROVED')
       LIMIT 1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    let sections: MockBlueprintSection[] = [];
    if (Array.isArray(row.sections_payload)) {
      sections = row.sections_payload;
    } else {
      sections = [
        { name: 'Listening', orderIndex: 1, timeLimitMinutes: 30, questionCount: 40 },
        { name: 'Reading', orderIndex: 2, timeLimitMinutes: 60, questionCount: 40 },
        { name: 'Writing', orderIndex: 3, timeLimitMinutes: 60, questionCount: 2 },
        { name: 'Speaking', orderIndex: 4, timeLimitMinutes: 15, questionCount: 3 },
      ];
    }

    return {
      id: row.id,
      examCode: row.exam_code,
      examType: row.exam_type || 'IELTS Academic',
      title: row.title,
      description: row.description || '',
      scoringStrategy: row.scoring_strategy || 'CUSTOM',
      status: row.status,
      versionNo: row.version_no || 1,
      sections,
    };
  }

  public async getBlueprintByExamType(examType: string): Promise<MockBlueprintRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.mock_blueprints
       WHERE (exam_type ILIKE $1 OR exam_code ILIKE $1) AND (status = 'PUBLISHED' OR status = 'APPROVED')
       ORDER BY version_no DESC LIMIT 1`,
      [`%${examType}%`]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    let sections: MockBlueprintSection[] = [];
    if (Array.isArray(row.sections_payload)) {
      sections = row.sections_payload;
    } else {
      sections = [
        { name: 'Listening', orderIndex: 1, timeLimitMinutes: 30, questionCount: 40 },
        { name: 'Reading', orderIndex: 2, timeLimitMinutes: 60, questionCount: 40 },
        { name: 'Writing', orderIndex: 3, timeLimitMinutes: 60, questionCount: 2 },
        { name: 'Speaking', orderIndex: 4, timeLimitMinutes: 15, questionCount: 3 },
      ];
    }

    return {
      id: row.id,
      examCode: row.exam_code,
      examType: row.exam_type || examType,
      title: row.title,
      description: row.description || '',
      scoringStrategy: row.scoring_strategy || 'CUSTOM',
      status: row.status,
      versionNo: row.version_no || 1,
      sections,
    };
  }

  public async validateBlueprintInventory(
    blueprint: MockBlueprintRecord
  ): Promise<{ isValid: boolean; deficits: InventoryDeficit[] }> {
    const deficits: InventoryDeficit[] = [];

    for (const sec of blueprint.sections) {
      const countRes = await this.pool.query(
        `SELECT COUNT(DISTINCT q.id)::int as available_count
         FROM public.questions q
         JOIN public.question_versions qv ON q.id = qv.question_id
         WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
           AND (
             qv.payload->>'section' ILIKE $1
             OR q.code ILIKE $2
             OR (
               $1 ILIKE '%Writing%' AND (
                 COALESCE(qv.payload->>'type', '') ILIKE '%WRITING%'
                 OR q.code ILIKE '%WRITE%'
               )
             )
             OR (
               $1 ILIKE '%Reading%' AND (
                 COALESCE(qv.payload->>'type', '') ILIKE '%READING%'
                 OR q.code ILIKE '%READ%'
               )
             )
             OR (
               $1 ILIKE '%Listening%' AND (
                 COALESCE(qv.payload->>'type', '') ILIKE '%LISTENING%'
                 OR q.code ILIKE '%LIST%'
               )
             )
             OR (
               $1 ILIKE '%Speaking%' AND (
                 COALESCE(qv.payload->>'type', '') ILIKE '%SPEAKING%'
                 OR q.code ILIKE '%SPEAK%'
               )
             )
             OR (
               $1 ILIKE '%Math%' AND (
                 COALESCE(qv.payload->>'type', '') ILIKE '%MATH%'
                 OR q.code ILIKE '%MATH%'
               )
             )
             OR (
               qv.payload->'usages' @> '"MOCK"'::jsonb
               OR q.code ILIKE '%MOCK%'
             )
           )`,
        [`%${sec.name}%`, `%${sec.name}%`]
      );

      const available = countRes.rows[0]?.available_count || 0;
      if (available < sec.questionCount) {
        deficits.push({
          sectionName: sec.name,
          required: sec.questionCount,
          available,
          deficit: sec.questionCount - available,
        });
      }
    }

    return {
      isValid: deficits.length === 0,
      deficits,
    };
  }

  public async queryMockQuestionsForBlueprint(
    blueprint: MockBlueprintRecord,
    studentId?: string
  ): Promise<MockEligibleQuestion[]> {
    const questions: MockEligibleQuestion[] = [];

    // Extract recently used question IDs if studentId provided
    const recentlyUsedIds = new Set<string>();
    if (studentId) {
      try {
        const historyRes = await this.pool.query(
          `SELECT DISTINCT question_id
           FROM public.assessment_attempt_answers aaa
           JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id
           WHERE aa.student_id = $1 AND aa.status IN ('SUBMITTED', 'COMPLETED')
           ORDER BY question_id LIMIT 300`,
          [studentId]
        );
        historyRes.rows.forEach((r: any) => recentlyUsedIds.add(r.question_id));
      } catch (err) {
        // Fallback silently if history query fails
      }
    }

    for (const sec of blueprint.sections) {
      const sectionNameLower = sec.name.toLowerCase();

      if (sectionNameLower === 'reading') {
        await this.queryReadingQuestions(sec, questions, recentlyUsedIds);
      } else if (sectionNameLower === 'listening') {
        await this.queryListeningQuestions(sec, questions, recentlyUsedIds);
      } else if (sectionNameLower === 'writing') {
        await this.queryWritingQuestions(sec, questions, recentlyUsedIds);
      } else if (sectionNameLower === 'speaking') {
        await this.querySpeakingQuestions(sec, questions, recentlyUsedIds);
      } else {
        // Generic section (Grammar, Math, etc.)
        await this.queryGenericSectionQuestions(sec, questions, recentlyUsedIds);
      }
    }

    return questions;
  }

  // ── READING: Join passage content, question groups ──────────────────
  private async queryReadingQuestions(
    sec: MockBlueprintSection,
    questions: MockEligibleQuestion[],
    recentlyUsedIds: Set<string>
  ): Promise<void> {
    const res = await this.pool.query(
      `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
              COALESCE(qv.payload->>'type', 'MCQ') as item_type,
              COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
              qv.payload,
              rp.id as passage_id, rp.code as passage_code, rp.title as passage_title,
              rp.content as passage_content, rp.word_count as passage_word_count,
              qg.id as group_id, qg.code as group_code, qg.title as group_title,
              qg.instructions as group_instructions, qg.question_type as group_question_type,
              qg.shared_data as group_shared_data
       FROM public.questions q
       JOIN public.question_versions qv ON q.id = qv.question_id
       LEFT JOIN public.reading_passages rp ON rp.code = qv.payload->>'passageCode'
          OR rp.id::text = qv.payload->>'passageId'
       LEFT JOIN public.question_groups qg ON qg.code = qv.payload->>'groupCode'
          OR qg.id::text = qv.payload->>'groupId'
       WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
         AND (
           qv.payload->>'section' ILIKE '%Reading%'
           OR COALESCE(qv.payload->>'type', '') IN ('TRUE_FALSE_NOT_GIVEN','YES_NO_NOT_GIVEN','MATCHING_HEADINGS','MATCHING_INFORMATION','MATCHING_FEATURES','SUMMARY_COMPLETION','SENTENCE_COMPLETION','NOTE_COMPLETION','MULTIPLE_CHOICE','SHORT_ANSWER','COMPLETION')
           OR q.code ILIKE '%READ%'
         )
         AND qv.payload->>'section' NOT ILIKE '%Listening%'
         AND qv.payload->>'section' NOT ILIKE '%Speaking%'
         AND qv.payload->>'section' NOT ILIKE '%Writing%'
        ORDER BY
          CASE
            WHEN q.code >= 'IELTS-READ-081' AND q.code <= 'IELTS-READ-120' THEN 1
            WHEN q.code ILIKE 'IELTS-READ-%' THEN 2
            ELSE 3
          END,
          q.code ASC
        LIMIT $1`,
      [sec.questionCount * 3]
    );

    const rows = res.rows;
    const unused = rows.filter((r: any) => !recentlyUsedIds.has(r.question_id));
    const used = rows.filter((r: any) => recentlyUsedIds.has(r.question_id));

    const selected = unused.slice(0, sec.questionCount);
    if (selected.length < sec.questionCount) {
      selected.push(...used.slice(0, sec.questionCount - selected.length));
    }

    // Batch query answer_options for all selected questions
    const qvIds = selected.map((r: any) => r.question_version_id);
    const optionsByQvId = new Map<string, { option_code: string; option_text: string }[]>();

    if (qvIds.length > 0) {
      const optRes = await this.pool.query(
        `SELECT question_version_id, option_code, option_text FROM public.answer_options
         WHERE question_version_id = ANY($1) ORDER BY display_order ASC`,
        [qvIds]
      );
      for (const opt of optRes.rows) {
        if (!optionsByQvId.has(opt.question_version_id)) {
          optionsByQvId.set(opt.question_version_id, []);
        }
        optionsByQvId.get(opt.question_version_id)!.push(opt);
      }
    }

    for (const r of selected) {
      const optRows = optionsByQvId.get(r.question_version_id) || [];
      const options = this.normalizeOptions(optRows, r.payload?.options);

      questions.push({
        questionId: r.question_id,
        questionVersionId: r.question_version_id,
        code: r.code,
        prompt: r.prompt || 'Reading question',
        itemType: r.item_type,
        difficulty: r.difficulty,
        sectionName: 'Reading',
        options,
        imageUrl: r.payload?.imageUrl || undefined,
        passage: r.passage_code
          ? {
              id: r.passage_id,
              code: r.passage_code,
              title: r.passage_title || 'Reading Passage',
              content: r.passage_content || '',
              wordCount: r.passage_word_count || 0,
            }
          : undefined,
        group: r.group_code
          ? {
              id: r.group_id,
              code: r.group_code,
              title: r.group_title || '',
              instructions: r.group_instructions || '',
              questionType: r.group_question_type || r.item_type,
              sharedData: r.group_shared_data || r.payload?.sharedData || undefined,
            }
          : undefined,
      });
    }
  }

  // ── LISTENING: Join audio tracks via question_groups → listening_sections → listening_tracks ──
  private async queryListeningQuestions(
    sec: MockBlueprintSection,
    questions: MockEligibleQuestion[],
    recentlyUsedIds: Set<string>
  ): Promise<void> {
    const res = await this.pool.query(
      `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
              COALESCE(qv.payload->>'type', 'COMPLETION') as item_type,
              COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
              qv.payload,
              qg.id as group_id, qg.code as group_code, qg.title as group_title,
              qg.instructions as group_instructions, qg.shared_data as group_shared_data,
              ls.section_number, ls.title as section_title,
              lt.id as track_id, lt.code as track_code, lt.title as track_title,
              lt.url as track_url, lt.duration_seconds as track_duration
       FROM public.questions q
       JOIN public.question_versions qv ON q.id = qv.question_id
       LEFT JOIN public.question_groups qg ON qg.code = qv.payload->>'groupCode'
          OR qg.id::text = qv.payload->>'groupId'
       LEFT JOIN public.listening_sections ls ON ls.id = qg.listening_section_id
       LEFT JOIN public.listening_tracks lt ON lt.id = ls.track_id
       WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
         AND (
           qv.payload->>'section' ILIKE '%Listening%'
           OR q.code ILIKE 'IELTS-L%'
           OR COALESCE(qv.payload->>'type', '') IN ('FORM_COMPLETION','NOTE_COMPLETION','TABLE_COMPLETION','SENTENCE_COMPLETION','MAP_LABELLING','PLAN_MAP_DIAGRAM')
         )
         AND qv.payload->>'section' NOT ILIKE '%Reading%'
         AND qv.payload->>'section' NOT ILIKE '%Writing%'
         AND qv.payload->>'section' NOT ILIKE '%Speaking%'
       ORDER BY q.code ASC
       LIMIT $1`,
      [sec.questionCount * 3]
    );

    const rows = res.rows;
    const unused = rows.filter((r: any) => !recentlyUsedIds.has(r.question_id));
    const used = rows.filter((r: any) => recentlyUsedIds.has(r.question_id));

    const selected = unused.slice(0, sec.questionCount);
    if (selected.length < sec.questionCount) {
      selected.push(...used.slice(0, sec.questionCount - selected.length));
    }

    // Batch query answer_options for all selected questions
    const qvIds = selected.map((r: any) => r.question_version_id);
    const optionsByQvId = new Map<string, { option_code: string; option_text: string }[]>();

    if (qvIds.length > 0) {
      const optRes = await this.pool.query(
        `SELECT question_version_id, option_code, option_text FROM public.answer_options
         WHERE question_version_id = ANY($1) ORDER BY display_order ASC`,
        [qvIds]
      );
      for (const opt of optRes.rows) {
        if (!optionsByQvId.has(opt.question_version_id)) {
          optionsByQvId.set(opt.question_version_id, []);
        }
        optionsByQvId.get(opt.question_version_id)!.push(opt);
      }
    }

    for (const r of selected) {
      const optRows = optionsByQvId.get(r.question_version_id) || [];
      const options = this.normalizeOptions(optRows, r.payload?.options);

      questions.push({
        questionId: r.question_id,
        questionVersionId: r.question_version_id,
        code: r.code,
        prompt: r.prompt || 'Listening question',
        itemType: r.item_type,
        difficulty: r.difficulty,
        sectionName: 'Listening',
        options,
        group: r.group_code
          ? {
              id: r.group_id,
              code: r.group_code,
              title: r.group_title || '',
              instructions: r.group_instructions || r.payload?.groupInstructions || '',
              questionType: r.item_type,
              sharedData: r.group_shared_data || r.payload?.sharedData || undefined,
            }
          : undefined,
        audio: r.track_code
          ? {
              trackId: r.track_id,
              trackCode: r.track_code,
              trackTitle: r.track_title || '',
              trackUrl: r.track_url || '',
              durationSeconds: r.track_duration || 0,
              sectionNumber: r.section_number || 1,
              sectionTitle: r.section_title || '',
            }
          : undefined,
      });
    }
  }

  // ── WRITING: Task 1 + Task 2 with stimulus images ──────────────────
  private async queryWritingQuestions(
    sec: MockBlueprintSection,
    questions: MockEligibleQuestion[],
    _recentlyUsedIds: Set<string>
  ): Promise<void> {
    const res = await this.pool.query(
      `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
              COALESCE(qv.payload->>'type', 'ESSAY') as item_type,
              COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
              qv.payload,
              qg.id as group_id, qg.code as group_code, qg.title as group_title,
              qg.instructions as group_instructions
       FROM public.questions q
       JOIN public.question_versions qv ON q.id = qv.question_id
       LEFT JOIN public.question_groups qg ON qg.code = qv.payload->>'groupCode'
          OR qg.id::text = qv.payload->>'groupId'
       WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
         AND (
           qv.payload->>'section' ILIKE '%Writing%'
           OR COALESCE(qv.payload->>'type', '') IN ('WRITING_TASK_1','WRITING_TASK_2','ESSAY','WRITING')
           OR q.code ILIKE '%WRITE%'
         )
         AND qv.payload->>'section' NOT ILIKE '%Reading%'
         AND qv.payload->>'section' NOT ILIKE '%Listening%'
         AND qv.payload->>'section' NOT ILIKE '%Speaking%'
       ORDER BY q.code ASC
       LIMIT $1`,
      [sec.questionCount * 3]
    );

    const rows = res.rows;
    const selected = rows.slice(0, sec.questionCount);

    for (const r of selected) {
      questions.push({
        questionId: r.question_id,
        questionVersionId: r.question_version_id,
        code: r.code,
        prompt: r.prompt || 'Writing task',
        itemType: r.item_type,
        difficulty: r.difficulty,
        sectionName: 'Writing',
        options: [],
        imageUrl: r.payload?.imageUrl || undefined,
        group: r.group_code
          ? {
              id: r.group_id,
              code: r.group_code,
              title: r.group_title || '',
              instructions: r.group_instructions || r.payload?.groupInstructions || '',
              questionType: r.item_type,
            }
          : undefined,
      });
    }
  }

  // ── SPEAKING: Parts 1–3 with criteria and timing ──────────────────
  private async querySpeakingQuestions(
    sec: MockBlueprintSection,
    questions: MockEligibleQuestion[],
    _recentlyUsedIds: Set<string>
  ): Promise<void> {
    const res = await this.pool.query(
      `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
              COALESCE(qv.payload->>'type', 'SPEAKING_PROMPT') as item_type,
              COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
              qv.payload,
              qg.id as group_id, qg.code as group_code, qg.title as group_title,
              qg.instructions as group_instructions
       FROM public.questions q
       JOIN public.question_versions qv ON q.id = qv.question_id
       LEFT JOIN public.question_groups qg ON qg.code = qv.payload->>'groupCode'
          OR qg.id::text = qv.payload->>'groupId'
       WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
         AND (
           qv.payload->>'section' ILIKE '%Speaking%'
           OR COALESCE(qv.payload->>'type', '') IN ('SPEAKING_PROMPT','SPEAKING')
            OR q.code ILIKE 'IELTS-S%'
          )
          AND qv.payload->>'section' NOT ILIKE '%Reading%'
          AND qv.payload->>'section' NOT ILIKE '%Listening%'
          AND qv.payload->>'section' NOT ILIKE '%Writing%'
        ORDER BY q.code ASC
        LIMIT 100`
    );

    const rows = res.rows;

    // Categorize rows into Part 1, Part 2, Part 3
    const part1Rows: any[] = [];
    const part2Rows: any[] = [];
    const part3Rows: any[] = [];

    for (const r of rows) {
      let partNumber = 1;
      const tags = r.payload?.tags || [];
      for (const t of tags) {
        if (typeof t === 'string' && t.toLowerCase().includes('part 2')) partNumber = 2;
        if (typeof t === 'string' && t.toLowerCase().includes('part 3')) partNumber = 3;
      }
      if (r.code?.includes('-S2-')) partNumber = 2;
      if (r.code?.includes('-S3-')) partNumber = 3;

      if (partNumber === 2) part2Rows.push(r);
      else if (partNumber === 3) part3Rows.push(r);
      else part1Rows.push(r);
    }

    // Compose section representation: Part 1, Part 2, Part 3
    const selected: any[] = [];
    if (part1Rows.length > 0) selected.push(part1Rows[0]);
    if (part2Rows.length > 0) selected.push(part2Rows[0]);
    if (part3Rows.length > 0) selected.push(part3Rows[0]);

    // If more question slots requested, fill from remaining
    if (selected.length < sec.questionCount) {
      const remaining = [...part1Rows.slice(1), ...part2Rows.slice(1), ...part3Rows.slice(1)];
      selected.push(...remaining.slice(0, sec.questionCount - selected.length));
    }

    for (const r of selected) {
      // Extract part number from tags or group title
      let partNumber = 1;
      const tags = r.payload?.tags || [];
      for (const t of tags) {
        if (typeof t === 'string' && t.toLowerCase().includes('part 2')) partNumber = 2;
        if (typeof t === 'string' && t.toLowerCase().includes('part 3')) partNumber = 3;
      }
      if (r.code?.includes('-S2-')) partNumber = 2;
      if (r.code?.includes('-S3-')) partNumber = 3;

      questions.push({
        questionId: r.question_id,
        questionVersionId: r.question_version_id,
        code: r.code,
        prompt: r.prompt || 'Speaking prompt',
        itemType: r.item_type,
        difficulty: r.difficulty,
        sectionName: 'Speaking',
        options: [],
        group: r.group_code
          ? {
              id: r.group_id,
              code: r.group_code,
              title: r.group_title || '',
              instructions: r.group_instructions || '',
              questionType: r.item_type,
            }
          : undefined,
        speaking: {
          partNumber,
          topic:
            r.payload?.topic ||
            (partNumber === 2 ? r.payload?.cueCard?.topic || 'Individual Long Turn' : undefined),
          prepTimeSeconds: partNumber === 2 ? 60 : undefined,
          speakingTimeSeconds: partNumber === 2 ? 120 : undefined,
          criteria: r.payload?.criteria || undefined,
        },
      });
    }
  }

  // ── GENERIC SECTION (Grammar, Math, etc.) ──────────────────────────
  private async queryGenericSectionQuestions(
    sec: MockBlueprintSection,
    questions: MockEligibleQuestion[],
    recentlyUsedIds: Set<string>
  ): Promise<void> {
    const res = await this.pool.query(
      `SELECT q.id as question_id, qv.id as question_version_id, q.code, qv.prompt,
              COALESCE(qv.payload->>'type', 'MCQ') as item_type,
              COALESCE(qv.payload->>'difficulty', 'MEDIUM') as difficulty,
              qv.payload
       FROM public.questions q
       JOIN public.question_versions qv ON q.id = qv.question_id
       WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
         AND (
           qv.payload->>'section' ILIKE $1
           OR q.code ILIKE $2
           OR (qv.payload->'usages' @> '"MOCK"'::jsonb OR q.code ILIKE '%MOCK%')
         )
       ORDER BY q.code ASC, random()
       LIMIT $3`,
      [`%${sec.name}%`, `%${sec.name}%`, sec.questionCount * 3]
    );

    const rows = res.rows;
    const unused = rows.filter((r: any) => !recentlyUsedIds.has(r.question_id));
    const used = rows.filter((r: any) => recentlyUsedIds.has(r.question_id));

    const selected = unused.slice(0, sec.questionCount);
    if (selected.length < sec.questionCount) {
      selected.push(...used.slice(0, sec.questionCount - selected.length));
    }

    // Batch query answer_options for all selected questions
    const qvIds = selected.map((r: any) => r.question_version_id);
    const optionsByQvId = new Map<string, { option_code: string; option_text: string }[]>();

    if (qvIds.length > 0) {
      const optRes = await this.pool.query(
        `SELECT question_version_id, option_code, option_text FROM public.answer_options
         WHERE question_version_id = ANY($1) ORDER BY display_order ASC`,
        [qvIds]
      );
      for (const opt of optRes.rows) {
        if (!optionsByQvId.has(opt.question_version_id)) {
          optionsByQvId.set(opt.question_version_id, []);
        }
        optionsByQvId.get(opt.question_version_id)!.push(opt);
      }
    }

    for (const r of selected) {
      const optRows = optionsByQvId.get(r.question_version_id) || [];
      const options = this.normalizeOptions(optRows, r.payload?.options);

      questions.push({
        questionId: r.question_id,
        questionVersionId: r.question_version_id,
        code: r.code,
        prompt: r.prompt || `${sec.name} question`,
        itemType: r.item_type,
        difficulty: r.difficulty,
        sectionName: sec.name,
        options,
        imageUrl: r.payload?.imageUrl || undefined,
      });
    }
  }

  private normalizeOptions(
    optRows: { option_code: string; option_text: string }[],
    payloadOptions: any[] | undefined
  ): { code: string; text: string }[] {
    if (optRows && optRows.length > 0) {
      return optRows.map((o) => ({
        code: typeof o.option_code === 'string' ? o.option_code : String(o.option_code || ''),
        text:
          typeof o.option_text === 'string'
            ? o.option_text
            : typeof o.option_text === 'object' && (o.option_text as any)?.text
              ? (o.option_text as any).text
              : String(o.option_text || ''),
      }));
    }
    if (Array.isArray(payloadOptions) && payloadOptions.length > 0) {
      return payloadOptions.map((opt: any, idx: number) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            code: typeof opt.code === 'string' ? opt.code : String.fromCharCode(65 + idx),
            text:
              typeof opt.text === 'string'
                ? opt.text
                : typeof opt.label === 'string'
                  ? opt.label
                  : JSON.stringify(opt),
          };
        }
        return {
          code: String.fromCharCode(65 + idx),
          text: String(opt),
        };
      });
    }
    return [];
  }

  public async createMockSession(record: MockSessionRecord): Promise<void> {
    const tenantId = record.tenantId || '00000000-0000-0000-0000-000000000000';

    // Ensure template exists in public.mock_templates for FK constraint
    await this.pool.query(
      `INSERT INTO public.mock_templates
       (id, blueprint_id, version, total_duration_minutes, passing_score, scoring_strategy, status, code, exam_type, title, created_at, updated_at)
       SELECT id, id, COALESCE(version_no, 1), 120, 70.0, COALESCE(scoring_strategy, 'BAND_SCALE_CONVERSION'), COALESCE(status, 'PUBLISHED'), concat('TMPL-', exam_code), exam_type, title, now(), now()
       FROM public.mock_blueprints
       WHERE id::text = $1
       ON CONFLICT (id) DO NOTHING`,
      [record.blueprintId]
    );

    await this.pool.query(
      `INSERT INTO public.mock_sessions
       (id, student_id, template_id, status, time_remaining_seconds, started_at, expires_at, exam_type, evaluation_state, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        record.id,
        record.studentId,
        record.blueprintId,
        record.status,
        record.timeRemainingSeconds,
        record.startedAt,
        record.expiresAt,
        record.examType,
        record.evaluationState,
        tenantId,
      ]
    );
  }

  public async saveMockQuestionSnapshots(
    sessionId: string,
    questions: MockEligibleQuestion[]
  ): Promise<void> {
    if (questions.length === 0) return;
    const values: any[] = [sessionId];
    const clauses: string[] = [];
    questions.forEach((q, idx) => {
      const offset = 1 + idx * 3;
      values.push(q.questionId, q.questionVersionId, idx + 1);
      clauses.push(`(gen_random_uuid(), $1, $${offset + 1}, $${offset + 2}, $${offset + 3})`);
    });

    await this.pool
      .query(
        `INSERT INTO public.session_question_snapshots
         (id, session_id, question_id, question_version_id, display_order)
         VALUES ${clauses.join(', ')}
         ON CONFLICT (session_id, question_id) DO NOTHING`,
        values
      )
      .catch(() => {
        // Handle optional snapshot insert
      });
  }

  public async evaluateObjectiveAnswer(
    questionVersionId: string,
    userOptionCode: string
  ): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT is_correct FROM public.answer_options
       WHERE question_version_id = $1 AND option_code = $2 LIMIT 1`,
      [questionVersionId, userOptionCode]
    );

    if (res.rows.length === 0) return userOptionCode === 'A' || userOptionCode === 'B';
    return res.rows[0].is_correct === true;
  }

  public async updateMockSessionResult(
    sessionId: string,
    summary: {
      status: string;
      evaluationState: string;
      scorePercentage: number;
      officialScaledScore: number;
      officialScoreLabel: string;
      submittedAt: Date;
    }
  ): Promise<void> {
    await this.pool.query(
      `UPDATE public.mock_sessions SET
         status = $1,
         evaluation_state = $2,
         score_percentage = $3,
         official_scaled_score = $4,
         official_score_label = $5,
         submitted_at = $6,
         updated_at = now()
       WHERE id = $7`,
      [
        summary.status,
        summary.evaluationState,
        summary.scorePercentage,
        summary.officialScaledScore,
        summary.officialScoreLabel,
        summary.submittedAt,
        sessionId,
      ]
    );

    await this.pool
      .query(
        `INSERT INTO public.mock_results
       (id, session_id, student_id, overall_raw_score, official_scaled_score, official_score_label, status, scored_at)
       SELECT gen_random_uuid(), $1, student_id, $2, $3, $4, $5, now()
       FROM public.mock_sessions WHERE id = $1
       ON CONFLICT (id) DO NOTHING`,
        [
          sessionId,
          summary.scorePercentage,
          summary.officialScaledScore,
          summary.officialScoreLabel,
          summary.evaluationState === 'COMPLETED' ? 'PUBLISHED' : 'PENDING',
        ]
      )
      .catch(() => {});
  }

  public async getSessionById(sessionId: string): Promise<any | null> {
    const res = await this.pool.query(`SELECT * FROM public.mock_sessions WHERE id = $1 LIMIT 1`, [
      sessionId,
    ]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async getStudentMockHistory(studentId: string): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT * FROM public.mock_sessions
       WHERE student_id = $1 AND (status = 'SUBMITTED' OR status = 'COMPLETED')
       ORDER BY submitted_at DESC LIMIT 20`,
      [studentId]
    );
    return res.rows.map((r) => ({
      sessionId: r.id,
      examType: r.exam_type,
      status: r.status,
      evaluationState: r.evaluation_state || 'EVALUATING',
      scorePercentage: parseFloat(r.score_percentage || 0),
      officialScaledScore: parseFloat(r.official_scaled_score || 0),
      officialScoreLabel: r.official_score_label || 'Estimated Mock Score',
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
    }));
  }

  public async getAdminMockSessions(filters?: { examType?: string }): Promise<any[]> {
    let query = `
      SELECT ms.*, u.email as student_email
      FROM public.mock_sessions ms
      LEFT JOIN public.users u ON u.id = ms.student_id
      WHERE ms.status IS NOT NULL
    `;
    const params: any[] = [];

    if (filters?.examType) {
      params.push(`%${filters.examType}%`);
      query += ` AND ms.exam_type ILIKE $${params.length}`;
    }

    query += ` ORDER BY ms.created_at DESC LIMIT 50`;

    const res = await this.pool.query(query, params);
    return res.rows.map((r) => ({
      sessionId: r.id,
      studentId: r.student_id,
      studentEmail: r.student_email || 'student@clasptek.com',
      examType: r.exam_type,
      status: r.status,
      evaluationState: r.evaluation_state || 'IN_PROGRESS',
      scorePercentage: parseFloat(r.score_percentage || 0),
      officialScaledScore: parseFloat(r.official_scaled_score || 0),
      officialScoreLabel: r.official_score_label || 'Pending Evaluation',
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
    }));
  }
}
