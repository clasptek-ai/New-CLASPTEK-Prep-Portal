import {
  MockBlueprint,
  MockTemplate,
  MockSession,
  MockResult,
  DEFAULT_MOCK_BLUEPRINTS,
} from '../domain/mock-blueprint';
import { adminQuestionsService, ExamType } from '../../../services/admin/questions.service';
const BLUEPRINTS_STORAGE_KEY = 'clasptek_mock_blueprints';
const TEMPLATES_STORAGE_KEY = 'clasptek_mock_templates';

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
  async startSession(
    templateId: string,
    studentId: string = 'student-001',
    examType?: string
  ): Promise<MockSession> {
    const res = await fetch('/api/v1/mock/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blueprintId: templateId,
        studentId,
        examType,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      if (data.error === 'BLUEPRINT_INVENTORY_INSUFFICIENT') {
        const details = data.deficits
          ? data.deficits
              .map(
                (d: any) =>
                  `${d.sectionName}: required ${d.required}, available ${d.available} (deficit ${d.deficit})`
              )
              .join('; ')
          : data.message;
        throw new Error(`BLUEPRINT_INVENTORY_INSUFFICIENT: ${details}`);
      }
      throw new Error(data.error || 'Failed to start Mock Examination session');
    }

    const s = data.session;
    const mappedSections = (s.sections || []).map((sec: any) => ({
      sectionName: sec.name,
      timeLimitMinutes: sec.timeLimitMinutes,
      questions: (sec.questions || []).map((q: any) => ({
        id: q.questionId || q.id,
        code: q.code,
        section: sec.name,
        skill: q.skill || `${sec.name} Skill`,
        type: q.itemType,
        text: q.prompt,
        difficulty: q.difficulty,
        options: (q.options || []).map((opt: any) => (typeof opt === 'string' ? opt : opt.text)),
        optionCodes: (q.options || []).map((opt: any) =>
          typeof opt === 'string' ? opt : opt.code
        ),
        imageUrl: q.imageUrl || undefined,
        passage: q.passage || undefined,
        group: q.group || undefined,
        audio: q.audio || undefined,
        speaking: q.speaking || undefined,
        status: 'PUBLISHED',
      })),
    }));

    return {
      id: s.id,
      templateId: s.blueprintId,
      blueprintId: s.blueprintId,
      exam: s.examType,
      studentId: s.studentId || studentId,
      status: 'IN_PROGRESS',
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      timeRemainingSeconds: s.totalDurationMinutes * 60,
      answers: {},
      template: {
        id: s.blueprintId,
        code: s.blueprintId,
        blueprintId: s.blueprintId,
        exam: s.examType,
        title: s.title,
        version: 'v1.0',
        sections: mappedSections,
        totalQuestions: mappedSections.reduce(
          (acc: number, sec: any) => acc + (sec.questions?.length || 0),
          0
        ),
        totalDurationMinutes: s.totalDurationMinutes,
        createdAt: s.startedAt,
      },
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
        label:
          data.evaluationState === 'EVALUATING' ? 'Provisional (Subjective Pending)' : 'Scored',
      },
      timeSpentSeconds: 3600,
      completedAt: data.submittedAt || new Date().toISOString(),
    };
  },
};
