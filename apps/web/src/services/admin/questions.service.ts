import { apiClient } from '../api/client';

export type QuestionWorkflowStatus =
  'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type ExamType =
  | 'IELTS Academic'
  | 'IELTS General Training'
  | 'TOEFL iBT'
  | 'SAT'
  | 'CELPIP'
  | 'English Proficiency';

export type SectionType = 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Math' | 'Grammar';
export type QuestionType =
  'MCQ' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING' | 'MATCHING' | 'TRUE_FALSE_NOT_GIVEN';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionUsage = 'DIAGNOSTIC' | 'PRACTICE' | 'MOCK';

export interface QuestionGroup {
  id: string;
  title: string; // e.g. "Questions 1-5: Matching Headings"
  passageId?: string;
  audioUrl?: string;
  instructions: string;
  type: QuestionType;
  questionIds: string[];
}

export interface WritingTaskSpec {
  prompt: string;
  instructions: string;
  rubric: {
    taskAchievement: string;
    coherenceCoherence: string;
    lexicalResource: string;
    grammaticalAccuracy: string;
  };
  modelSampleAnswer: string;
}

export interface SpeakingTaskSpec {
  prompt: string;
  audioPromptUrl?: string;
  prepTimeSeconds: number;
  speakingTimeSeconds: number;
  rubric: string;
}

export interface Passage {
  id: string;
  title: string;
  content: string;
  examType: ExamType;
  section: SectionType;
  source?: string;
  wordCount: number;
  groupIds?: string[];
  questionIds: string[];
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: 'IMAGE' | 'AUDIO' | 'PDF' | 'PASSAGE';
  url: string;
  examType: ExamType;
  tags: string[];
  sizeMb?: string;
  createdAt: string;
}

export interface AdminQuestion {
  id: string;
  code: string;
  exam: ExamType;
  section: SectionType;
  skill: string;
  subSkill?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  status: QuestionWorkflowStatus;
  usages: QuestionUsage[]; // Multi-select usage: Diagnostic, Practice, Mock
  estimatedTime: string;
  officialSource: string;
  version: string;
  language: string;
  tags: string[];
  text: string;
  options?: string[];
  correctAnswer: string;
  distractors?: string[];
  explanation: string;
  hints?: string[];
  groupId?: string;
  passageId?: string;
  passageTitle?: string;
  passageText?: string;
  audioUrl?: string;
  imageUrl?: string;
  writingSpec?: WritingTaskSpec;
  speakingSpec?: SpeakingTaskSpec;
  hash: string;
  createdAt: string;
  updatedAt: string;
  // Backward compatibility fields
  topic?: string;
  learningObjective?: string;
  programmeName?: string;
  category?: 'MOCK' | 'ASSESSMENT' | 'PRACTICE';
}

const QUESTIONS_STORAGE_KEY = 'clasptek_universal_question_bank';
const PASSAGES_STORAGE_KEY = 'clasptek_passage_repository';
const MEDIA_STORAGE_KEY = 'clasptek_media_library';

/**
 * Deterministic hash generator for duplicate question detection
 */
