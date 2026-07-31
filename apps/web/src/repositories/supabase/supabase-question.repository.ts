import {
  IQuestionRepository,
  QuestionSpecification,
  PaginatedResult,
} from '../interfaces/question.repository';
import {
  AdminQuestion,
  ExamType,
  QuestionUsage,
  QuestionWorkflowStatus,
} from '../../services/admin/questions.service';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

const STORAGE_KEY = 'clasptek_universal_question_bank';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

function getLocalQuestions(): AdminQuestion[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalQuestions(questions: AdminQuestion[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }
}

export class SupabaseQuestionRepository implements IQuestionRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async findAll(): Promise<AdminQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('materialized_questions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => this.mapRowToQuestion(row));
      }
    } catch {
      // Fallback
    }

    return getLocalQuestions();
  }

  async findBySpecification(spec: QuestionSpecification): Promise<PaginatedResult<AdminQuestion>> {
    const page = spec.page || 1;
    const pageSize = spec.pageSize || 20;

    let all = await this.findAll();

    if (spec.status && spec.status !== 'ALL') {
      all = all.filter((q) => q.status === spec.status);
    }
    if (spec.exam && spec.exam !== 'ALL') {
      all = all.filter((q) => q.exam === spec.exam || q.programmeName === spec.exam);
    }
    if (spec.section && spec.section !== 'ALL') {
      all = all.filter((q) => q.section === spec.section);
    }
    if (spec.difficulty && spec.difficulty !== 'ALL') {
      all = all.filter((q) => q.difficulty === spec.difficulty);
    }
    if (spec.usage) {
      all = all.filter((q) => q.usages && q.usages.includes(spec.usage!));
    }
    if (spec.search && spec.search.trim()) {
      const query = spec.search.toLowerCase();
      all = all.filter(
        (q) =>
          q.text.toLowerCase().includes(query) ||
          q.code.toLowerCase().includes(query) ||
          q.skill.toLowerCase().includes(query) ||
          (q.tags && q.tags.some((t) => t.toLowerCase().includes(query)))
      );
    }

    const total = all.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginated = all.slice(startIdx, startIdx + pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findById(id: string): Promise<AdminQuestion | null> {
    const list = await this.findAll();
    return list.find((q) => q.id === id) || null;
  }

  async findByCode(code: string): Promise<AdminQuestion | null> {
    const list = await this.findAll();
    return list.find((q) => q.code === code) || null;
  }

  async findForCandidates(exam?: ExamType, usage?: QuestionUsage): Promise<AdminQuestion[]> {
    const list = await this.findAll();
    return list.filter((q) => {
      if (q.status !== 'PUBLISHED') return false;
      if (exam && q.exam !== exam) return false;
      if (usage && !q.usages.includes(usage)) return false;
      return true;
    });
  }

  /**
   * CANONICAL WRITE MODEL:
   * Writes target public.questions and public.question_versions.
   * PostgreSQL trigger trg_sync_materialized_question automatically populates
   * question_read.materialized_questions when question_versions status is 'published'.
   */
  async save(question: AdminQuestion): Promise<AdminQuestion> {
    const localList = getLocalQuestions();
    const existingIndex = localList.findIndex((q) => q.id === question.id);
    if (existingIndex >= 0) {
      localList[existingIndex] = question;
    } else {
      localList.unshift(question);
    }
    saveLocalQuestions(localList);

    try {
      const dbStatus = question.status.toLowerCase();

      // 1. Upsert root question entity into canonical table public.questions
      const { data: qData, error: qErr } = await this.supabase
        .from('questions')
        .upsert({
          id: question.id,
          code: question.code,
          status: dbStatus,
          tenant_id: DEFAULT_TENANT_ID,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!qErr) {
        // 2. Upsert canonical question version into public.question_versions
        await this.supabase.from('question_versions').upsert({
          question_id: question.id,
          version_no: 1,
          version_label: question.version || 'v1.0',
          prompt: question.text,
          payload: question,
          explanation: question.explanation,
          status: dbStatus,
        });
      }

      // Also update materialized_questions directly for dev resilience if trigger hasn't fired
      await this.supabase.from('materialized_questions').upsert({
        id: question.id,
        code: question.code,
        prompt: question.text,
        payload: question,
        explanation: question.explanation,
        tags: question.tags,
        difficulty_rating: question.difficulty.toLowerCase(),
        tenant_id: DEFAULT_TENANT_ID,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // client-side fallback saved above
    }

    return question;
  }

  async updateStatus(id: string, status: QuestionWorkflowStatus): Promise<boolean> {
    const localList = getLocalQuestions();
    const updated = localList.map((q) => (q.id === id ? { ...q, status } : q));
    saveLocalQuestions(updated);

    try {
      const dbStatus = status.toLowerCase();
      // Update canonical root
      await this.supabase.from('questions').update({ status: dbStatus }).eq('id', id);
      // Update canonical version
      await this.supabase
        .from('question_versions')
        .update({ status: dbStatus })
        .eq('question_id', id);
    } catch {
      // client-side fallback saved above
    }

    return true;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalQuestions();
    const filtered = localList.filter((q) => q.id !== id);
    saveLocalQuestions(filtered);

    try {
      // Soft-delete in canonical questions table
      await this.supabase
        .from('questions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      await this.supabase.from('materialized_questions').delete().eq('id', id);
    } catch {
      // fallback saved
    }

    return true;
  }

  async bulkUpsert(questions: AdminQuestion[]): Promise<number> {
    for (const q of questions) {
      await this.save(q);
    }
    return questions.length;
  }

  private mapRowToQuestion(row: any): AdminQuestion {
    return {
      id: row.id,
      code: row.code,
      exam: row.payload?.exam || 'IELTS Academic',
      section: row.payload?.section || 'Reading',
      skill: row.payload?.skill || 'General',
      subSkill: row.payload?.subSkill,
      type: row.payload?.type || 'MCQ',
      difficulty: row.payload?.difficulty || 'MEDIUM',
      status: (row.status?.toUpperCase() as QuestionWorkflowStatus) || 'PUBLISHED',
      usages: row.payload?.usages || ['PRACTICE'],
      estimatedTime: row.payload?.estimatedTime || '2 mins',
      officialSource: row.payload?.officialSource || 'Official',
      version: row.payload?.version || '1.0',
      language: row.payload?.language || 'en',
      tags: Array.isArray(row.tags) ? row.tags : [],
      text: row.prompt || row.payload?.text || '',
      options: row.payload?.options || [],
      correctAnswer: row.payload?.correctAnswer || '',
      explanation: row.explanation || row.payload?.explanation || '',
      passageId: row.payload?.passageId,
      groupId: row.payload?.groupId,
      audioUrl: row.payload?.audioUrl,
      imageUrl: row.payload?.imageUrl,
      hash: row.payload?.hash || `hash_${row.id}`,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }
}
