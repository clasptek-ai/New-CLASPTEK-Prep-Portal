import { Pool } from 'pg';

export type ContentKind = 'QUESTION' | 'WRITING_TASK' | 'SPEAKING_PROMPT';

export type AssessmentCategory =
  'Pre-Assessment' | 'IELTS Mock' | 'IELTS Practice' | 'Other / Unclassified';

export type AssessmentSource = 'authoritative' | 'inferred' | 'unclassified';

export interface AuthoritativeAnswer {
  type: 'OPTION_CODE' | 'TEXT' | 'ARRAY' | 'MAPPING' | 'RUBRIC' | 'NONE';
  primary?: string;
  optionCode?: string;
  acceptedAnswers?: string[];
  mapping?: Record<string, string>;
  rubricId?: string;
  display: string;
  isMissing: boolean;
}

export interface AdminNormalizedContent {
  id: string;
  code: string;
  contentKind: ContentKind;
  exam: string;
  section: string;
  assessment: AssessmentCategory;
  assessmentSource: AssessmentSource;
  skill: string;
  subSkill?: string;
  type: string;
  difficulty: string;
  proficiencyLevel?: string | null;
  status: 'PUBLISHED' | 'APPROVED' | 'UNDER_REVIEW' | 'DRAFT' | 'ARCHIVED';
  usages: string[];
  estimatedTime: string;
  officialSource: string;
  version: string;
  tags: string[];
  text: string;
  instructions?: string;
  options?: string[];
  answer: AuthoritativeAnswer;
  explanation?: string;

  // Passage dependencies
  passageId?: string | null;
  passageCode?: string | null;
  passageTitle?: string | null;
  passageContent?: string | null;
  passageWordCount?: number | null;
  linkedQuestionCount?: number | null;
  passageStatus: 'RESOLVED' | 'UNRESOLVED_DEPENDENCY' | 'NONE';

  // Audio / Media dependencies
  audioUrl?: string | null;
  trackTitle?: string | null;
  transcript?: string | null;
  sectionNumber?: number | null;
  questionRange?: string | null;
  imageUrl?: string | null;

  // Writing Task specifics
  wordLimit?: { min?: number | null; max?: number | null };
  rubrics?: Array<{ criterion: string; bandScore: string; descriptor: string }>;
  referenceResponse?: string | null;

  // Speaking Prompt specifics
  partNumber?: number | null;
  cueCard?: any;
  timing?: { preparationSeconds: number; speakingSeconds: number };
  criteria?: any[];

  createdAt: string;
  updatedAt: string;
}

export interface InventoryMetrics {
  totalUniqueQuestions: number;
  totalQuestionVersions: number;
  totalWritingTasks: number;
  totalReadingPassages: number;
  totalListeningSections: number;
  publishedCount: number;
  draftCount: number;
  underReviewCount: number;
  approvedCount: number;
  archivedCount: number;

  answersPresentCount: number;
  answersMissingCount: number;

  passagesResolvedCount: number;
  passagesUnresolvedCount: number;

  mediaResolvedCount: number;
  mediaMissingCount: number;

  tree: {
    preAssessment: {
      total: number;
      grammar: number;
      reading: number;
      writing: number;
    };
    ieltsMock: {
      total: number;
      listening: number;
      reading: number;
      writing: number;
      speaking: number;
    };
    ieltsPractice: {
      total: number;
      reading: number;
      diagnosticReading: number;
    };
    otherUnclassified: {
      total: number;
      items: number;
    };
  };

  reconciliation: {
    totalAccounted: number;
    databaseTotal: number;
    isReconciled: boolean;
  };
}

export interface ContentFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  exam?: string;
  section?: string;
  difficulty?: string;
  assessment?: string;
  contentKind?: string;
  questionType?: string;
  dependency?: string;
}

