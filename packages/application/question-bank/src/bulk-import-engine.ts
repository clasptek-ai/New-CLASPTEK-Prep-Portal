export interface ImportRecord {
  code: string;
  questionText: string;
  skill: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  examProduct: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks?: number;
  estimatedTimeSeconds?: number;
}

export interface ValidationError {
  rowIndex: number;
  code: string;
  field: string;
  message: string;
}

export interface ImportValidationReport {
  totalRecords: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  records: ImportRecord[];
  errors: ValidationError[];
}

export class BulkImportEngine {
  public parseAndValidate(
    fileType: 'xlsx' | 'csv' | 'json',
    rawContent: string
  ): ImportValidationReport {
    let records: ImportRecord[] = [];
    const errors: ValidationError[] = [];

    if (fileType === 'json') {
      try {
        const parsed = JSON.parse(rawContent);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return {
          totalRecords: 0,
          validCount: 0,
          invalidCount: 1,
          duplicateCount: 0,
          records: [],
          errors: [
            {
              rowIndex: 0,
              code: 'INVALID_JSON',
              field: 'file',
              message: 'Failed to parse JSON file',
            },
          ],
        };
      }
    } else {
      // CSV or XLSX simple line parser
      const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
      lines.slice(1).forEach((line, idx) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 4) {
          records.push({
            code: parts[0] || `Q-${idx + 1}`,
            questionText: parts[1] || 'Sample Question',
            skill: parts[2] || 'Grammar',
            difficulty: (parts[3] as any) || 'MEDIUM',
            examProduct: 'IELTS',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            marks: 1,
          });
        }
      });
    }

    const seenCodes = new Set<string>();
    let duplicateCount = 0;
    const validRecords: ImportRecord[] = [];

    records.forEach((rec, idx) => {
      let isRecordValid = true;
      if (!rec.code) {
        errors.push({
          rowIndex: idx + 1,
          code: 'MISSING_CODE',
          field: 'code',
          message: 'Question code is required',
        });
        isRecordValid = false;
      }
      if (!rec.questionText) {
        errors.push({
          rowIndex: idx + 1,
          code: 'MISSING_TEXT',
          field: 'questionText',
          message: 'Question text is required',
        });
        isRecordValid = false;
      }
      if (seenCodes.has(rec.code)) {
        duplicateCount++;
        errors.push({
          rowIndex: idx + 1,
          code: 'DUPLICATE_CODE',
          field: 'code',
          message: `Duplicate code detected: ${rec.code}`,
        });
        isRecordValid = false;
      } else {
        seenCodes.add(rec.code);
      }

      if (isRecordValid) {
        validRecords.push(rec);
      }
    });

    return {
      totalRecords: records.length,
      validCount: validRecords.length,
      invalidCount: records.length - validRecords.length,
      duplicateCount,
      records: validRecords,
      errors,
    };
  }
}
