import { AggregateRoot } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// GOLDEN DATASET — Benchmark dataset metadata management
// ═══════════════════════════════════════════════════════════════════

/**
 * A single benchmark item within a golden dataset.
 * Loaded from JSON files on the filesystem.
 */
export interface GoldenDatasetItem {
  id: string;
  assessmentType: string;
  skillCode: string;
  content: string;
  officialScore: number;
  criteria: Record<string, number>;
  examinerFeedback?: string;
  source?: string;
  verified: boolean;
}

/**
 * Statistics computed from a golden dataset.
 */
export interface GoldenDatasetStatistics {
  itemCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  scoreDistribution: Map<number, number>;
  criterionAverages: Map<string, number>;
}

/**
 * GoldenDataset manages metadata for benchmark datasets used in
 * calibration sessions and prompt experiments. Scoped by assessment
 * type + skill code. References dataset files by path rather than
 * embedding content.
 */
export class GoldenDataset extends AggregateRoot<string> {
  public readonly datasetCode: string;
  public readonly assessmentType: string;
  public readonly skillCode: string;
  public readonly displayName: string;
  public readonly datasetPath: string;
  private _itemCount: number;
  public readonly source: string;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    datasetCode: string;
    assessmentType: string;
    skillCode: string;
    displayName: string;
    datasetPath: string;
    itemCount?: number;
    source?: string;
    createdAt?: Date;
  }) {
    super(props.id);
    if (!props.datasetCode) throw new Error('GoldenDataset datasetCode cannot be empty');
    if (!props.assessmentType) throw new Error('GoldenDataset assessmentType cannot be empty');
    if (!props.skillCode) throw new Error('GoldenDataset skillCode cannot be empty');
    if (!props.datasetPath) throw new Error('GoldenDataset datasetPath cannot be empty');

    this.datasetCode = props.datasetCode;
    this.assessmentType = props.assessmentType;
    this.skillCode = props.skillCode;
    this.displayName = props.displayName;
    this.datasetPath = props.datasetPath;
    this._itemCount = props.itemCount ?? 0;
    this.source = props.source ?? '';
    this.createdAt = props.createdAt ?? new Date();
  }

  get itemCount(): number {
    return this._itemCount;
  }

  /** Update item count after dataset file changes. */
  public setItemCount(count: number): void {
    if (count < 0) throw new Error('Item count cannot be negative');
    this._itemCount = count;
  }

  /** Compute statistics from loaded items. */
  public computeStatistics(items: GoldenDatasetItem[]): GoldenDatasetStatistics {
    if (items.length === 0) {
      return {
        itemCount: 0,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        scoreDistribution: new Map(),
        criterionAverages: new Map(),
      };
    }

    const scores = items.map((i) => i.officialScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Score distribution
    const scoreDistribution = new Map<number, number>();
    for (const score of scores) {
      scoreDistribution.set(score, (scoreDistribution.get(score) ?? 0) + 1);
    }

    // Criterion averages
    const criterionSums = new Map<string, number>();
    const criterionCounts = new Map<string, number>();
    for (const item of items) {
      for (const [code, value] of Object.entries(item.criteria)) {
        criterionSums.set(code, (criterionSums.get(code) ?? 0) + value);
        criterionCounts.set(code, (criterionCounts.get(code) ?? 0) + 1);
      }
    }
    const criterionAverages = new Map<string, number>();
    for (const [code, sum] of criterionSums) {
      criterionAverages.set(code, sum / (criterionCounts.get(code) ?? 1));
    }

    return {
      itemCount: items.length,
      averageScore,
      minScore,
      maxScore,
      scoreDistribution,
      criterionAverages,
    };
  }

  public static create(props: {
    datasetCode: string;
    assessmentType: string;
    skillCode: string;
    displayName: string;
    datasetPath: string;
    source?: string;
  }): GoldenDataset {
    return new GoldenDataset({ id: randomUUID(), ...props });
  }
}