export class ContentNormalizer {
  /**
   * Main entry point to fetch and normalize all content from PostgreSQL.
   */
  public static async getNormalizedContent(
    pool: Pool,
    filters?: ContentFilterOptions
  ): Promise<{
    items: AdminNormalizedContent[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    metrics: InventoryMetrics;
  }> {
    // 1. Fetch Passages
    const passagesRes = await pool.query(`
      SELECT id, code, title, content, exam_type, section, source, word_count, status
      FROM public.reading_passages
    `);
    const passagesByCode = new Map<string, any>();
    const passagesById = new Map<string, any>();
    passagesRes.rows.forEach((p) => {
      if (p.code) passagesByCode.set(p.code, p);
      if (p.id) passagesById.set(p.id, p);
    });

    // 2. Fetch Listening Sections & Tracks
    const listeningRes = await pool.query(`
      SELECT ls.id as section_id, ls.section_number, ls.title as section_title,
             ls.start_seconds, ls.end_seconds, ls.instructions,
             lt.id as track_id, lt.code as track_code, lt.title as track_title,
             lt.url as track_url, lt.duration_seconds, lt.transcript
      FROM public.listening_sections ls
      LEFT JOIN public.listening_tracks lt ON lt.id = ls.track_id
      ORDER BY ls.section_number ASC
    `);
    const listeningByPart = new Map<number, any>();
    listeningRes.rows.forEach((l) => {
      listeningByPart.set(l.section_number, l);
    });

    // 3. Fetch Media Assets & Question Media Links
    const mediaLinksRes = await pool.query(`
      SELECT qml.question_version_id, qml.question_id, qml.association_type,
             ma.id as media_id, ma.code as media_code, ma.title as media_title,
             ma.url as media_url, ma.type as media_type
      FROM public.question_media_links qml
      JOIN public.media_assets ma ON ma.id = qml.media_asset_id
    `);
    const mediaByVersion = new Map<string, any>();
    const mediaByQuestion = new Map<string, any>();
    mediaLinksRes.rows.forEach((m) => {
      if (m.question_version_id) mediaByVersion.set(m.question_version_id, m);
      if (m.question_id) mediaByQuestion.set(m.question_id, m);
    });

    // 4. Fetch Writing Band Rubrics
    const rubricsRes = await pool.query(`
      SELECT id, task_id, criterion, band_score, descriptor
      FROM public.writing_band_rubrics
      ORDER BY task_id, criterion, band_score DESC
    `);
    const rubricsByTask = new Map<string, any[]>();
    rubricsRes.rows.forEach((r) => {
      if (!rubricsByTask.has(r.task_id)) rubricsByTask.set(r.task_id, []);
      rubricsByTask.get(r.task_id)!.push(r);
    });

    // 5. Fetch Answer Options
    const optRes = await pool.query(`
      SELECT question_version_id, option_code, option_text, is_correct, display_order
      FROM public.answer_options
      ORDER BY display_order ASC
    `);
    const optionsByVersion = new Map<string, any[]>();
    optRes.rows.forEach((o) => {
      if (!optionsByVersion.has(o.question_version_id)) {
        optionsByVersion.set(o.question_version_id, []);
      }
      optionsByVersion.get(o.question_version_id)!.push(o);
    });

    // 6. Fetch all Question records with Question Versions (including versionless orphans)
    const questionsRes = await pool.query(`
      SELECT 
        q.id as question_id,
        q.code,
        qv.id as version_id,
        qv.version_no,
        qv.status,
        qv.prompt,
        qv.proficiency_level,
        qv.grammar_topic,
        qv.grammar_subtopic,
        qv.payload,
        q.created_at,
        q.updated_at
      FROM public.questions q
      LEFT JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
      ORDER BY q.code ASC
    `);

    // 7. Fetch Writing Tasks from public.writing_tasks
    const writingTasksRes = await pool.query(`
      SELECT id, code, exam_type, task_number, title, prompt, instructions,
             min_words, max_words, time_recommended_minutes, model_answer,
             created_at, updated_at
      FROM public.writing_tasks
      ORDER BY task_number ASC
    `);

    // Compute linked question count for passages
    const passageQuestionCountMap = new Map<string, number>();
    questionsRes.rows.forEach((r) => {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      const pCode = payload.passageCode;
      const pId = payload.passageId || payload.passage_id;
      if (pCode) {
        passageQuestionCountMap.set(pCode, (passageQuestionCountMap.get(pCode) || 0) + 1);
      }
      if (pId) {
        passageQuestionCountMap.set(pId, (passageQuestionCountMap.get(pId) || 0) + 1);
      }
    });

    // Normalize Questions
    const normalizedList: AdminNormalizedContent[] = [];

    // Process questions from public.questions
    for (const r of questionsRes.rows) {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      const qCode = r.code || '';
      const versionId = r.version_id;
      const optionsForVer = versionId ? optionsByVersion.get(versionId) || [] : [];
      const tags: string[] = Array.isArray(payload.tags) ? payload.tags : [];

      // Determine Content Kind
      let contentKind: ContentKind = 'QUESTION';
      const rawType = (payload.type || payload.questionType || '').toUpperCase();
      if (rawType === 'SPEAKING_PROMPT' || qCode.startsWith('IELTS-S')) {
        contentKind = 'SPEAKING_PROMPT';
      } else if (rawType.startsWith('WRITING_TASK') || qCode.startsWith('IELTS-W')) {
        contentKind = 'WRITING_TASK';
      }

      // Section Normalization
      let section = 'Grammar';
      if (
        qCode.startsWith('IELTS-L') ||
        tags.includes('Listening') ||
        payload.section?.toLowerCase() === 'listening'
      ) {
        section = 'Listening';
      } else if (
        qCode.startsWith('IELTS-READ') ||
        qCode.startsWith('IELTS-MOCK-READ') ||
        qCode.startsWith('Q-READ') ||
        payload.passageCode ||
        payload.passageId ||
        payload.passage_id ||
        tags.includes('Reading') ||
        payload.section?.toLowerCase() === 'reading'
      ) {
        section = 'Reading';
      } else if (
        qCode.startsWith('IELTS-W') ||
        tags.includes('Writing') ||
        payload.section?.toLowerCase() === 'writing'
      ) {
        section = 'Writing';
      } else if (
        qCode.startsWith('IELTS-S') ||
        tags.includes('Speaking') ||
        payload.section?.toLowerCase() === 'speaking'
      ) {
        section = 'Speaking';
      } else if (
        qCode.startsWith('GRAM-') ||
        qCode.startsWith('INT-GRM-') ||
        tags.includes('GRAMMAR') ||
        payload.section?.toLowerCase() === 'grammar'
      ) {
        section = 'Grammar';
      } else if (payload.section) {
        const raw = String(payload.section);
        section = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      }

      // Exam Normalization
      let exam = 'IELTS Academic';
      if (
        section === 'Grammar' ||
        qCode.startsWith('Q-READ-') ||
        qCode.startsWith('GRAM-') ||
        qCode.startsWith('INT-GRM-') ||
        (payload.passageCode && payload.passageCode.startsWith('PAS-DIAG-'))
      ) {
        exam = 'English Proficiency';
      } else if (tags[0]) {
        exam = tags[0];
      } else if (payload.examType) {
        exam = payload.examType;
      }

      // Authoritative Assessment Hierarchy
      let assessment: AssessmentCategory = 'Other / Unclassified';
      let assessmentSource: AssessmentSource = 'unclassified';

      const usages: string[] = Array.isArray(payload.usages) ? payload.usages : [];
      const passageCode = payload.passageCode || null;

      if (!versionId || qCode.startsWith('Q-MANUAL-') || qCode.startsWith('Q-TENANT-')) {
        assessment = 'Other / Unclassified';
        assessmentSource = 'unclassified';
      } else if (passageCode?.startsWith('PAS-READ-') || qCode.startsWith('IELTS-READ-')) {
        assessment = 'IELTS Practice';
        assessmentSource =
          passageCode?.startsWith('PAS-READ-') || usages.includes('PRACTICE')
            ? 'authoritative'
            : 'inferred';
      } else if (
        passageCode?.startsWith('PAS-DIAG-') ||
        (usages.includes('DIAGNOSTIC') &&
          (qCode.startsWith('GRAM-') || qCode.startsWith('INT-GRM-') || section === 'Grammar')) ||
        (section === 'Grammar' &&
          (qCode.startsWith('GRAM-') ||
            qCode.startsWith('INT-GRM-') ||
            exam === 'English Proficiency'))
      ) {
        assessment = 'Pre-Assessment';
        assessmentSource =
          usages.includes('DIAGNOSTIC') || passageCode?.startsWith('PAS-DIAG-')
            ? 'authoritative'
            : 'inferred';
      } else if (
        passageCode?.startsWith('PAS-MOCK-') ||
        qCode.startsWith('IELTS-MOCK-READ-') ||
        qCode.startsWith('IELTS-WRITE-') ||
        qCode.startsWith('IELTS-L') ||
        qCode.startsWith('IELTS-S') ||
        usages.includes('MOCK')
      ) {
        assessment = 'IELTS Mock';
        assessmentSource =
          usages.includes('MOCK') ||
          passageCode?.startsWith('PAS-MOCK-') ||
          qCode.startsWith('IELTS-MOCK-READ-')
            ? 'authoritative'
            : 'inferred';
      } else if (qCode.startsWith('Q-READ-') || usages.includes('PRACTICE')) {
        assessment = 'IELTS Practice';
        assessmentSource = usages.includes('PRACTICE') ? 'authoritative' : 'inferred';
      } else {
        assessment = 'Other / Unclassified';
        assessmentSource = 'unclassified';
      }

      // Authoritative Answer Extraction
      const rawCorrect = payload.correctAnswer || payload.answer || null;
      const rawCorrectArr =
        payload.correct_answers || payload.acceptedAnswers || payload.acceptableAnswers || [];
      const acceptedAnswers: string[] = Array.isArray(rawCorrectArr)
        ? rawCorrectArr.map(String)
        : rawCorrect
          ? [String(rawCorrect)]
          : [];

      let answerObj: AuthoritativeAnswer;
      if (contentKind === 'WRITING_TASK') {
        answerObj = {
          type: 'RUBRIC',
          display: 'Official Band Rubrics',
          isMissing: false,
        };
      } else if (contentKind === 'SPEAKING_PROMPT') {
        answerObj = {
          type: 'RUBRIC',
          display: 'Oral Delivery Band Criteria',
          isMissing: false,
        };
      } else {
        // Objective Question
        const correctOpt = optionsForVer.find((o) => o.is_correct);
        if (correctOpt) {
          answerObj = {
            type: 'OPTION_CODE',
            primary: correctOpt.option_text,
            optionCode: correctOpt.option_code,
            acceptedAnswers: [correctOpt.option_text],
            display: `${correctOpt.option_code}: ${correctOpt.option_text}`,
            isMissing: false,
          };
        } else if (rawCorrect || acceptedAnswers.length > 0) {
          const primary = String(rawCorrect || acceptedAnswers[0] || '');
          const isSingleCode = /^[A-E]$/i.test(primary);
          answerObj = {
            type: acceptedAnswers.length > 1 ? 'ARRAY' : isSingleCode ? 'OPTION_CODE' : 'TEXT',
            primary,
            optionCode: isSingleCode ? primary.toUpperCase() : undefined,
            acceptedAnswers: acceptedAnswers.length > 0 ? acceptedAnswers : [primary],
            display: acceptedAnswers.length > 0 ? acceptedAnswers.join(' | ') : primary,
            isMissing: primary.trim().length === 0,
          };
        } else {
          answerObj = {
            type: 'NONE',
            display: 'Missing Answer Key',
            isMissing: true,
          };
        }
      }

      // Passage Resolution
      let resolvedPassage: any = null;
      let passageStatus: 'RESOLVED' | 'UNRESOLVED_DEPENDENCY' | 'NONE' = 'NONE';
      const targetPassageCode = payload.passageCode || null;
      const targetPassageId = payload.passageId || payload.passage_id || null;

      if (targetPassageCode || targetPassageId) {
        if (targetPassageCode && passagesByCode.has(targetPassageCode)) {
          resolvedPassage = passagesByCode.get(targetPassageCode);
          passageStatus = 'RESOLVED';
        } else if (targetPassageId && passagesById.has(targetPassageId)) {
          resolvedPassage = passagesById.get(targetPassageId);
          passageStatus = 'RESOLVED';
        } else {
          passageStatus = 'UNRESOLVED_DEPENDENCY';
        }
      }

      // Audio Track & Listening Section Resolution
      let audioUrl: string | null = payload.audioUrl || payload.audio_url || null;
      let trackTitle: string | null = null;
      let transcript: string | null = payload.transcript || null;
      let sectionNumber: number | null = payload.partNumber || payload.sectionNumber || null;
      let questionRange: string | null = null;

      if (section === 'Listening' || qCode.startsWith('IELTS-L')) {
        let partNum = sectionNumber;
        if (!partNum) {
          const match = qCode.match(/IELTS-L(\d)-/);
          if (match && match[1]) partNum = parseInt(match[1], 10);
        }
        if (partNum && listeningByPart.has(partNum)) {
          const lData = listeningByPart.get(partNum);
          sectionNumber = partNum;
          trackTitle = lData.section_title || lData.track_title;
          audioUrl = audioUrl || lData.track_url;
          transcript = transcript || lData.transcript;
          if (partNum === 1) questionRange = 'Questions 1–10';
          else if (partNum === 2) questionRange = 'Questions 11–20';
          else if (partNum === 3) questionRange = 'Questions 21–30';
          else if (partNum === 4) questionRange = 'Questions 31–40';
        }
      }

      // Media Asset Resolution
      let imageUrl: string | null = payload.imageUrl || null;
      const linkedMedia =
        (versionId && mediaByVersion.get(versionId)) || mediaByQuestion.get(r.question_id);
      if (linkedMedia) {
        if (linkedMedia.media_type === 'IMAGE') imageUrl = imageUrl || linkedMedia.media_url;
        if (linkedMedia.media_type === 'AUDIO') audioUrl = audioUrl || linkedMedia.media_url;
      }
      if (!imageUrl && qCode === 'IELTS-WRITE-001') {
        imageUrl = '/images/stimuli/rough-diamond-process.png';
      }

      // Speaking Specifics
      const cueCard = payload.cueCard || null;
      const timing = payload.speakingSeconds
        ? {
            preparationSeconds: payload.preparationSeconds || 60,
            speakingSeconds: payload.speakingSeconds || 120,
          }
        : undefined;
      const criteria = payload.criteria || null;
      let partNumber = payload.partNumber || null;
      if (contentKind === 'SPEAKING_PROMPT') {
        if (qCode.includes('-S1-')) partNumber = 1;
        else if (qCode.includes('-S2-')) partNumber = 2;
        else if (qCode.includes('-S3-')) partNumber = 3;
      }

      // Options
      const options = optionsForVer.map((o) => o.option_text);
      if (options.length === 0 && Array.isArray(payload.options) && payload.options.length > 0) {
        options.push(...payload.options.map(String));
      }

      const statusUpper = (r.status || 'DRAFT').toUpperCase() as any;

      normalizedList.push({
        id: r.question_id,
        code: qCode,
        contentKind,
        exam,
        section,
        assessment,
        assessmentSource,
        skill: r.grammar_topic || payload.skill || payload.topic || section,
        subSkill: r.grammar_subtopic || payload.subSkill || '',
        type: payload.type || payload.questionType || (options.length > 0 ? 'MCQ' : 'SHORT_ANSWER'),
        difficulty: payload.difficulty || r.proficiency_level || 'MEDIUM',
        proficiencyLevel: r.proficiency_level || payload.proficiencyLevel || null,
        status:
          statusUpper === 'PUBLISHED'
            ? 'PUBLISHED'
            : statusUpper === 'APPROVED'
              ? 'APPROVED'
              : statusUpper === 'UNDER_REVIEW'
                ? 'UNDER_REVIEW'
                : 'DRAFT',
        usages,
        estimatedTime: payload.estimatedTime || '1.5 mins',
        officialSource: payload.officialSource || 'Clasptek Question Bank',
        version: r.version_no ? `v${r.version_no}.0` : 'v1.0',
        tags,
        text: r.prompt || (versionId ? '' : '[Incomplete Draft: Missing Question Version]'),
        instructions: payload.instructions || payload.groupInstructions || undefined,
        options,
        answer: answerObj,
        explanation: payload.explanation || undefined,

        passageId: targetPassageId,
        passageCode: targetPassageCode,
        passageTitle: resolvedPassage?.title || payload.passageTitle || null,
        passageContent: resolvedPassage?.content || null,
        passageWordCount: resolvedPassage?.word_count || null,
        linkedQuestionCount: targetPassageCode
          ? passageQuestionCountMap.get(targetPassageCode) || null
          : null,
        passageStatus,

        audioUrl,
        trackTitle,
        transcript,
        sectionNumber,
        questionRange,
        imageUrl,

        wordLimit:
          payload.min_words || payload.max_words
            ? { min: payload.min_words, max: payload.max_words }
            : qCode === 'IELTS-WRITE-001'
              ? { min: 150, max: undefined }
              : qCode === 'IELTS-WRITE-002'
                ? { min: 250, max: undefined }
                : undefined,
        rubrics: payload.rubric
          ? [payload.rubric]
          : qCode === 'IELTS-WRITE-001' || payload.type === 'WRITING_TASK_1'
            ? (rubricsByTask.get('f0000000-0000-0000-0000-000000000001') || []).map((r) => ({
                criterion: r.criterion,
                bandScore: String(r.band_score),
                descriptor: r.descriptor,
              }))
            : qCode === 'IELTS-WRITE-002' || payload.type === 'WRITING_TASK_2'
              ? (rubricsByTask.get('f0000000-0000-0000-0000-000000000002') || []).map((r) => ({
                  criterion: r.criterion,
                  bandScore: String(r.band_score),
                  descriptor: r.descriptor,
                }))
              : undefined,
        referenceResponse: payload.modelAnswer || payload.sampleResponse || null,

        partNumber,
        cueCard,
        timing,
        criteria,

        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      });
    }

    // Process Pre-Assessment Writing Tasks from public.writing_tasks
    for (const wt of writingTasksRes.rows) {
      const taskRubrics = rubricsByTask.get(wt.id) || [];
      const rubricsFormatted = taskRubrics.map((r) => ({
        criterion: r.criterion,
        bandScore: String(r.band_score),
        descriptor: r.descriptor,
      }));

      normalizedList.push({
        id: wt.id,
        code: wt.code,
        contentKind: 'WRITING_TASK',
        exam: wt.exam_type || 'English Proficiency',
        section: 'Writing',
        assessment: 'Pre-Assessment',
        assessmentSource: 'authoritative',
        skill: wt.task_number === 1 ? 'Letter Writing' : 'Discursive Essay',
        subSkill: `Task ${wt.task_number}`,
        type: wt.task_number === 1 ? 'WRITING_TASK_1' : 'WRITING_TASK_2',
        difficulty: 'INTERMEDIATE',
        proficiencyLevel: 'INTERMEDIATE',
        status: 'PUBLISHED',
        usages: ['DIAGNOSTIC'],
        estimatedTime: wt.time_recommended_minutes
          ? `${wt.time_recommended_minutes} mins`
          : '20 mins',
        officialSource: 'Clasptek Pre-Assessment Bank',
        version: 'v1.0',
        tags: ['English Proficiency', 'Writing', `Task ${wt.task_number}`],
        text: wt.prompt,
        instructions: wt.instructions,
        options: [],
        answer: {
          type: 'RUBRIC',
          rubricId: wt.id,
          display: 'Writing Band Assessment Rubric',
          isMissing: false,
        },
        explanation: `Task ${wt.task_number} evaluates task achievement, coherence and cohesion, lexical resource, and grammatical accuracy.`,
        passageStatus: 'NONE',
        wordLimit: { min: wt.min_words, max: wt.max_words },
        rubrics: rubricsFormatted,
        referenceResponse: wt.model_answer || null,
        createdAt: wt.created_at ? new Date(wt.created_at).toISOString() : new Date().toISOString(),
        updatedAt: wt.updated_at ? new Date(wt.updated_at).toISOString() : new Date().toISOString(),
      });
    }

    // Dynamic Inventory Metrics Aggregation across 100% of items
    let answersPresent = 0;
    let answersMissing = 0;
    let passagesResolved = 0;
    let passagesUnresolved = 0;
    let mediaResolved = 0;
    let mediaMissing = 0;

    let publishedCount = 0;
    let draftCount = 0;
    let underReviewCount = 0;
    let approvedCount = 0;
    let archivedCount = 0;

    let paGrammar = 0;
    let paReading = 0;
    let paWriting = 0;

    let mockListening = 0;
    let mockReading = 0;
    let mockWriting = 0;
    let mockSpeaking = 0;

    let practiceReading = 0;
    let practiceDiagReading = 0;
    let otherCount = 0;

    normalizedList.forEach((item) => {
      // Status
      if (item.status === 'PUBLISHED') publishedCount++;
      else if (item.status === 'DRAFT') draftCount++;
      else if (item.status === 'UNDER_REVIEW') underReviewCount++;
      else if (item.status === 'APPROVED') approvedCount++;
      else if (item.status === 'ARCHIVED') archivedCount++;

      // Answers
      if (item.contentKind === 'QUESTION') {
        if (!item.answer.isMissing) answersPresent++;
        else answersMissing++;
      } else {
        answersPresent++; // Writing and Speaking evaluated via rubrics
      }

      // Passages
      if (item.passageStatus === 'RESOLVED') passagesResolved++;
      else if (item.passageStatus === 'UNRESOLVED_DEPENDENCY') passagesUnresolved++;

      // Media
      if (item.audioUrl || item.imageUrl) mediaResolved++;
      else if (item.section === 'Listening' && !item.audioUrl) mediaMissing++;

      // Tree categorization
      if (item.assessment === 'Pre-Assessment') {
        if (item.section === 'Grammar') paGrammar++;
        else if (item.section === 'Reading') paReading++;
        else if (item.section === 'Writing') paWriting++;
      } else if (item.assessment === 'IELTS Mock') {
        if (item.section === 'Listening') mockListening++;
        else if (item.section === 'Reading') mockReading++;
        else if (item.section === 'Writing') mockWriting++;
        else if (item.section === 'Speaking') mockSpeaking++;
      } else if (item.assessment === 'IELTS Practice') {
        if (
          item.code.startsWith('Q-READ-') ||
          (item.passageCode &&
            (item.passageCode === 'PAS-READ-004' || item.passageCode === 'PAS-READ-005'))
        ) {
          practiceDiagReading++;
        } else {
          practiceReading++;
        }
      } else {
        otherCount++;
      }
    });

    const totalAccounted = normalizedList.length;
    const databaseTotal = questionsRes.rows.length + writingTasksRes.rows.length;

    const metrics: InventoryMetrics = {
      totalUniqueQuestions: questionsRes.rows.length,
      totalQuestionVersions: questionsRes.rows.filter((r) => r.version_id).length,
      totalWritingTasks: writingTasksRes.rows.length,
      totalReadingPassages: passagesRes.rows.length,
      totalListeningSections: listeningRes.rows.length,
      publishedCount,
      draftCount,
      underReviewCount,
      approvedCount,
      archivedCount,
      answersPresentCount: answersPresent,
      answersMissingCount: answersMissing,
      passagesResolvedCount: passagesResolved,
      passagesUnresolvedCount: passagesUnresolved,
      mediaResolvedCount: mediaResolved,
      mediaMissingCount: mediaMissing,
      tree: {
        preAssessment: {
          total: paGrammar + paReading + paWriting,
          grammar: paGrammar,
          reading: paReading,
          writing: paWriting,
        },
        ieltsMock: {
          total: mockListening + mockReading + mockWriting + mockSpeaking,
          listening: mockListening,
          reading: mockReading,
          writing: mockWriting,
          speaking: mockSpeaking,
        },
        ieltsPractice: {
          total: practiceReading + practiceDiagReading,
          reading: practiceReading,
          diagnosticReading: practiceDiagReading,
        },
        otherUnclassified: {
          total: otherCount,
          items: otherCount,
        },
      },
      reconciliation: {
        totalAccounted,
        databaseTotal,
        isReconciled: totalAccounted === databaseTotal,
      },
    };

    // Apply Filters
    let filtered = normalizedList;

    if (filters?.status && filters.status !== 'ALL') {
      const targetStatus = filters.status.toUpperCase();
      filtered = filtered.filter((i) => i.status === targetStatus);
    }

    if (filters?.exam && filters.exam !== 'ALL') {
      const targetExam = filters.exam.toLowerCase();
      filtered = filtered.filter((i) => i.exam.toLowerCase().includes(targetExam));
    }

    if (filters?.section && filters.section !== 'ALL') {
      const targetSec = filters.section.toLowerCase();
      filtered = filtered.filter((i) => i.section.toLowerCase() === targetSec);
    }

    if (filters?.difficulty && filters.difficulty !== 'ALL') {
      const targetDiff = filters.difficulty.toUpperCase();
      filtered = filtered.filter((i) => {
        const d = i.difficulty.toUpperCase();
        if (targetDiff === 'EASY') return d === 'EASY' || d === 'FOUNDATION';
        if (targetDiff === 'MEDIUM') return d === 'MEDIUM' || d === 'INTERMEDIATE';
        if (targetDiff === 'HARD') return d === 'HARD' || d === 'ADVANCED';
        return d === targetDiff;
      });
    }

    if (filters?.assessment && filters.assessment !== 'ALL') {
      filtered = filtered.filter((i) => i.assessment === filters.assessment);
    }

    if (filters?.contentKind && filters.contentKind !== 'ALL') {
      filtered = filtered.filter((i) => i.contentKind === filters.contentKind);
    }

    if (filters?.questionType && filters.questionType !== 'ALL') {
      const targetType = filters.questionType.toUpperCase();
      filtered = filtered.filter((i) => i.type.toUpperCase() === targetType);
    }

    // Content Dependencies Filter
    if (filters?.dependency && filters.dependency !== 'ALL') {
      const dep = filters.dependency.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
      switch (dep) {
        case 'HAS_ANSWER':
          filtered = filtered.filter((i) => !i.answer.isMissing);
          break;
        case 'MISSING_ANSWER':
          filtered = filtered.filter((i) => i.answer.isMissing);
          break;
        case 'HAS_PASSAGE':
          filtered = filtered.filter((i) => i.passageStatus === 'RESOLVED');
          break;
        case 'MISSING_PASSAGE':
          filtered = filtered.filter((i) => i.passageStatus === 'UNRESOLVED_DEPENDENCY');
          break;
        case 'HAS_MEDIA':
          filtered = filtered.filter((i) => Boolean(i.audioUrl || i.imageUrl));
          break;
        case 'MISSING_MEDIA':
          filtered = filtered.filter((i) => i.section === 'Listening' && !i.audioUrl);
          break;
        case 'HAS_RUBRIC':
          filtered = filtered.filter((i) => Boolean(i.rubrics?.length || i.criteria?.length));
          break;
        case 'MISSING_RUBRIC':
          filtered = filtered.filter(
            (i) =>
              (i.contentKind === 'WRITING_TASK' && !i.rubrics?.length) ||
              (i.contentKind === 'SPEAKING_PROMPT' && !i.criteria?.length)
          );
          break;
      }
    }

    // Search Query
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.code.toLowerCase().includes(q) ||
          i.text.toLowerCase().includes(q) ||
          i.skill.toLowerCase().includes(q) ||
          (i.passageTitle && i.passageTitle.toLowerCase().includes(q)) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Pagination
    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.max(1, Math.min(10000, filters?.pageSize || 50));
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIdx = (page - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      metrics,
    };
  }

  /**
   * Directly retrieve dynamic inventory metrics and reconciliation status.
   */
  public static async getInventoryMetrics(pool: Pool): Promise<InventoryMetrics> {
    const result = await this.getNormalizedContent(pool, { pageSize: 1 });
    return result.metrics;
  }
}
