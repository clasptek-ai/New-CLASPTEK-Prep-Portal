import { ExamProduct } from '../aggregates/exam-product.aggregate';

export interface SearchFilters {
  code?: string;
  status?: string;
  productFamily?: string;
}

export interface ExamProductRepository {
  findById(id: string): Promise<ExamProduct | null>;
  findByCode(code: string): Promise<ExamProduct | null>;
  save(product: ExamProduct): Promise<void>;
  exists(code: string): Promise<boolean>;
  search(filters: SearchFilters): Promise<ExamProduct[]>;
}
