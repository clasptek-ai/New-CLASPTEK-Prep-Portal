import { describe, it, expect } from 'vitest';

export class CanonicalJsonImporterValidator {
  private readonly supportedProducts = [
    'English Proficiency',
    'IELTS Academic',
    'IELTS General Training',
    'TOEFL iBT',
    'Digital SAT',
    'CELPIP General',
  ];

  public validateJsonPayload(payload: any) {
    const errors: any[] = [];
    const warnings: string[] = [];

    if (!payload || typeof payload !== 'object') {
      return {
        isValid: false,
        totalRecords: 0,
        validCount: 0,
        warningCount: 0,
        invalidCount: 1,
        duplicateCount: 0,
        errors: [{ rowNumber: 0, itemCode: 'ROOT', field: 'payload', error: 'Invalid JSON payload format.', recommendation: 'Provide a valid JSON object.' }],
        warnings: [],
      };
    }

    if (!payload.schemaVersion) {
      warnings.push('Missing schemaVersion property. Defaulting to 1.0.');
    }

    const examType = payload.examType || 'English Proficiency';
    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    const totalRecords = questions.length;

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    const seenCodes = new Set<string>();

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const rowNo = idx + 1;
      const qCode = q.questionCode || `Q-${rowNo}`;
      let itemHasError = false;

      if (seenCodes.has(qCode)) {
        duplicateCount++;
        itemHasError = true;
        errors.push({
          rowNumber: rowNo,
          itemCode: qCode,
          field: 'questionCode',
          error: `Duplicate questionCode "${qCode}" detected in import payload.`,
          recommendation: 'Ensure each questionCode is unique.',
        });
      } else {
        seenCodes.add(qCode);
      }

      const targetExam = q.examType || examType;
      const isProductSupported = this.supportedProducts.some((p) => p.toLowerCase() === targetExam.toLowerCase());
      if (!isProductSupported) {
        itemHasError = true;
        errors.push({
          rowNumber: rowNo,
          itemCode: qCode,
          field: 'examType',
          error: `Unsupported examType "${targetExam}".`,
          recommendation: `Must be one of: ${this.supportedProducts.join(', ')}.`,
        });
      }

      const section = (q.section || '').toUpperCase();
      if (targetExam.toUpperCase().includes('SAT') || targetExam.toUpperCase().includes('DIGITAL SAT')) {
        if (section === 'SPEAKING' || section === 'LISTENING') {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'section',
            error: `Digital SAT does not support section "${section}".`,
            recommendation: 'Remove Listening and Speaking sections for SAT imports.',
          });
        }
      }

      if (q.proficiencyLevel) {
        const level = q.proficiencyLevel.toUpperCase();
        if (!['FOUNDATION', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'proficiencyLevel',
            error: `Invalid proficiencyLevel "${q.proficiencyLevel}".`,
            recommendation: 'Expected FOUNDATION | INTERMEDIATE | ADVANCED.',
          });
        }
      }

      const itemType = (q.questionType || 'MCQ').toUpperCase();
      if (itemType === 'MCQ' || itemType === 'MULTIPLE_RESPONSE') {
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.length === 0) {
          itemHasError = true;
          errors.push({
            rowNumber: rowNo,
            itemCode: qCode,
            field: 'options',
            error: 'MCQ questions require non-empty options array.',
            recommendation: 'Provide option objects [{ code: "A", text: "..." }, ...].',
          });
        }

        if (q.correctAnswer) {
          const optionCodes = options.map((o: any) => (typeof o === 'string' ? 'A' : o.code));
          const matches = optionCodes.includes(q.correctAnswer);
          if (!matches && options.length > 0) {
            itemHasError = true;
            errors.push({
              rowNumber: rowNo,
              itemCode: qCode,
              field: 'correctAnswer',
              error: `correctAnswer "${q.correctAnswer}" does not match available options (${optionCodes.join(', ')}).`,
              recommendation: 'Ensure correctAnswer matches a valid option code.',
            });
          }
        }
      }

      if (itemHasError) {
        invalidCount++;
      } else {
        validCount++;
      }
    }

    return {
      isValid: errors.length === 0,
      totalRecords,
      validCount,
      warningCount: warnings.length,
      invalidCount,
      duplicateCount,
      errors,
      warnings,
    };
  }
}

