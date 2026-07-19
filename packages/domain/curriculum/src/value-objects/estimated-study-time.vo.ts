import { ValueObject, ValidationError } from '@clasptek/kernel';

export class EstimatedStudyTime extends ValueObject<{ minutes: number }> {
  constructor(minutes: number) {
    if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
      throw new ValidationError('Estimated study time minutes must be a positive integer.');
    }
    super({ minutes });
  }

  public get minutes(): number {
    return this.props.minutes;
  }
}
