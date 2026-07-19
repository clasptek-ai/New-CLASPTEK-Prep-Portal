import { AssessmentBlueprintRepository, AssessmentBlueprint, AssessmentBlueprintItem } from '@clasptek/domain-exam-product';
import { BlueprintReadService, BlueprintReadModel } from '@clasptek/application-exam-product';
import { PostgresUnitOfWork } from './postgres-unit-of-work';

export class PostgresBlueprintRepository implements AssessmentBlueprintRepository, BlueprintReadService {
  constructor(private readonly uow: PostgresUnitOfWork) {}

  private get client() {
    return this.uow.getActiveClient();
  }

  public async findById(id: string): Promise<AssessmentBlueprint | null> {
    const res = await this.client.query('SELECT * FROM assessment_blueprints WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async findByCode(code: string): Promise<AssessmentBlueprint | null> {
    const res = await this.client.query('SELECT * FROM assessment_blueprints WHERE code = $1 AND deleted_at IS NULL', [code]);
    if (res.rows.length === 0) return null;
    return this._hydrate(res.rows[0]);
  }

  public async exists(code: string): Promise<boolean> {
    const res = await this.client.query('SELECT 1 FROM assessment_blueprints WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [code]);
    return res.rows.length > 0;
  }

  public async save(blueprint: AssessmentBlueprint): Promise<void> {
    await this.client.query(
      `INSERT INTO assessment_blueprints (id, exam_product_id, exam_product_version_id, official_exam_component_id, code, name, description, blueprint_version, minimum_total_items, maximum_total_items, target_total_items, total_weight_percentage, time_budget_minutes, status, version_no, lock_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         target_total_items = EXCLUDED.target_total_items,
         status = EXCLUDED.status,
         updated_at = now()`,
      [
        blueprint.id,
        blueprint.examProductId,
        blueprint.examProductVersionId,
        blueprint.officialExamComponentId,
        blueprint.code,
        blueprint.name,
        blueprint.description || null,
        blueprint.blueprintVersion || null,
        blueprint.minimumTotalItems || null,
        blueprint.maximumTotalItems || null,
        blueprint.targetTotalItems || null,
        blueprint.totalWeightPercentage || null,
        blueprint.timeBudgetMinutes || null,
        blueprint.status,
        blueprint.versionNo,
        blueprint.lockVersion,
        blueprint.createdAt,
        blueprint.updatedAt,
      ]
    );

    // Save items
    for (const item of blueprint.items) {
      await this.client.query(
        `INSERT INTO assessment_blueprint_items (id, assessment_blueprint_id, assessment_item_type_id, code, name, difficulty_level_id, cognitive_level_id, evidence_type_id, skill_group_id, minimum_item_count, maximum_item_count, target_item_count, weight_percentage, time_budget_minutes, is_required, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           target_item_count = EXCLUDED.target_item_count,
           status = EXCLUDED.status`,
        [
          item.id,
          blueprint.id,
          item.assessmentItemTypeId,
          item.code,
          item.name,
          item.difficultyLevelId || null,
          item.cognitiveLevelId || null,
          item.evidenceTypeId || null,
          item.skillGroupId || null,
          item.minimumItemCount || null,
          item.maximumItemCount || null,
          item.targetItemCount || null,
          item.weightPercentage || null,
          item.timeBudgetMinutes || null,
          item.isRequired,
          item.status,
        ]
      );
    }
  }

  // Read Model Queries
  public async getBlueprint(blueprintId: string): Promise<BlueprintReadModel[]> {
    const res = await this.client.query('SELECT * FROM vw_assessment_blueprints WHERE blueprint_id = $1', [blueprintId]);
    return res.rows.map((r: any) => ({
      blueprintId: r.blueprint_id,
      blueprintCode: r.blueprint_code,
      blueprintName: r.blueprint_name,
      componentName: r.component_name,
      itemId: r.item_id || undefined,
      itemCode: r.item_code || undefined,
      itemName: r.item_name || undefined,
      itemTypeName: r.item_type_name || undefined,
      targetItemCount: r.target_item_count ? Number(r.target_item_count) : undefined,
      weightPercentage: r.weight_percentage ? Number(r.weight_percentage) : undefined,
    }));
  }

  private async _hydrate(row: any): Promise<AssessmentBlueprint> {
    const blueprint = new AssessmentBlueprint(
      row.id,
      row.exam_product_id,
      row.exam_product_version_id,
      row.official_exam_component_id,
      row.code,
      row.name,
      row.description || undefined,
      row.blueprint_version || undefined,
      row.minimum_total_items ? Number(row.minimum_total_items) : undefined,
      row.maximum_total_items ? Number(row.maximum_total_items) : undefined,
      row.target_total_items ? Number(row.target_total_items) : undefined,
      row.total_weight_percentage ? Number(row.total_weight_percentage) : undefined,
      row.time_budget_minutes ? Number(row.time_budget_minutes) : undefined,
      row.status,
      Number(row.version_no),
      Number(row.lock_version),
      row.created_at,
      row.updated_at,
      row.deleted_at
    );

    // Hydrate items
    const itemRes = await this.client.query('SELECT * FROM assessment_blueprint_items WHERE assessment_blueprint_id = $1 AND deleted_at IS NULL', [blueprint.id]);
    const items = itemRes.rows.map(
      (i: any) =>
        new AssessmentBlueprintItem(
          i.id,
          i.assessment_blueprint_id,
          i.assessment_item_type_id,
          i.code,
          i.name,
          i.difficulty_level_id || undefined,
          i.cognitive_level_id || undefined,
          i.evidence_type_id || undefined,
          i.skill_group_id || undefined,
          i.minimum_item_count || undefined,
          i.maximum_item_count || undefined,
          i.target_item_count || undefined,
          i.weight_percentage ? Number(i.weight_percentage) : undefined,
          i.time_budget_minutes || undefined,
          i.is_required,
          i.status
        )
    );
    blueprint.loadItems(items);

    return blueprint;
  }
}
