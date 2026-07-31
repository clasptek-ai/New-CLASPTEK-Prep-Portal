import {
  AdminQuestion,
  ExamType,
  QuestionUsage,
  QuestionWorkflowStatus,
  SectionType,
  DifficultyLevel,
} from '../../services/admin/questions.service';

export interface QuestionSpecification {
  status?: QuestionWorkflowStatus | 'ALL';
  exam?: ExamType | 'ALL';
  section?: SectionType | 'ALL';
  difficulty?: DifficultyLevel | 'ALL';
  usage?: QuestionUsage;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'code' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IQuestionRepository {
  findAll(): Promise<AdminQuestion[]>;
  findBySpecification(spec: QuestionSpecification): Promise<PaginatedResult<AdminQuestion>>;
  findById(id: string): Promise<AdminQuestion | null>;
  findByCode(code: string): Promise<AdminQuestion | null>;
  findForCandidates(exam?: ExamType, usage?: QuestionUsage): Promise<AdminQuestion[]>;
  save(question: AdminQuestion): Promise<AdminQuestion>;
  updateStatus(id: string, status: QuestionWorkflowStatus): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  bulkUpsert(questions: AdminQuestion[]): Promise<number>;
}
