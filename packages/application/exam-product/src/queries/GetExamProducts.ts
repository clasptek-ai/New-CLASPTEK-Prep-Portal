import { Result } from '@clasptek/kernel';
import { ExamProductReadModel } from '../read-models/ExamProductReadModel';

export interface GetExamProductsQuery {
  code?: string;
  status?: string;
}

export interface ExamProductReadService {
  getExamProducts(query: GetExamProductsQuery): Promise<ExamProductReadModel[]>;
  getExamProductById(id: string): Promise<ExamProductReadModel | null>;
}

export class GetExamProductsHandler {
  constructor(private readonly readService: ExamProductReadService) {}

  public async execute(
    query: GetExamProductsQuery
  ): Promise<Result<ExamProductReadModel[], Error>> {
    try {
      const results = await this.readService.getExamProducts(query);
      return Result.success(results);
    } catch (err: any) {
      return Result.failure(err);
    }
  }
}
