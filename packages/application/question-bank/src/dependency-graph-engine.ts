export type ResourceType = 'QUESTION' | 'PASSAGE' | 'MEDIA' | 'ASSESSMENT' | 'PRACTICE' | 'MOCK';

export interface ResourceNode {
  id: string;
  type: ResourceType;
  label: string;
}

export interface DependencyEdge {
  fromId: string;
  fromType: ResourceType;
  toId: string;
  toType: ResourceType;
  relationship: string;
}

export interface DeletionImpactReport {
  resourceId: string;
  resourceType: ResourceType;
  canSafeDelete: boolean;
  dependentCount: number;
  dependents: Array<{ id: string; type: ResourceType; label: string }>;
  blockingReasons: string[];
}

export interface MediaUsageReport {
  mediaId: string;
  totalReferences: number;
  referencingQuestions: string[];
  referencingPassages: string[];
  referencingAssessments: string[];
}

/**
 * DependencyGraphEngine
 *
 * Application service managing multi-resource dependency graphs between
 * Passages, Media, Questions, Assessments, Practice Sets, and Mock Exams.
 * Supports cycle detection, pre-deletion impact reports, and media usage reports.
 */
export class DependencyGraphEngine {
  private nodes = new Map<string, ResourceNode>();
  private edges: DependencyEdge[] = [];

  public registerResource(id: string, type: ResourceType, label: string): void {
    this.nodes.set(id, { id, type, label });
  }

  public addDependency(
    fromId: string,
    fromType: ResourceType,
    toId: string,
    toType: ResourceType,
    relationship: string
  ): void {
    if (!this.nodes.has(fromId)) this.registerResource(fromId, fromType, fromId);
    if (!this.nodes.has(toId)) this.registerResource(toId, toType, toId);

    const exists = this.edges.some(
      (e) => e.fromId === fromId && e.toId === toId && e.relationship === relationship
    );
    if (!exists) {
      this.edges.push({ fromId, fromType, toId, toType, relationship });
    }
  }

  public removeDependency(fromId: string, toId: string): void {
    this.edges = this.edges.filter((e) => !(e.fromId === fromId && e.toId === toId));
  }

  public detectCycles(): boolean {
    const adj = new Map<string, string[]>();
    for (const nodeKey of this.nodes.keys()) {
      adj.set(nodeKey, []);
    }
    for (const edge of this.edges) {
      if (!adj.has(edge.fromId)) adj.set(edge.fromId, []);
      adj.get(edge.fromId)!.push(edge.toId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle found
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }

    return false;
  }

  public analyzeDeletionImpact(
    resourceId: string,
    resourceType: ResourceType
  ): DeletionImpactReport {
    // Dependents are resources that depend on (point to) this resource
    const directDependents = this.edges.filter((e) => e.toId === resourceId);

    const dependents = directDependents.map((e) => {
      const node = this.nodes.get(e.fromId);
      return {
        id: e.fromId,
        type: e.fromType,
        label: node?.label || e.fromId,
      };
    });

    const blockingReasons: string[] = [];
    if (dependents.length > 0) {
      blockingReasons.push(
        `Resource '${resourceId}' is referenced by ${dependents.length} active resource(s): ${dependents.map((d) => d.id).join(', ')}.`
      );
    }

    return {
      resourceId,
      resourceType,
      canSafeDelete: dependents.length === 0,
      dependentCount: dependents.length,
      dependents,
      blockingReasons,
    };
  }

  public generateMediaUsageReport(mediaId: string): MediaUsageReport {
    const referencingEdges = this.edges.filter((e) => e.toId === mediaId && e.toType === 'MEDIA');

    const referencingQuestions = referencingEdges
      .filter((e) => e.fromType === 'QUESTION')
      .map((e) => e.fromId);
    const referencingPassages = referencingEdges
      .filter((e) => e.fromType === 'PASSAGE')
      .map((e) => e.fromId);
    const referencingAssessments = referencingEdges
      .filter((e) => ['ASSESSMENT', 'PRACTICE', 'MOCK'].includes(e.fromType))
      .map((e) => e.fromId);

    return {
      mediaId,
      totalReferences: referencingEdges.length,
      referencingQuestions,
      referencingPassages,
      referencingAssessments,
    };
  }
}
