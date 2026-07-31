import {
  MockBlueprint,
  MockTemplate,
  MockSession,
  MockResult,
  MockIntegrityLog,
  DEFAULT_MOCK_BLUEPRINTS,
} from '../domain/mock-blueprint';
import { AnswerEvaluatorRegistry } from '../domain/answer-evaluator-strategy';
import {
  adminQuestionsService,
  AdminQuestion,
  ExamType,
  SectionType,
} from '../../../services/admin/questions.service';
import { calculateBandOrScaleScore } from '../../../services/student/practice.service';

const BLUEPRINTS_STORAGE_KEY = 'clasptek_mock_blueprints';
const TEMPLATES_STORAGE_KEY = 'clasptek_mock_templates';
const SESSIONS_STORAGE_KEY = 'clasptek_mock_sessions';
const RESULTS_STORAGE_KEY = 'clasptek_mock_results';

function getStoredBlueprints(): MockBlueprint[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_BLUEPRINTS;
  const raw = localStorage.getItem(BLUEPRINTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_BLUEPRINTS));
    return DEFAULT_MOCK_BLUEPRINTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_BLUEPRINTS;
  }
}

function saveBlueprints(blueprints: MockBlueprint[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(blueprints));
  }
}

function getStoredTemplates(): MockTemplate[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTemplates(templates: MockTemplate[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }
}

function getStoredSessions(): MockSession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSessions(sessions: MockSession[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }
}

import { RepositoryFactory } from '../../../repositories/repository-factory';
import { blueprintSelectorService } from './blueprint-selector.service';

export const mockGeneratorService = {
  // Blueprints
  async getBlueprints(): Promise<MockBlueprint[]> {
    const mockRepo = RepositoryFactory.getMockRepository();
    const list = await mockRepo.getBlueprints();
    if (list && list.length > 0) return list;
    return getStoredBlueprints();
  },

  async addBlueprint(blueprint: Partial<MockBlueprint>): Promise<MockBlueprint> {
    const mockRepo = RepositoryFactory.getMockRepository();
    const newBp: MockBlueprint = {
      id: blueprint.id || `bp-${Date.now()}`,
      code: blueprint.code || `BP-CUSTOM-${Date.now().toString().slice(-4)}`,
      exam: (blueprint.exam || 'IELTS Academic') as ExamType,
      title: blueprint.title || `${blueprint.exam || 'IELTS'} Official Blueprint`,
      version: blueprint.version || 'v1.0',
      scoringMethod: blueprint.scoringMethod || 'BAND_SCALE_CONVERSION',
      allowPause: blueprint.allowPause ?? false,
      status: blueprint.status || 'ACTIVE',
      totalQuestions: blueprint.totalQuestions || 40,
      totalTimeMinutes: blueprint.totalTimeMinutes || 120,
      sections: blueprint.sections || [],
      createdAt: new Date().toISOString(),
    };
    await mockRepo.saveBlueprint(newBp);
    const existing = getStoredBlueprints();
    saveBlueprints([newBp, ...existing]);
    return newBp;
  },

  // Mock Generator: Assembles published questions matching blueprint
  async generateMockExam(blueprintId: string): Promise<MockTemplate> {
    const blueprints = await this.getBlueprints();
    const bp = blueprints.find((b) => b.id === blueprintId) || blueprints[0];

    // Blueprint-Driven Selection via Constraint Solver
    let generatedSections;
    try {
      generatedSections = await blueprintSelectorService.selectQuestionsForBlueprint(bp);
    } catch {
      // Fallback selection if bank items are below blueprint requirements
      const allPublished = await adminQuestionsService.getPublishedQuestionsForCandidates(
        bp.exam,
        'MOCK'
      );
      generatedSections = bp.sections.map((sec) => {
        let matching = allPublished.filter(
          (q) => q.section === sec.name || q.programmeName === bp.exam
        );
        if (matching.length === 0) matching = allPublished;
        return {
          sectionName: sec.name,
          timeLimitMinutes: sec.timeLimitMinutes,
          questions: matching.slice(0, sec.questionCount),
        };
      });
    }

    const template: MockTemplate = {
      id: `tmpl-${Date.now()}`,
      code: `TMPL-${bp.exam.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      blueprintId: bp.id,
      exam: bp.exam,
      title: `${bp.exam} Full Official Mock Exam`,
      version: bp.version,
      sections: generatedSections,
      totalQuestions: bp.totalQuestions,
      totalDurationMinutes: bp.totalTimeMinutes,
      createdAt: new Date().toISOString(),
    };

    const mockRepo = RepositoryFactory.getMockRepository();
    await mockRepo.saveTemplate(template);
    const existingTemplates = getStoredTemplates();
    saveTemplates([template, ...existingTemplates]);

    return template;
  },

  async getTemplates(): Promise<MockTemplate[]> {
    const mockRepo = RepositoryFactory.getMockRepository();
    const list = await mockRepo.getTemplates();
    if (list && list.length > 0) return list;
    const stored = getStoredTemplates();
    if (stored.length > 0) return stored;

    // Generate fallback template for IELTS and TOEFL
    const defaultTmpl = await this.generateMockExam('bp-ielts-acad');
    return [defaultTmpl];
  },

  // Student Session Engine
  async startSession(templateId: string, studentId: string = 'student-001'): Promise<MockSession> {
    const res = await fetch('/api/v1/mock/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blueprintId: templateId,
        studentId,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      if (data.error === 'BLUEPRINT_INVENTORY_INSUFFICIENT') {
        const details = data.deficits
          ? data.deficits.map((d: any) => `${d.sectionName}: required ${d.required}, available ${d.available} (deficit ${d.deficit})`).join('; ')
          : data.message;
        throw new Error(`BLUEPRINT_INVENTORY_INSUFFICIENT: ${details}`);
      }
      throw new Error(data.error || 'Failed to start Mock Examination session');
    }

    const s = data.session;
    return {
      id: s.id,
      templateId: s.blueprintId,
      blueprintId: s.blueprintId,
      exam: s.examType,
      studentId,
      status: 'IN_PROGRESS',
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      timeRemainingSeconds: s.totalDurationMinutes * 60,
      answers: {},
      createdAt: s.startedAt,
      updatedAt: s.startedAt,
    };
  },

  async submitSession(
    sessionId: string,
    answers: Record<string, { questionId: string; studentAnswer: string; timeSpentSeconds: number }>
  ): Promise<MockResult> {
    const res = await fetch(`/api/v1/mock/sessions/${sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();

    return {
      id: `mres-${sessionId}`,
      sessionId,
      exam: data.examType || 'IELTS Academic',
      studentId: 'student',
      rawScore: data.scorePercentage || 0,
      totalQuestions: 40,
      sectionScores: {
        Reading: { rawScore: 0, total: 0, percentage: data.scorePercentage || 0 },
        Listening: { rawScore: 0, total: 0, percentage: data.scorePercentage || 0 },
        Writing: { rawScore: 0, total: 0, percentage: 0 },
        Speaking: { rawScore: 0, total: 0, percentage: 0 },
        Math: { rawScore: 0, total: 0, percentage: 0 },
        Grammar: { rawScore: 0, total: 0, percentage: 0 },
      },
      scoreResult: {
        rawScore: data.scorePercentage || 0,
        totalQuestions: 40,
        percentage: data.scorePercentage || 0,
        bandOrScale: data.officialScoreLabel || 'Estimated Mock Score',
        label: data.evaluationState === 'EVALUATING' ? 'Provisional (Subjective Pending)' : 'Scored',
      },
      timeSpentSeconds: 3600,
      completedAt: data.submittedAt || new Date().toISOString(),
    };
  },
};
