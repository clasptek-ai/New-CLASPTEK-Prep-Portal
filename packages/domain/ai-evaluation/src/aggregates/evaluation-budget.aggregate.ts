import { AggregateRoot } from '@clasptek/kernel';

export class EvaluationBudget extends AggregateRoot<string> {
  private _dailyLimit: number;
  private _monthlyLimit: number;
  private _dailySpend: number;
  private _monthlySpend: number;

  constructor(props: {
    id: string;
    dailyLimit: number;
    monthlyLimit: number;
    dailySpend?: number | undefined;
    monthlySpend?: number | undefined;
  }) {
    super(props.id);
    this._dailyLimit = props.dailyLimit;
    this._monthlyLimit = props.monthlyLimit;
    this._dailySpend = props.dailySpend ?? 0.0;
    this._monthlySpend = props.monthlySpend ?? 0.0;
  }

  get dailySpend(): number {
    return this._dailySpend;
  }

  get monthlySpend(): number {
    return this._monthlySpend;
  }

  get isDailyExceeded(): boolean {
    return this._dailySpend >= this._dailyLimit;
  }

  get isMonthlyExceeded(): boolean {
    return this._monthlySpend >= this._monthlyLimit;
  }

  public recordSpend(costUsd: number): void {
    this._dailySpend += costUsd;
    this._monthlySpend += costUsd;
  }

  public resetDaily(): void {
    this._dailySpend = 0.0;
  }

  public resetMonthly(): void {
    this._dailySpend = 0.0;
    this._monthlySpend = 0.0;
  }
}
