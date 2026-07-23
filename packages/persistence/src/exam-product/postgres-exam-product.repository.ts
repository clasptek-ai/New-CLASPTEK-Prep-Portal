import {
  ExamProductRepository,
  SearchFilters,
  ExamProduct,
  ExamProductVersion,
} from '@clasptek/domain-exam-product';
import {
  ExamProductReadService,
  GetExamProductsQuery,
  ExamProductReadModel,
} from '@clasptek/application-exam-product';
import { ExamCode } from '@clasptek/domain-exam-product';
import { ExamProductStatus } from '@clasptek/domain-exam-product';
import { VersionNumber } from '@clasptek/domain-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresExamProductRepository
  implements ExamProductRepository, ExamProductReadService
{
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<ExamProduct | null> {
    const res = await this.client.query(
      'SELECT * FROM exam_products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<ExamProduct | null> {
    const res = await this.client.query(
      'SELECT * FROM exam_products WHERE code = $1 AND deleted_at IS NULL',
      [code]
    );
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query(
      'SELECT 1 FROM exam_products WHERE code = $1 AND deleted_at IS NULL LIMIT 1',
      [code]
    );
    return res.rows.length > 0;
  }

  public async save(product: ExamProduct): Promise<void> {
    await this.client.query(
      `INSERT INTO exam_products (id, code, slug, name, description, product_family, status, current_version_id, current_version_no, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         current_version_id = EXCLUDED.current_version_id,
         current_version_no = EXCLUDED.current_version_no,
         version_no = exam_products.version_no + 1,
         lock_version = exam_products.lock_version + 1,
         updated_at = now()`,
      [
        product.id,
        product.code.value,
        product.slug,
        product.name,
        product.description,
        product.productFamily,
        product.status.value,
        product.currentVersionId || null,
        product.currentVersionNo || null,
        product.versionNo,
        product.lockVersion,
        product.createdAt,
        product.updatedAt,
      ]
    );

    // Save versions
    for (const v of product.versions) {
      await this.client.query(
        `INSERT INTO exam_product_versions (id, exam_product_id, version_no, status, name, description, published_at, published_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           published_at = EXCLUDED.published_at,
           published_by = EXCLUDED.published_by`,
        [
          v.id,
          product.id,
          v.versionNo.value,
          v.status,
          v.name,
          v.description || null,
          v.publishedAt || null,
          v.publishedBy || null,
        ]
      );
    }
  }

  public async search(filters: SearchFilters): Promise<ExamProduct[]> {
    let sql = 'SELECT * FROM exam_products WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (filters.code) {
      params.push(filters.code);
      sql += ` AND code = $${params.length}`;
    }
    if (filters.status) {
      params.push(filters.status);
      sql += ` AND status = $${params.length}`;
    }
    const res = await this.client.query(sql, params);
    const list: ExamProduct[] = [];
    for (const row of res.rows) {
      list.push(await this._hydrate(row));
    }
    return list;
  }

  // Read Model Service Methods
  public async getExamProducts(query: GetExamProductsQuery): Promise<ExamProductReadModel[]> {
    let sql = 'SELECT * FROM vw_exam_products';
    const params: any[] = [];
    if (query.code) {
      params.push(query.code);
      sql += ` WHERE product_code = $1`;
    }
    const res = await this.client.query(sql, params);
    return res.rows.map((r: any) => ({
      productId: r.product_id,
      productCode: r.product_code,
      productSlug: r.product_slug,
      productName: r.product_name,
      productFamily: r.product_family,
      productStatus: r.product_status,
      versionId: r.version_id || undefined,
      versionNo: r.version_no || undefined,
      versionStatus: r.version_status || undefined,
      versionName: r.version_name || undefined,
      durationMinutes: r.duration_minutes ? Number(r.duration_minutes) : undefined,
      examType: r.exam_type || undefined,
    }));
  }

  public async getExamProductById(id: string): Promise<ExamProductReadModel | null> {
    const res = await this.client.query('SELECT * FROM vw_exam_products WHERE product_id = $1', [
      id,
    ]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      productId: r.product_id,
      productCode: r.product_code,
      productSlug: r.product_slug,
      productName: r.product_name,
      productFamily: r.product_family,
      productStatus: r.product_status,
      versionId: r.version_id || undefined,
      versionNo: r.version_no || undefined,
      versionStatus: r.version_status || undefined,
      versionName: r.version_name || undefined,
      durationMinutes: r.duration_minutes ? Number(r.duration_minutes) : undefined,
      examType: r.exam_type || undefined,
    };
  }

  private async _hydrate(row: any): Promise<ExamProduct> {
    const product = new ExamProduct(
      row.id,
      new ExamCode(row.code),
      row.slug,
      row.name,
      row.description || '',
      row.product_family,
      new ExamProductStatus(row.status),
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );
    product.currentVersionId = row.current_version_id || undefined;
    product.currentVersionNo = row.current_version_no || undefined;

    // Hydrate versions
    const verRes = await this.client.query(
      'SELECT * FROM exam_product_versions WHERE exam_product_id = $1 AND deleted_at IS NULL',
      [product.id]
    );
    const versions = verRes.rows.map(
      (v: any) =>
        new ExamProductVersion(
          v.id,
          v.exam_product_id,
          new VersionNumber(v.version_no),
          v.status,
          v.name,
          v.description || undefined,
          v.official_board_name || undefined,
          v.official_board_code || undefined,
          v.official_website || undefined,
          v.duration_minutes || undefined,
          v.validity_period_months || undefined,
          v.primary_language_code,
          v.exam_type || undefined,
          v.published_at || undefined,
          v.published_by || undefined
        )
    );
    product.loadVersions(versions);
    return product;
  }
}
