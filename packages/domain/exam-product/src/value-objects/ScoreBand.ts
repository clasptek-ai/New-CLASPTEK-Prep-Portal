import { ValueObject } from '@clasptek/kernel';
import { DomainError } from '../errors/exam-product-errors';

interface ScoreBandProps {
  minScore: number;
  maxScore: number;
}

export class ScoreBand extends ValueObject<ScoreBandProps> {
  constructor(props: ScoreBandProps) {
    if (props.minScore < 0 || props.maxScore < 0) {
      throw new DomainError('Scores inside a score band cannot be negative.');
    }
    if (props.maxScore < props.minScore) {
      throw new DomainError('Maximum score cannot be less than minimum score.');
    }
    super(props);
  }

  public get minScore(): number {
    return this.props.minScore;
  }

  public get maxScore(): number {
    return this.props.maxScore;
  }

  public isInBand(score: number): boolean {
    return score >= this.minScore && score <= this.maxScore;
  }
}
