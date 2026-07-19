import { Specification } from '@clasptek/kernel';

export interface LearningPathNode {
  id: string;
  moduleId: string;
  sequenceNo: number;
}

export class LearningPathCoverageSpecification extends Specification<LearningPathNode[]> {
  public isSatisfiedBy(nodes: LearningPathNode[]): boolean {
    // Check if learning path has nodes mapped to learning modules
    return nodes.length > 0;
  }
}