export function generateQuestionHash(prompt: string, exam: string, type: string): string {
  const normalized = `${exam.toLowerCase().trim()}|${type.toLowerCase().trim()}|${prompt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export const DEFAULT_PASSAGES: Passage[] = [
  {
    id: 'pas-001',
    title: 'The Evolution of Renewable Energy Infrastructure in Western Europe',
    content:
      'Over the past three decades, European governments have heavily invested in offshore wind farms and solar grids. The rapid shift away from fossil fuels has altered energy market dynamics, introducing grid stability challenges while dramatically lowering long-term carbon emissions...',
    examType: 'IELTS Academic',
    section: 'Reading',
    source: 'Cambridge IELTS 18',
    wordCount: 850,
    questionIds: ['q-univ-1', 'q-univ-2'],
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'pas-002',
    title: 'Cognitive Architecture and Academic Problem Solving',
    content:
      'Working memory limitations severely restrict the number of discrete informational elements an individual can process simultaneously. Cognitive Load Theory outlines how instructional design can optimize schema acquisition...',
    examType: 'TOEFL iBT',
    section: 'Reading',
    source: 'Official ETS Guide v4',
    wordCount: 720,
    questionIds: ['q-univ-3'],
    createdAt: '2026-06-15T14:20:00Z',
  },
];

export const DEFAULT_MEDIA: MediaAsset[] = [
  {
    id: 'med-001',
    title: 'IELTS Listening Section 3 Audio Clip',
    type: 'AUDIO',
    url: 'https://assets.clasptek.com/audio/ielts-sec3-dialogue.mp3',
    examType: 'IELTS Academic',
    tags: ['Listening', 'Section 3', 'Conversation'],
    sizeMb: '4.2 MB',
    createdAt: '2026-06-10T12:00:00Z',
  },
  {
    id: 'med-002',
    title: 'SAT Math Parabola Diagram',
    type: 'IMAGE',
    url: 'https://assets.clasptek.com/images/sat-parabola-fig1.png',
    examType: 'SAT',
    tags: ['Math', 'Algebra', 'Diagram'],
    sizeMb: '1.1 MB',
    createdAt: '2026-06-20T09:30:00Z',
  },
];

export const DEFAULT_UNIVERSAL_QUESTIONS: AdminQuestion[] = [
  {
    id: 'q-univ-1',
    code: 'IELTS-RD-001',
    exam: 'IELTS Academic',
    section: 'Reading',
    skill: 'Matching Headings',
    subSkill: 'Main Stance Identification',
    type: 'MCQ',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
    estimatedTime: '2 mins',
    officialSource: 'Cambridge 18 Test 1',
    version: 'v1.2',
    language: 'en-US',
    tags: ['Reading', 'Matching Headings', 'Energy'],
    text: 'According to paragraph 2, what is the primary structural challenge facing offshore wind energy integration?',
    options: [
      'Intermittent grid frequency instability',
      'Excessive raw material transport costs',
      'Lack of skilled regulatory personnel',
      'Unpredictable tidal wave erosion',
    ],
    correctAnswer: 'Intermittent grid frequency instability',
    distractors: [
      'Excessive raw material transport costs',
      'Lack of skilled regulatory personnel',
      'Unpredictable tidal wave erosion',
    ],
    explanation:
      'Paragraph 2 explicitly highlights that grid frequency fluctuations during low wind yield periods pose the primary technical bottleneck.',
    hints: ['Focus on technical grid constraints mentioned in sentence 3.'],
    passageId: 'pas-001',
    passageTitle: 'The Evolution of Renewable Energy Infrastructure in Western Europe',
    hash: generateQuestionHash(
      'According to paragraph 2, what is the primary structural challenge facing offshore wind energy integration?',
      'IELTS Academic',
      'MCQ'
    ),
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
    topic: 'Matching Headings',
    learningObjective: 'Analyze main structural arguments in academic texts',
    programmeName: 'IELTS Academic',
    category: 'MOCK',
  },
  {
    id: 'q-univ-2',
    code: 'TOEFL-WR-002',
    exam: 'TOEFL iBT',
    section: 'Writing',
    skill: 'Integrated Writing',
    subSkill: 'Lecturer Counter-argument',
    type: 'ESSAY',
    difficulty: 'MEDIUM',
    status: 'UNDER_REVIEW',
    usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
    estimatedTime: '15 mins',
    officialSource: 'ETS Official Guide 2026',
    version: 'v1.0',
    language: 'en-US',
    tags: ['Writing', 'Integrated Task', 'Cognitive Science'],
    text: 'Summarize the points made in the lecture, explaining how they cast doubt on specific points made in the reading passage regarding Cognitive Load Theory.',
    correctAnswer: 'Detailed integrated response evaluating reading vs lecture claims.',
    explanation:
      'High scoring responses must clearly contrast the 3 main lecture counterpoints against the reading hypotheses.',
    hints: ['Structure your essay into 3 body paragraphs corresponding to each counterpoint.'],
    passageId: 'pas-002',
    passageTitle: 'Cognitive Architecture and Academic Problem Solving',
    hash: generateQuestionHash(
      'Summarize the points made in the lecture, explaining how they cast doubt on specific points made in the reading passage regarding Cognitive Load Theory.',
      'TOEFL iBT',
      'ESSAY'
    ),
    createdAt: '2026-06-18T14:30:00Z',
    updatedAt: '2026-06-18T14:30:00Z',
    topic: 'Integrated Writing',
    learningObjective: 'Synthesize opposing oral and written arguments',
    programmeName: 'TOEFL iBT',
    category: 'ASSESSMENT',
  },
  {
    id: 'q-univ-3',
    code: 'SAT-MTH-003',
    exam: 'SAT',
    section: 'Math',
    skill: 'Advanced Math',
    subSkill: 'Quadratic Equations',
    type: 'MCQ',
    difficulty: 'HARD',
    status: 'APPROVED',
    usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
    estimatedTime: '1.5 mins',
    officialSource: 'CollegeBoard SAT Practice Test 4',
    version: 'v2.0',
    language: 'en-US',
    tags: ['Math', 'Algebra', 'Quadratic'],
    text: 'If \\(f(x) = x^2 - 6x + 9\\) and \\(g(x) = x - 3\\), for what value of \\(x\\) does \\(f(x) = g(x)\\)?',
    options: ['x = 3 and x = 4', 'x = 2 and x = 3', 'x = 3 only', 'x = 4 only'],
    correctAnswer: 'x = 3 and x = 4',
    distractors: ['x = 2 and x = 3', 'x = 3 only', 'x = 4 only'],
    explanation:
      'Setting \\(x^2 - 6x + 9 = x - 3\\) yields \\(x^2 - 7x + 12 = 0\\), which factors into \\((x-3)(x-4) = 0\\). Thus \\(x = 3\\) and \\(x = 4\\).',
    hints: ['Set f(x) equal to g(x) and subtract (x - 3) from both sides.'],
    hash: generateQuestionHash(
      'If f(x) = x^2 - 6x + 9 and g(x) = x - 3, for what value of x does f(x) = g(x)?',
      'SAT',
      'MCQ'
    ),
    createdAt: '2026-07-01T09:15:00Z',
    updatedAt: '2026-07-01T09:15:00Z',
    topic: 'Quadratic Equations',
    learningObjective: 'Solve non-linear systems of equations',
    programmeName: 'SAT',
    category: 'MOCK',
  },
  {
    id: 'q-univ-4',
    code: 'CELPIP-SPK-004',
    exam: 'CELPIP',
    section: 'Speaking',
    skill: 'Interactive Speaking',
    subSkill: 'Giving Advice',
    type: 'SPEAKING',
    difficulty: 'MEDIUM',
    status: 'DRAFT',
    usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
    estimatedTime: '1.5 mins',
    officialSource: 'Paragon CELPIP Study Pack',
    version: 'v1.0',
    language: 'en-CA',
    tags: ['Speaking', 'Task 1', 'Advice'],
    text: 'A friend is looking to rent an apartment in a new city and is unsure whether to choose a furnished downtown suite or an unfurnished suburban house. Give advice to your friend explaining your reasoning.',
    correctAnswer: 'Audio response demonstrating fluency, coherence, and appropriate vocabulary.',
    explanation:
      'Candidate should structure advice with clear opening, 2 contrasting reasons, and a supportive closing statement.',
    hash: generateQuestionHash(
      'A friend is looking to rent an apartment in a new city and is unsure whether to choose a furnished downtown suite...',
      'CELPIP',
      'SPEAKING'
    ),
    createdAt: '2026-07-05T11:00:00Z',
    updatedAt: '2026-07-05T11:00:00Z',
    topic: 'Giving Advice',
    learningObjective: 'Deliver articulate spoken advice in professional/personal contexts',
    programmeName: 'CELPIP',
    category: 'PRACTICE',
  },
];

import { RepositoryFactory } from '../../repositories/repository-factory';

function getStoredQuestions(): AdminQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_UNIVERSAL_QUESTIONS;
  const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_UNIVERSAL_QUESTIONS));
    return DEFAULT_UNIVERSAL_QUESTIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_UNIVERSAL_QUESTIONS;
  }
}

function saveStoredQuestions(questions: AdminQuestion[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  }
}

export function getStoredPassages(): Passage[] {
  if (typeof window === 'undefined') return DEFAULT_PASSAGES;
  const raw = localStorage.getItem(PASSAGES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(PASSAGES_STORAGE_KEY, JSON.stringify(DEFAULT_PASSAGES));
    return DEFAULT_PASSAGES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PASSAGES;
  }
}

export function saveStoredPassages(passages: Passage[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PASSAGES_STORAGE_KEY, JSON.stringify(passages));
  }
}

export function getStoredMedia(): MediaAsset[] {
  if (typeof window === 'undefined') return DEFAULT_MEDIA;
  const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA));
    return DEFAULT_MEDIA;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEDIA;
  }
}

export function saveStoredMedia(media: MediaAsset[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(media));
  }
}

export const adminQuestionsService = {
  async getQuestionsWithPagination(filter?: {
    status?: QuestionWorkflowStatus | 'ALL';
    exam?: ExamType | 'ALL';
    section?: SectionType | 'ALL';
    difficulty?: DifficultyLevel | 'ALL';
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const repo = RepositoryFactory.getQuestionRepository();
    const result = await repo.findBySpecification({
      status: filter?.status,
      exam: filter?.exam,
      section: filter?.section,
      difficulty: filter?.difficulty,
      search: filter?.search,
      page: filter?.page || 1,
      pageSize: filter?.pageSize || 50,
    });

    if (result && result.data && result.data.length > 0) {
      return result;
    }

    const all = await this.getQuestions(filter);
    return {
      data: all,
      total: all.length,
      page: 1,
      pageSize: all.length || 50,
      totalPages: 1,
      counts: {
        all: all.length,
        published: all.filter((q) => q.status === 'PUBLISHED').length,
        draft: all.filter((q) => q.status === 'DRAFT').length,
      },
    };
  },

  async getQuestions(filter?: {
    status?: QuestionWorkflowStatus | 'ALL';
    exam?: ExamType | 'ALL';
    section?: SectionType | 'ALL';
    difficulty?: DifficultyLevel | 'ALL';
    search?: string;
  }): Promise<AdminQuestion[]> {
    const repo = RepositoryFactory.getQuestionRepository();
    const result = await repo.findBySpecification({
      status: filter?.status,
      exam: filter?.exam,
      section: filter?.section,
      difficulty: filter?.difficulty,
      search: filter?.search,
    });

    if (result && result.data && result.data.length > 0) {
      return result.data;
    }

    let all = getStoredQuestions();
    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        all = all.filter((q) => q.status === filter.status);
      }
      if (filter.exam && filter.exam !== 'ALL') {
        all = all.filter((q) => q.exam === filter.exam || q.programmeName === filter.exam);
      }
      if (filter.section && filter.section !== 'ALL') {
        all = all.filter((q) => q.section === filter.section);
      }
      if (filter.difficulty && filter.difficulty !== 'ALL') {
        all = all.filter((q) => q.difficulty === filter.difficulty);
      }
      if (filter.search && filter.search.trim()) {
        const query = filter.search.toLowerCase();
        all = all.filter(
          (q) =>
            q.text.toLowerCase().includes(query) ||
            q.code.toLowerCase().includes(query) ||
            q.skill.toLowerCase().includes(query) ||
            (q.tags && q.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }
    }

    return all;
  },

  async getPublishedQuestionsForCandidates(
    exam?: ExamType,
    usage?: QuestionUsage
  ): Promise<AdminQuestion[]> {
    const repo = RepositoryFactory.getQuestionRepository();
    const list = await repo.findForCandidates(exam, usage);
    if (list && list.length > 0) return list;
    
    const all = await this.getQuestions({ status: 'PUBLISHED' });
    let filtered = all;
    if (exam) {
      filtered = filtered.filter((q) => q.exam === exam || q.programmeName === exam);
    }
    if (usage) {
      filtered = filtered.filter((q) => q.usages && q.usages.includes(usage));
    }
    return filtered;
  },

  async getPendingQuestions(): Promise<AdminQuestion[]> {
    return this.getQuestions({ status: 'ALL' });
  },

  async addQuestion(q: Partial<AdminQuestion>): Promise<{ success: boolean; duplicate?: boolean }> {
    const repo = RepositoryFactory.getQuestionRepository();
    const existing = await repo.findAll();
    const hash = generateQuestionHash(
      q.text || '',
      q.exam || q.programmeName || 'IELTS Academic',
      q.type || 'MCQ'
    );

    // Duplicate Detection Check
    const duplicate = existing.find((item) => item.hash === hash);
    if (duplicate) {
      return { success: false, duplicate: true };
    }

    const fullQuestion: AdminQuestion = {
      id: q.id || `q-univ-${Date.now()}`,
      code: q.code || `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      exam: (q.exam || q.programmeName || 'IELTS Academic') as ExamType,
      section: (q.section || 'Reading') as SectionType,
      skill: q.skill || q.topic || 'General Skill',
      subSkill: q.subSkill || '',
      type: (q.type || 'MCQ') as QuestionType,
      difficulty: (q.difficulty || 'MEDIUM') as DifficultyLevel,
      status: q.status || 'DRAFT',
      usages: q.usages && q.usages.length > 0 ? q.usages : ['DIAGNOSTIC', 'PRACTICE', 'MOCK'],
      estimatedTime: q.estimatedTime || '2 mins',
      officialSource: q.officialSource || 'Clasptek Question Bank',
      version: q.version || 'v1.0',
      language: q.language || 'en-US',
      tags: q.tags || ['ExamPrep'],
      text: q.text || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      distractors: q.distractors || [],
      explanation: q.explanation || '',
      hints: q.hints || [],
      passageId: q.passageId,
      passageTitle: q.passageTitle,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
      hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      programmeName: q.exam || q.programmeName,
      topic: q.skill || q.topic,
      category: q.category || 'MOCK',
    };

    await repo.save(fullQuestion);
    saveStoredQuestions([fullQuestion, ...existing]);
    return { success: true };
  },

  async updateQuestionStatus(id: string, newStatus: QuestionWorkflowStatus): Promise<boolean> {
    const repo = RepositoryFactory.getQuestionRepository();
    await repo.updateStatus(id, newStatus);
    const existing = getStoredQuestions();
    const updated = existing.map((q) =>
      q.id === id ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } : q
    );
    saveStoredQuestions(updated);
    try {
      await apiClient.post(`/api/v1/admin/questions/${id}/status`, { status: newStatus });
    } catch {
      // client-side fallback saved above
    }
    return true;
  },

  async approveQuestion(id: string): Promise<boolean> {
    return this.updateQuestionStatus(id, 'APPROVED');
  },

  async publishQuestion(id: string): Promise<boolean> {
    return this.updateQuestionStatus(id, 'PUBLISHED');
  },

  async rejectQuestion(id: string, _reason: string): Promise<boolean> {
    return this.updateQuestionStatus(id, 'ARCHIVED');
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const repo = RepositoryFactory.getQuestionRepository();
    await repo.delete(id);
    const existing = getStoredQuestions();
    const updated = existing.filter((q) => q.id !== id);
    saveStoredQuestions(updated);
    return true;
  },

  async commitBatch(newQuestions: AdminQuestion[]): Promise<{ added: number; skipped: number }> {
    const repo = RepositoryFactory.getQuestionRepository();
    const existing = await repo.findAll();
    let added = 0;
    let skipped = 0;
    const toAdd: AdminQuestion[] = [];

    for (const q of newQuestions) {
      const hash =
        q.hash || generateQuestionHash(q.text || '', q.exam || 'IELTS Academic', q.type || 'MCQ');
      const isDuplicate =
        existing.some((e) => e.hash === hash) || toAdd.some((t) => t.hash === hash);
      if (isDuplicate) {
        skipped++;
      } else {
        toAdd.push({ ...q, hash });
        added++;
      }
    }

    await repo.bulkUpsert(toAdd);
    saveStoredQuestions([...toAdd, ...existing]);
    return { added, skipped };
  },

  // Passage Management
  async getPassages(): Promise<Passage[]> {
    const repo = RepositoryFactory.getPassageRepository();
    const list = await repo.findAll();
    if (list && list.length > 0) return list;
    return getStoredPassages();
  },

  async addPassage(passage: Partial<Passage>): Promise<Passage> {
    const repo = RepositoryFactory.getPassageRepository();
    const newPassage: Passage = {
      id: passage.id || `pas-${Date.now()}`,
      title: passage.title || 'Untitled Passage',
      content: passage.content || '',
      examType: (passage.examType || 'IELTS Academic') as ExamType,
      section: (passage.section || 'Reading') as SectionType,
      source: passage.source || 'Official Practice Material',
      wordCount: (passage.content || '').split(/\s+/).filter(Boolean).length,
      questionIds: passage.questionIds || [],
      createdAt: new Date().toISOString(),
    };
    await repo.save(newPassage);
    const existing = getStoredPassages();
    saveStoredPassages([newPassage, ...existing]);
    return newPassage;
  },

  // Media Library Management
  async getMedia(): Promise<MediaAsset[]> {
    const repo = RepositoryFactory.getMediaRepository();
    const list = await repo.findAll();
    if (list && list.length > 0) return list;
    return getStoredMedia();
  },

  async addMedia(media: Partial<MediaAsset>): Promise<MediaAsset> {
    const repo = RepositoryFactory.getMediaRepository();
    const newMedia: MediaAsset = {
      id: media.id || `med-${Date.now()}`,
      title: media.title || 'Untitled Media Asset',
      type: media.type || 'IMAGE',
      url: media.url || 'https://assets.clasptek.com/media/sample.png',
      examType: (media.examType || 'IELTS Academic') as ExamType,
      tags: media.tags || ['Media'],
      sizeMb: media.sizeMb || '1.0 MB',
      createdAt: new Date().toISOString(),
    };
    await repo.save(newMedia);
    const existing = getStoredMedia();
    saveStoredMedia([newMedia, ...existing]);
    return newMedia;
  },

  // Question Group Management (Sprint 2A)
  async getQuestionGroups(): Promise<QuestionGroup[]> {
    const repo = RepositoryFactory.getQuestionGroupRepository();
    return repo.findAll();
  },

  async addQuestionGroup(group: Partial<QuestionGroup>): Promise<QuestionGroup> {
    const repo = RepositoryFactory.getQuestionGroupRepository();
    const newGroup: QuestionGroup = {
      id: group.id || `qgrp-${Date.now()}`,
      title: group.title || 'Untitled Question Group',
      passageId: group.passageId,
      audioUrl: group.audioUrl,
      instructions: group.instructions || 'Answer questions 1-5 based on the text.',
      type: group.type || 'MCQ',
      questionIds: group.questionIds || [],
    };
    await repo.save(newGroup);
    return newGroup;
  },

  // Bulk Operations API (Enterprise Bulk Selection)
  async bulkAction(payload: {
    action:
      | 'publish'
      | 'unpublish'
      | 'archive'
      | 'restore'
      | 'delete'
      | 'duplicate'
      | 'assign_usages'
      | 'update_difficulty'
      | 'update_exam'
      | 'update_section'
      | 'move_passage'
      | 'export';
    questionIds?: string[];
    selectAllFiltered?: boolean;
    filter?: any;
    payloadData?: any;
  }): Promise<{ success: boolean; affectedCount: number; message: string; exportUrl?: string }> {
    try {
      const res = await apiClient.post<any>('/api/v1/admin/questions/bulk', payload);
      if (res && res.success) return res;
    } catch {
      // Local fallback for offline / mock repository
    }

    const all = await this.getQuestions();
    let targetIds = payload.questionIds || [];

    if (payload.selectAllFiltered && payload.filter) {
      const f = payload.filter;
      targetIds = all
        .filter((q) => {
          const matchesStatus = !f.status || f.status === 'ALL' || q.status === f.status;
          const matchesExam = !f.exam || f.exam === 'ALL' || q.exam === f.exam;
          const matchesSection = !f.section || f.section === 'ALL' || q.section === f.section;
          const matchesDiff = !f.difficulty || f.difficulty === 'ALL' || q.difficulty === f.difficulty;
          return matchesStatus && matchesExam && matchesSection && matchesDiff;
        })
        .map((q) => q.id);
    }

    const targetSet = new Set(targetIds);
    let affectedCount = 0;

    if (payload.action === 'delete') {
      const updated = all.filter((q) => !targetSet.has(q.id));
      affectedCount = all.length - updated.length;
      saveStoredQuestions(updated);
    } else if (payload.action === 'publish') {
      const updated = all.map((q) => (targetSet.has(q.id) ? { ...q, status: 'PUBLISHED' as const } : q));
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else if (payload.action === 'unpublish' || payload.action === 'restore') {
      const updated = all.map((q) => (targetSet.has(q.id) ? { ...q, status: 'DRAFT' as const } : q));
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else if (payload.action === 'archive') {
      const updated = all.map((q) => (targetSet.has(q.id) ? { ...q, status: 'ARCHIVED' as const } : q));
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else if (payload.action === 'assign_usages' && payload.payloadData?.usages) {
      const updated = all.map((q) =>
        targetSet.has(q.id) ? { ...q, usages: payload.payloadData.usages } : q
      );
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else if (payload.action === 'update_difficulty' && payload.payloadData?.difficulty) {
      const updated = all.map((q) =>
        targetSet.has(q.id) ? { ...q, difficulty: payload.payloadData.difficulty } : q
      );
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else if (payload.action === 'move_passage') {
      const updated = all.map((q) =>
        targetSet.has(q.id)
          ? {
              ...q,
              passageId: payload.payloadData?.passageId,
              passageTitle: payload.payloadData?.passageTitle,
            }
          : q
      );
      affectedCount = targetSet.size;
      saveStoredQuestions(updated);
    } else {
      affectedCount = targetSet.size;
    }

    return {
      success: true,
      affectedCount,
      message: `Successfully executed bulk ${payload.action} on ${affectedCount} question records.`,
    };
  },
};

