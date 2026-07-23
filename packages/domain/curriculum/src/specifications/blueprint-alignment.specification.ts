import { Specification } from '@clasptek/kernel';

export interface BlueprintItemMapping {
  outcomeId: string;
  blueprintItemId: string;
  weight: number;
}

export class BlueprintAlignmentSpecification extends Specification<BlueprintItemMapping[]> {
  public isSatisfiedBy(mappings: BlueprintItemMapping[]): boolean {
    // Total alignment weight should be positive
    return mappings.length > 0 && mappings.every((m) => m.weight >= 0);
  }
}