describe('Universal Question Bank — JSON Import / Export Pipeline Suite', () => {
  const importerValidator = new CanonicalJsonImporterValidator();

  it('should validate valid English Proficiency Grammar JSON payload with Foundation level', () => {
    const payload = {
      schemaVersion: '1.0',
      examType: 'English Proficiency',
      questions: [
        {
          questionCode: 'ENG-GRAM-FND-001',
          examType: 'English Proficiency',
          section: 'GRAMMAR',
          proficiencyLevel: 'FOUNDATION',
          grammarTopic: 'PARTS_OF_SPEECH',
          grammarSubtopic: 'ARTICLES',
          questionType: 'MCQ',
          difficulty: 'EASY',
          prompt: 'Select the correct article: ___ apple a day keeps the doctor away.',
          options: [
            { code: 'A', text: 'An' },
            { code: 'B', text: 'A' },
            { code: 'C', text: 'The' },
            { code: 'D', text: 'No article' },
          ],
          correctAnswer: 'A',
          explanation: 'An is used before vowel sounds.',
          usages: ['DIAGNOSTIC', 'PRACTICE'],
        },
      ],
    };

    const res = importerValidator.validateJsonPayload(payload);
    expect(res.isValid).toBe(true);
    expect(res.totalRecords).toBe(1);
    expect(res.validCount).toBe(1);
    expect(res.errors.length).toBe(0);
  });

  it('should strictly REJECT Digital SAT Speaking or Listening section questions', () => {
    const payload = {
      schemaVersion: '1.0',
      examType: 'Digital SAT',
      questions: [
        {
          questionCode: 'SAT-INVALID-001',
          examType: 'Digital SAT',
          section: 'SPEAKING',
          questionType: 'SPEAKING_PROMPT',
          prompt: 'Describe your favorite book.',
        },
      ],
    };

    const res = importerValidator.validateJsonPayload(payload);
    expect(res.isValid).toBe(false);
    expect(res.invalidCount).toBe(1);
    expect(res.errors[0].error).toContain('Digital SAT does not support section "SPEAKING"');
  });

  it('should reject invalid proficiencyLevel values', () => {
    const payload = {
      schemaVersion: '1.0',
      examType: 'English Proficiency',
      questions: [
        {
          questionCode: 'ENG-INVALID-PROF',
          proficiencyLevel: 'INTERMIDIATE',
          options: [{ code: 'A', text: 'Opt' }],
          correctAnswer: 'A',
        },
      ],
    };

    const res = importerValidator.validateJsonPayload(payload);
    expect(res.isValid).toBe(false);
    expect(res.errors[0].error).toContain('Invalid proficiencyLevel');
  });

  it('should detect duplicate questionCode within the JSON import payload', () => {
    const payload = {
      schemaVersion: '1.0',
      examType: 'IELTS Academic',
      questions: [
        { questionCode: 'DUP-001', options: [{ code: 'A', text: 'X' }], correctAnswer: 'A' },
        { questionCode: 'DUP-001', options: [{ code: 'A', text: 'X' }], correctAnswer: 'A' },
      ],
    };

    const res = importerValidator.validateJsonPayload(payload);
    expect(res.duplicateCount).toBe(1);
    expect(res.errors.some((e: any) => e.error.includes('Duplicate questionCode'))).toBe(true);
  });

  it('should reject MCQ questions where correctAnswer does not match options', () => {
    const payload = {
      schemaVersion: '1.0',
      examType: 'TOEFL iBT',
      questions: [
        {
          questionCode: 'TOEFL-001',
          options: [
            { code: 'A', text: 'Opt A' },
            { code: 'B', text: 'Opt B' },
          ],
          correctAnswer: 'E',
        },
      ],
    };

    const res = importerValidator.validateJsonPayload(payload);
    expect(res.isValid).toBe(false);
    expect(res.errors[0].error).toContain('correctAnswer "E" does not match available options');
  });
});
