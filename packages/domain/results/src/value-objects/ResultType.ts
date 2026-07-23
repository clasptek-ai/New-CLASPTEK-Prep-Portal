import { ValueObject } from '@clasptek/kernel';

export type ResultTypeEnum =
  'ASSESSMENT' | 'PRACTICE' | 'MOCK' | 'WRITING_EVALUATION' | 'SPEAKING_EVALUATION';

export class ResultType extends ValueObject<{ type: ResultTypeEnum }> {
  constructor(type: ResultTypeEnum) {
    const valid: ResultTypeEnum[] = [
      'ASSESSMENT',
      'PRACTICE',
      'MOCK',
      'WRITING_EVALUATION',
      'SPEAKING_EVALUATION',
    ];
    if (!valid.includes(type)) {
      throw new Error(`Invalid ResultType: ${type}`);
    }
    super({ type });
  }

  get type(): ResultTypeEnum {
    return this.props.type;
  }
  get isEvaluation(): boolean {
    return this.props.type === 'WRITING_EVALUATION' || this.props.type === 'SPEAKING_EVALUATION';
  }
}
