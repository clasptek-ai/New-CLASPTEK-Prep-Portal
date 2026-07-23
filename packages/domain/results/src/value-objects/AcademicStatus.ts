import { ValueObject } from '@clasptek/kernel';

export type AcademicStatusType = 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'EXCELLING';

export class AcademicStatus extends ValueObject<{ status: AcademicStatusType }> {
  constructor(status: AcademicStatusType) {
    const valid: AcademicStatusType[] = ['ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK', 'EXCELLING'];
    if (!valid.includes(status)) {
      throw new Error(`Invalid AcademicStatus: ${status}`);
    }
    super({ status });
  }

  get status(): AcademicStatusType {
    return this.props.status;
  }
  get isAtRisk(): boolean {
    return this.props.status === 'AT_RISK';
  }
  get isExcelling(): boolean {
    return this.props.status === 'EXCELLING';
  }
}
