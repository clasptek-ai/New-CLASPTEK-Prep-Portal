import { IMockRepository } from '../interfaces/mock.repository';
import {
  MockBlueprint,
  MockTemplate,
  MockSession,
  MockResult,
} from '../../features/mock-engine/domain/mock-blueprint';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

export class SupabaseMockRepository implements IMockRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async getBlueprints(): Promise<MockBlueprint[]> {
    try {
      const res = await fetch('/api/v1/mock/blueprints');
      const data = await res.json();
      if (data.success && Array.isArray(data.blueprints)) {
        return data.blueprints.map((bp: any) => ({
          id: bp.id,
          code: bp.examCode,
          exam: bp.examType,
          title: bp.title,
          version: `v${bp.versionNo}.0`,
          scoringMethod: bp.scoringStrategy,
          allowPause: false,
          status: bp.status,
          totalQuestions: bp.sections
            ? bp.sections.reduce((acc: number, s: any) => acc + (s.questionCount || 0), 0)
            : 40,
          totalTimeMinutes: bp.sections
            ? bp.sections.reduce((acc: number, s: any) => acc + (s.timeLimitMinutes || 0), 0)
            : 120,
          sections: bp.sections || [],
          createdAt: new Date().toISOString(),
        }));
      }
    } catch {
      // Return empty array
    }
    return [];
  }

  async getBlueprintById(id: string): Promise<MockBlueprint | null> {
    const list = await this.getBlueprints();
    return list.find((b) => b.id === id) || null;
  }

  async saveBlueprint(blueprint: MockBlueprint): Promise<MockBlueprint> {
    return blueprint;
  }

  async getTemplates(): Promise<MockTemplate[]> {
    const bps = await this.getBlueprints();
    return bps.map((bp) => ({
      id: `tmpl-${bp.id}`,
      code: `TMPL-${bp.code}`,
      blueprintId: bp.id,
      exam: bp.exam,
      title: bp.title,
      version: bp.version,
      sections: bp.sections.map((s) => ({
        sectionName: s.name as any,
        timeLimitMinutes: s.timeLimitMinutes,
        questions: [],
      })),
      totalQuestions: bp.totalQuestions,
      totalDurationMinutes: bp.totalTimeMinutes,
      createdAt: new Date().toISOString(),
    }));
  }

  async getTemplateById(id: string): Promise<MockTemplate | null> {
    const list = await this.getTemplates();
    return list.find((t) => t.id === id) || null;
  }

  async saveTemplate(template: MockTemplate): Promise<MockTemplate> {
    return template;
  }

  async getSessions(studentId?: string): Promise<MockSession[]> {
    try {
      const res = await fetch('/api/v1/mock/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        return data.history.map((row: any) => ({
          id: row.sessionId,
          templateId: `tmpl-${row.sessionId}`,
          blueprintId: `bp-${row.sessionId}`,
          exam: row.examType,
          studentId: studentId || 'student',
          status:
            row.status === 'COMPLETED' || row.status === 'SUBMITTED' ? 'SUBMITTED' : 'IN_PROGRESS',
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          timeRemainingSeconds: 0,
          answers: {},
          createdAt: row.startedAt,
          updatedAt: row.submittedAt,
        }));
      }
    } catch {
      // Empty array
    }
    return [];
  }

  async getSessionById(id: string): Promise<MockSession | null> {
    const list = await this.getSessions();
    return list.find((s) => s.id === id) || null;
  }

  async saveSession(session: MockSession): Promise<MockSession> {
    return session;
  }

  async getResults(studentId?: string): Promise<MockResult[]> {
    const sessions = await this.getSessions(studentId);
    return sessions.map((s) => ({
      id: `mres-${s.id}`,
      sessionId: s.id,
      exam: s.exam,
      studentId: s.studentId,
      rawScore: 0,
      totalQuestions: 40,
      sectionScores: {} as any,
      scoreResult: {
        rawScore: 0,
        totalQuestions: 40,
        percentage: 0,
        bandOrScale: 'Estimated Mock Score',
        label: 'Scored',
      },
      timeSpentSeconds: 3600,
      completedAt: s.updatedAt,
    }));
  }

  async getResultById(id: string): Promise<MockResult | null> {
    const list = await this.getResults();
    return list.find((r) => r.id === id || r.sessionId === id) || null;
  }

  async saveResult(result: MockResult): Promise<MockResult> {
    try {
      await fetch(`/api/v1/mock/sessions/${result.sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: result.sessionId,
        }),
      });
    } catch {
      // Backend handles persistence
    }
    return result;
  }
}
