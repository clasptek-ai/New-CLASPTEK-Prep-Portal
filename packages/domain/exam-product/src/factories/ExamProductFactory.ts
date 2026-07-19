import { randomUUID } from 'crypto';
import { ExamProduct } from '../aggregates/exam-product.aggregate';
import { ExamCode } from '../value-objects/ExamCode';
import { ExamProductStatus } from '../value-objects/ExamProductStatus';

export class ExamProductFactory {
  public static create(
    code: string,
    name: string,
    description: string,
    productFamily: string
  ): ExamProduct {
    const id = randomUUID();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return new ExamProduct(
      id,
      new ExamCode(code),
      slug,
      name,
      description,
      productFamily,
      new ExamProductStatus('DRAFT')
    );
  }
}
