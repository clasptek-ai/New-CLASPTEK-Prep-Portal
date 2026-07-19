import { Pool } from 'pg';
import { ResourceCollection, ResourceCollectionRepository } from '@clasptek/domain-learning-resources';
import { randomUUID } from 'crypto';

export class PostgresResourceCollectionRepository implements ResourceCollectionRepository {
  private readonly pool: Pool;
  constructor(poolOrDbPool: Pool | { getPool(): Pool }) {
    this.pool = 'getPool' in poolOrDbPool ? poolOrDbPool.getPool() : poolOrDbPool;
  }

  public async save(collection: ResourceCollection): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert or update resource_collections
      const colQuery = `
        INSERT INTO public.resource_collections (
          id, parent_collection_id, code, name, description, display_order, status, lock_version, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
        ON CONFLICT (id) DO UPDATE SET
          parent_collection_id = EXCLUDED.parent_collection_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          display_order = EXCLUDED.display_order,
          status = EXCLUDED.status,
          lock_version = resource_collections.lock_version + 1,
          updated_at = now()
      `;
      await client.query(colQuery, [
        collection.id,
        collection.parentCollectionId,
        collection.code,
        collection.name,
        collection.description,
        collection.displayOrder,
        collection.status,
        collection.lockVersion
      ]);

      // 2. Sync members list inside collection_resources
      // Clear old members
      await client.query(`DELETE FROM public.collection_resources WHERE resource_collection_id = $1`, [collection.id]);
      
      // Re-insert sorted membership lists
      let order = 1;
      for (const resId of collection.resourceIds) {
        await client.query(
          `INSERT INTO public.collection_resources (id, resource_collection_id, learning_resource_id, display_order)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [collection.id, resId, order++]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async findById(id: string): Promise<ResourceCollection | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.resource_collections WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<ResourceCollection | null> {
    const res = await this.pool.query(
      `SELECT * FROM public.resource_collections WHERE code = $1 AND deleted_at IS NULL`,
      [code]
    );
    if (res.rows.length === 0) return null;

    return this.mapToAggregate(res.rows[0]);
  }

  public nextIdentity(): string {
    return randomUUID();
  }

  private async mapToAggregate(row: any): Promise<ResourceCollection> {
    const resourcesRes = await this.pool.query(
      `SELECT learning_resource_id FROM public.collection_resources WHERE resource_collection_id = $1 ORDER BY display_order ASC`,
      [row.id]
    );

    const col = new ResourceCollection(
      row.id,
      row.parent_collection_id,
      row.code,
      row.name,
      row.description,
      Number(row.display_order),
      row.status as 'draft' | 'active' | 'archived',
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    col.setResourceIds(resourcesRes.rows.map(r => r.learning_resource_id));
    return col;
  }
}
