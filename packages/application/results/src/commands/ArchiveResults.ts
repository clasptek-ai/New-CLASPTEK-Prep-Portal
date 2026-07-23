import { AcademicProgressRepository } from '@clasptek/domain-results';

export interface ArchiveResultsCommand {
  studentId: string;
  resultId: string;
  reason?: string;
}

export class ArchiveResultsHandler {
  constructor(private readonly resultsRepo: AcademicProgressRepository) {}

  public async execute(cmd: ArchiveResultsCommand): Promise<void> {
    if (!cmd.studentId) throw new Error('studentId is required');
    if (!cmd.resultId) throw new Error('resultId is required');

    await this.resultsRepo.recordHistory(cmd.studentId, cmd.resultId, 'ARCHIVED', {
      reason: cmd.reason ?? 'Archived by administrative action',
      archivedAt: new Date().toISOString(),
    });
  }
}
