import { ValueObject } from '@clasptek/kernel';

export class ProgressScore extends ValueObject<{ value: number; maxScore: number }> {
  constructor(value: number, maxScore: number = 100) {
    if (value < 0) throw new Error('ProgressScore value cannot be negative');
    if (maxScore <= 0) throw new Error('Max score must be positive');
    if (value > maxScore) throw new Error('ProgressScore value cannot exceed max score');
    super({ value, maxScore });
  }

  get value(): number {
    return this.props.value;
  }
  get maxScore(): number {
    return this.props.maxScore;
  }
  get percentage(): number {
    return (this.props.value / this.props.maxScore) * 100;
  }
}
