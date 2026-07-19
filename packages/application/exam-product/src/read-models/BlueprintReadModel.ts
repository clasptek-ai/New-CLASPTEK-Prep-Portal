export interface BlueprintReadModel {
  blueprintId: string;
  blueprintCode: string;
  blueprintName: string;
  componentName: string;
  itemId?: string | undefined;
  itemCode?: string | undefined;
  itemName?: string | undefined;
  itemTypeName?: string | undefined;
  targetItemCount?: number | undefined;
  weightPercentage?: number | undefined;
}
