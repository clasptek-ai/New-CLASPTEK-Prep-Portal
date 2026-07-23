import { ValueObject } from '@clasptek/kernel';

export type PerformanceTrendType = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE';

export class PerformanceTrend extends ValueObject<{ trend: PerformanceTrendType }> {
  constructor(trend: PerformanceTrendType) {
    const valid: PerformanceTrendType[] = ['IMPROVING', 'STABLE', 'DECLINING', 'VOLATILE'];
    if (!valid.includes(trend)) {
      throw new Error(`Invalid PerformanceTrend: ${trend}`);
    }
    super({ trend });
  }

  get trend(): PerformanceTrendType {
    return this.props.trend;
  }
  get isImproving(): boolean {
    return this.props.trend === 'IMPROVING';
  }
  get isDeclining(): boolean {
    return this.props.trend === 'DECLINING';
  }
}
