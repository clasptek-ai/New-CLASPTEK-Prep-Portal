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

export const mockGeneratorService = {
  // Blueprints
  async getBlueprints(): Promise<MockBlueprint[]> {
    return getStoredBlueprints();
  },

  async addBlueprint(blueprint: Partial<MockBlueprint>): Promise<MockBlueprint> {
    const existing = getStoredBlueprints();
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
    saveBlueprints([newBp, ...existing]);
    return newBp;
  },

  // Mock Generator: Assembles published questions matching blueprint
  async generateMockExam(blueprintId: string): Promise<MockTemplate> {
    const blueprints = getStoredBlueprints();
    const bp = blueprints.find((b) => b.id === blueprintId) || blueprints[0];

    const allPublished = await adminQuestionsService.getPublishedQuestionsForCandidates(bp.exam);

    const generatedSections = bp.sections.map((sec) => {
      const sectionQuestions = allPublished.filter(
        (q) => q.section === sec.name || q.programmeName === bp.exam
      );

      // Fill with generated items if published count < section count
      const finalQuestions: AdminQuestion[] = [...sectionQuestions];
      while (finalQuestions.length < sec.questionCount) {
        const idx = finalQuestions.length + 1;
        finalQuestions.push({
          id: `q-mock-gen-${bp.exam.replace(/\s+/g, '')}-${sec.name}-${idx}`,
          code: `${bp.exam.substring(0, 4).toUpperCase()}-${sec.name.substring(0, 2).toUpperCase()}-${100 + idx}`,
          exam: bp.exam,
          section: sec.name,
          skill: `${sec.name} Diagnostic Skill`,
          type: sec.questionTypes[idx % sec.questionTypes.length] || 'MCQ',
          difficulty: idx % 3 === 0 ? 'HARD' : idx % 2 === 0 ? 'MEDIUM' : 'EASY',
          status: 'PUBLISHED',
          estimatedTime: '2 mins',
          officialSource: `Official ${bp.exam} Mock Bank`,
          version: 'v1.0',
          language: 'en-US',
          tags: [bp.exam, sec.name],
          text: `[${bp.exam} - ${sec.name}] Question ${idx}: Select the option that best fulfills the requirement outlined in paragraph ${Math.floor(idx / 5) + 1}.`,
          options: [
            'Option A: Primary assertion is validated by academic evidence',
            'Option B: Secondary condition applies under specific constraints',
            'Option C: Historical trend contradicts the initial hypothesis',
            'Option D: Result remains constant across all test models',
          ],
          correctAnswer: 'Option A: Primary assertion is validated by academic evidence',
          distractors: [
            'Option B: Secondary condition applies under specific constraints',
            'Option C: Historical trend contradicts the initial hypothesis',
            'Option D: Result remains constant across all test models',
          ],
          explanation: 'Option A accurately fulfills the passage requirements.',
          hash: `mock_gen_hash_${idx}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        sectionName: sec.name,
        timeLimitMinutes: sec.timeLimitMinutes,
        questions: finalQuestions.slice(0, sec.questionCount),
      };
    });

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

    const existingTemplates = getStoredTemplates();
    saveTemplates([template, ...existingTemplates]);

    return template;
  },

  async getTemplates(): Promise<MockTemplate[]> {
    const stored = getStoredTemplates();
    if (stored.length > 0) return stored;

    // Generate fallback template for IELTS and TOEFL
    const defaultTmpl = await this.generateMockExam('bp-ielts-acad');
    return [defaultTmpl];
  },

  // Student Session Engine
  async startSession(templateId: string, studentId: string = 'student-001'): Promise<MockSession> {
    const templates = await this.getTemplates();
    const tmpl = templates.find((t) => t.id === templateId) || templates[0];

    const session: MockSession = {
      id: `msession-${Date.now()}`,
      templateId: tmpl.id,
      blueprintId: tmpl.blueprintId,
      exam: tmpl.exam,
      studentId,
      status: 'IN_PROGRESS',
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      timeRemainingSeconds: tmpl.totalDurationMinutes * 60,
      answers: {},
      template: tmpl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessions = getStoredSessions();
    saveSessions([session, ...sessions]);

    return session;
  },

  async submitSession(
    sessionId: string,
    answers: Record<string, { questionId: string; studentAnswer: string; timeSpentSeconds: number }>
  ): Promise<MockResult> {
    const sessions = getStoredSessions();
    const session = sessions.find((s) => s.id === sessionId);

    const tmpl = session?.template;
    const exam = session?.exam || 'IELTS Academic';

    let totalRawScore = 0;
    let totalQuestions = 0;
    const sectionScores: Record<
      SectionType,
      { rawScore: number; total: number; percentage: number }
    > = {
      Reading: { rawScore: 0, total: 0, percentage: 0 },
      Listening: { rawScore: 0, total: 0, percentage: 0 },
      Writing: { rawScore: 0, total: 0, percentage: 0 },
      Speaking: { rawScore: 0, total: 0, percentage: 0 },
      Math: { rawScore: 0, total: 0, percentage: 0 },
      Grammar: { rawScore: 0, total: 0, percentage: 0 },
    };

    if (tmpl) {
      tmpl.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          totalQuestions++;
          const ans = answers[q.id];
          const studentAns = ans?.studentAnswer || '';

          // Use Strategy Pattern Evaluator (No Switch Statements)
          const evaluator = AnswerEvaluatorRegistry.getEvaluator(q.type);
          const evalResult = evaluator.score(studentAns, q);

          if (evalResult.isCorrect) {
            totalRawScore++;
            sectionScores[sec.sectionName].rawScore++;
          }
          sectionScores[sec.sectionName].total++;
        });
      });
    }

    // Calculate section percentages
    Object.keys(sectionScores).forEach((k) => {
      const key = k as SectionType;
      if (sectionScores[key].total > 0) {
        sectionScores[key].percentage = Math.round(
          (sectionScores[key].rawScore / sectionScores[key].total) * 100
        );
      }
    });

    const scoreResult = calculateBandOrScaleScore(exam, totalRawScore, totalQuestions || 40);

    const result: MockResult = {
      id: `mres-${Date.now()}`,
      sessionId,
      exam,
      studentId: session?.studentId || 'student-001',
      rawScore: totalRawScore,
      totalQuestions: totalQuestions || 40,
      sectionScores,
      scoreResult,
      timeSpentSeconds: tmpl ? tmpl.totalDurationMinutes * 60 : 3600,
      completedAt: new Date().toISOString(),
    };

    // Update Session status
    if (session) {
      session.status = 'SUBMITTED';
      saveSessions(sessions);
    }

    if (typeof window !== 'undefined') {
      try {
        const rawResults = localStorage.getItem(RESULTS_STORAGE_KEY);
        const resList = rawResults ? JSON.parse(rawResults) : [];
        resList.unshift(result);
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(resList));
      } catch {
        // Fallback
      }
    }

    return result;
  },
};
