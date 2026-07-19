import { AggregateRoot } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';
import { LearningPathPublished } from '../events/LearningPathPublished';

export class LearningPathNode {
  constructor(
    public readonly id: string,
    public readonly learningPathId: string,
    public readonly skillRevisionId: string,
    public readonly nodeType: string,
    public readonly sequenceNo: number,
    public skillLevelId?: string,
    public officialExamComponentId?: string,
    public isRequired: boolean = true,
    public estimatedLearningMinutes?: number,
    public entryMasteryPercentage?: number,
    public exitMasteryPercentage?: number,
    public status: string = 'ACTIVE'
  ) {}
}

export class LearningPath {
  private _nodes: LearningPathNode[] = [];

  constructor(
    public readonly id: string,
    public readonly learningFrameworkId: string,
    public readonly code: string,
    public name: string,
    public pathType: string,
    public displayOrder: number,
    public parentPathId?: string,
    public description?: string,
    public recommendedDurationHours?: number,
    public status: string = 'ACTIVE'
  ) {}

  public get nodes(): readonly LearningPathNode[] {
    return this._nodes;
  }

  public addNode(
    id: string,
    skillRevisionId: string,
    nodeType: string,
    sequenceNo: number
  ): LearningPathNode {
    if (this._nodes.some((n) => n.sequenceNo === sequenceNo)) {
      throw new DomainError(`Node with sequence number ${sequenceNo} already exists in path.`);
    }
    const node = new LearningPathNode(id, this.id, skillRevisionId, nodeType, sequenceNo);
    this._nodes.push(node);
    return node;
  }

  public loadNodes(nodes: LearningPathNode[]): void {
    this._nodes = nodes;
  }
}

export class LearningFramework extends AggregateRoot<string> {
  private _paths: LearningPath[] = [];

  constructor(
    id: string,
    public readonly examProductId: string,
    public readonly examProductVersionId: string,
    public readonly skillFrameworkVersionId: string,
    public readonly code: string,
    public name: string,
    public description?: string,
    public frameworkVersion?: string,
    public status: string = 'ACTIVE',
    public versionNo: number = 1,
    public lockVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get paths(): readonly LearningPath[] {
    return this._paths;
  }

  public addPath(
    id: string,
    code: string,
    name: string,
    pathType: string,
    displayOrder: number,
    parentPathId?: string
  ): LearningPath {
    if (this._paths.some((p) => p.code === code)) {
      throw new DomainError(`Learning path with code ${code} already exists in framework.`);
    }
    const path = new LearningPath(id, this.id, code, name, pathType, displayOrder, parentPathId);
    this._paths.push(path);

    this.addDomainEvent({
      pathId: id,
      learningFrameworkId: this.id,
      code,
      name,
      occurredAt: new Date(),
    } as LearningPathPublished);

    return path;
  }

  public loadPaths(paths: LearningPath[]): void {
    this._paths = paths;
  }
}
