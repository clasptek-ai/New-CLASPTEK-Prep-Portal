export interface GetReportQuery {
  reportId: string;
  studentId: string;
}

export interface ReportQueryRepository {
  findReportById(
    reportId: string,
    studentId: string
  ): Promise<{
    id: string;
    studentId: string;
    reportType: string;
    title: string;
    status: string;
    fileFormat: string;
    content: Record<string, any>;
    generatedAt: Date;
  } | null>;
}

export class GetReportHandler {
  constructor(private readonly reportQueryRepo: ReportQueryRepository) {}

  public async execute(query: GetReportQuery) {
    if (!query.reportId) throw new Error('reportId is required');
    if (!query.studentId) throw new Error('studentId is required');

    return this.reportQueryRepo.findReportById(query.reportId, query.studentId);
  }
}
