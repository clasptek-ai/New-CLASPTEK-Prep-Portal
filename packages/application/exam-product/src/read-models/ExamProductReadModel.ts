export interface ExamProductReadModel {
  productId: string;
  productCode: string;
  productSlug: string;
  productName: string;
  productFamily: string;
  productStatus: string;
  versionId?: string | undefined;
  versionNo?: string | undefined;
  versionStatus?: string | undefined;
  versionName?: string | undefined;
  durationMinutes?: number | undefined;
  examType?: string | undefined;
}
