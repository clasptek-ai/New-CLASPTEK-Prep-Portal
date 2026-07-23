export class MockTimingService {
  public calculateRemainingSeconds(startedAt: Date, durationMinutes: number): number {
    const elapsedMs = Date.now() - startedAt.getTime();
    const totalSeconds = durationMinutes * 60;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }

  public isExpired(startedAt: Date, durationMinutes: number): boolean {
    return this.calculateRemainingSeconds(startedAt, durationMinutes) <= 0;
  }

  public isOvertime(
    startedAt: Date,
    durationMinutes: number,
    gracePeriodSeconds: number = 30
  ): boolean {
    const elapsedMs = Date.now() - startedAt.getTime();
    const maxAllowedMs = (durationMinutes * 60 + gracePeriodSeconds) * 1000;
    return elapsedMs > maxAllowedMs;
  }
}
