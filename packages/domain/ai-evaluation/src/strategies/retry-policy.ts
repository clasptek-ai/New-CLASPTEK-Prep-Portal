export class RetryPolicy {
  constructor(
    private readonly maxRetries: number = 3,
    private readonly initialDelaySeconds: number = 5,
    private readonly backoffMultiplier: number = 2.0
  ) {}

  public calculateDelay(currentAttempt: number): number {
    if (currentAttempt <= 0) return 0;
    return this.initialDelaySeconds * Math.pow(this.backoffMultiplier, currentAttempt - 1);
  }

  public shouldRetry(currentAttempt: number): boolean {
    return currentAttempt < this.maxRetries;
  }
}
