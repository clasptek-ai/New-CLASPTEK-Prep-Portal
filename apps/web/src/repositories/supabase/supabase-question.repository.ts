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

const STORAGE_KEY = 'clasptek_universal_question_bank';

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
  async findAll(): Promise<AdminQuestion[]> {
    try {
      const res = await fetch('/api/v1/admin/questions?pageSize=10000', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.items || json.data;
        if (items && Array.isArray(items) && items.length > 0) {
          return items;
        }
      }
    } catch (err) {
      console.error('SupabaseQuestionRepository.findAll fallback error:', err);
    }

    return getLocalQuestions();
  }

  async findBySpecification(spec: QuestionSpecification): Promise<PaginatedResult<AdminQuestion>> {
    try {
      const params = new URLSearchParams();
      if (spec.page) params.set('page', spec.page.toString());
      if (spec.pageSize) params.set('pageSize', spec.pageSize.toString());
      if (spec.status) params.set('status', spec.status);
      if (spec.exam) params.set('exam', spec.exam);
      if (spec.section) params.set('section', spec.section);
      if (spec.difficulty) params.set('difficulty', spec.difficulty);
      if (spec.usage) params.set('usage', spec.usage);
      if (spec.search) params.set('search', spec.search);

      const res = await fetch(`/api/v1/admin/questions?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && (json.items || json.data)) {
          const data = json.items || json.data;
          return {
            data,
            total: json.total || data.length,
            page: json.page || spec.page || 1,
            pageSize: json.pageSize || spec.pageSize || 20,
            totalPages: json.totalPages || 1,
            counts: json.counts,
          };
        }
      }
    } catch (err) {
      console.error('SupabaseQuestionRepository.findBySpecification fallback error:', err);
    }

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

  async findByExamAndSection(
    exam?: ExamType,
    section?: QuestionWorkflowStatus
  ): Promise<AdminQuestion[]> {
    const list = await this.findAll();
    return list.filter((q) => {
      if (exam && q.exam !== exam) return false;
      if (section && q.section !== (section as any)) return false;
      return true;
    });
  }

  async save(question: AdminQuestion): Promise<AdminQuestion> {
    const localList = getLocalQuestions();
    const idx = localList.findIndex((q) => q.id === question.id);
    if (idx >= 0) {
      localList[idx] = question;
    } else {
      localList.unshift(question);
    }
    saveLocalQuestions(localList);

    return question;
  }

  async updateStatus(id: string, status: QuestionWorkflowStatus): Promise<boolean> {
    const localList = getLocalQuestions();
    const q = localList.find((item) => item.id === id);
    if (q) {
      q.status = status;
      saveLocalQuestions(localList);
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const localList = getLocalQuestions();
    const filtered = localList.filter((q) => q.id !== id);
    saveLocalQuestions(filtered);
    return true;
  }

  async findForCandidates(exam?: ExamType, usage?: QuestionUsage): Promise<AdminQuestion[]> {
    const list = await this.findAll();
    return list.filter((q) => {
      if (exam && q.exam !== exam) return false;
      if (usage && (!q.usages || !q.usages.includes(usage))) return false;
      return q.status === 'PUBLISHED';
    });
  }

  async bulkUpsert(questions: AdminQuestion[]): Promise<number> {
    const localList = getLocalQuestions();
    questions.forEach((q) => {
      const idx = localList.findIndex((item) => item.id === q.id || item.code === q.code);
      if (idx >= 0) localList[idx] = q;
      else localList.unshift(q);
    });
    saveLocalQuestions(localList);
    return questions.length;
  }
}
