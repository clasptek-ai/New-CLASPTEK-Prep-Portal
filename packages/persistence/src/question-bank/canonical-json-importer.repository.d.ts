import { Pool } from 'pg';
export interface ValidationErrorItem {
    rowNumber: number;
    itemCode: string;
    field: string;
    error: string;
    recommendation: string;
}
export interface JsonValidationResult {
    isValid: boolean;
    totalRecords: number;
    validCount: number;
    warningCount: number;
    invalidCount: number;
    duplicateCount: number;
    errors: ValidationErrorItem[];
    warnings: string[];
}
export interface JsonExportContract {
    schemaVersion: string;
    examType: string;
    assessmentUsages: string[];
    metadata: {
        exportedAt: string;
        totalQuestions: number;
        source: string;
    };
    passages: any[];
    listeningTracks: any[];
    writingTasks: any[];
    speakingTasks: any[];
    mediaAssets: any[];
    questions: any[];
}
export declare class CanonicalJsonImporterRepository {
    private readonly pool;
    private readonly supportedProducts;
    constructor(pool: Pool);
    validateJsonPayload(payload: any): JsonValidationResult;
    importJsonBatch(payload: any, uploadedBy?: string): Promise<{
        batchId: string;
        batchCode: string;
        importedCount: number;
    }>;
    exportJsonBank(filters?: {
        examType?: string;
        status?: string;
    }): Promise<JsonExportContract>;
    getImportHistory(): Promise<any[]>;
    rollbackBatch(batchId: string): Promise<void>;
}
//# sourceMappingURL=canonical-json-importer.repository.d.ts.map