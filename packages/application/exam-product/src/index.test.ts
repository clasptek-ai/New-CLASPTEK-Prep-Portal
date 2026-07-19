import { describe, test, expect, beforeEach } from 'vitest';
import {
  ExamProduct,
  ExamProductRepository,
  SearchFilters,
} from '@clasptek/domain-exam-product';
import {
  CreateExamProductHandler,
  IUnitOfWork,
} from './index';

class MockUnitOfWork implements IUnitOfWork {
  public began = false;
  public committed = false;
  public rolledBack = false;
  public outbox: any[] = [];

  public async begin(): Promise<void> {
    this.began = true;
  }
  public async commit(): Promise<void> {
    this.committed = true;
  }
  public async rollback(): Promise<void> {
    this.rolledBack = true;
  }
  public registerOutbox(event: any): void {
    this.outbox.push(event);
  }
}

class InMemoryExamProductRepository implements ExamProductRepository {
  private products = new Map<string, ExamProduct>();

  public async findById(id: string): Promise<ExamProduct | null> {
    return this.products.get(id) || null;
  }

  public async findByCode(code: string): Promise<ExamProduct | null> {
    return Array.from(this.products.values()).find((p) => p.code.value === code) || null;
  }

  public async save(product: ExamProduct): Promise<void> {
    this.products.set(product.id, product);
  }

  public async exists(code: string): Promise<boolean> {
    return Array.from(this.products.values()).some((p) => p.code.value === code);
  }

  public async search(filters: SearchFilters): Promise<ExamProduct[]> {
    let list = Array.from(this.products.values());
    if (filters.code) {
      list = list.filter((p) => p.code.value === filters.code);
    }
    return list;
  }
}

describe('Exam Product Application CQRS Handlers Tests', () => {
  let repo: InMemoryExamProductRepository;
  let uow: MockUnitOfWork;
  let createHandler: CreateExamProductHandler;

  beforeEach(() => {
    repo = new InMemoryExamProductRepository();
    uow = new MockUnitOfWork();
    createHandler = new CreateExamProductHandler(repo, uow);
  });

  test('CreateExamProductHandler creates product successfully', async () => {
    const res = await createHandler.execute({
      code: 'IELTS-AC',
      name: 'IELTS Academic',
      description: 'Language proficiency exam',
      productFamily: 'language_proficiency',
    });

    expect(res.isSuccess).toBe(true);
    expect(res.value).toBeDefined();

    const product = await repo.findById(res.value!);
    expect(product).not.toBeNull();
    expect(product!.code.value).toBe('IELTS-AC');
    expect(product!.name).toBe('IELTS Academic');
    expect(product!.status.value).toBe('DRAFT');
  });

  test('CreateExamProductHandler rejects duplicate code', async () => {
    await createHandler.execute({
      code: 'IELTS-AC',
      name: 'IELTS Academic',
      description: 'Language proficiency exam',
      productFamily: 'language_proficiency',
    });

    const res = await createHandler.execute({
      code: 'IELTS-AC',
      name: 'IELTS Academic Duplicate',
      description: 'Duplicate exam',
      productFamily: 'language_proficiency',
    });

    expect(res.isFailure).toBe(true);
    expect(res.error.message).toContain('already exists');
  });
});
