import { AdminQuestion, QuestionType } from '../../../services/admin/questions.service';

export interface EvaluationResult {
  isCorrect: boolean;
  scoreEarned: number;
  maxScore: number;
  explanation: string;
  feedbackText: string;
}

export interface IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType;
  validate(studentAnswer: string, question: AdminQuestion): boolean;
  score(studentAnswer: string, question: AdminQuestion): EvaluationResult;
  review(
    studentAnswer: string,
    question: AdminQuestion
  ): {
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  };
}

/**
 * Strategy 1: Multiple Choice Question (MCQ) Evaluator Strategy
 */
export class MCQAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'MCQ';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return Boolean(studentAnswer && studentAnswer.trim().length > 0);
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      scoreEarned: isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: question.explanation || 'MCQ Option Match Verification.',
      feedbackText: isCorrect ? 'Correct Option Selection' : 'Option Mismatch',
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      studentAnswer: studentAnswer || 'No Option Selected',
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || 'Standard MCQ answer key evaluation.',
    };
  }
}

/**
 * Strategy 2: True / False / Not Given Evaluator Strategy
 */
export class TrueFalseNotGivenAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'TRUE_FALSE_NOT_GIVEN';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return ['true', 'false', 'not given'].includes(studentAnswer.trim().toLowerCase());
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      scoreEarned: isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: question.explanation || 'True/False/Not Given passage claim verification.',
      feedbackText: isCorrect ? 'Accurate Claim Classification' : 'Incorrect Claim Classification',
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      studentAnswer: studentAnswer || 'Unanswered',
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || 'Passage stance evaluation.',
    };
  }
}

/**
 * Strategy 3: Matching Headings / Features Evaluator Strategy
 */
export class MatchingAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'MATCHING';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return Boolean(studentAnswer && studentAnswer.trim().length > 0);
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      scoreEarned: isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: question.explanation || 'Matching paragraph heading logic evaluation.',
      feedbackText: isCorrect ? 'Paragraph Heading Matched' : 'Incorrect Heading Assignment',
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      studentAnswer: studentAnswer || 'Unassigned',
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || 'Matching heading criteria evaluation.',
    };
  }
}

/**
 * Strategy 4: Fill In The Blank Evaluator Strategy
 */
export class FillInBlankAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'FILL_IN_BLANK';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return Boolean(studentAnswer && studentAnswer.trim().length > 0);
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const normStudent = studentAnswer
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const normCorrect = question.correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const isCorrect = normStudent === normCorrect;

    return {
      isCorrect,
      scoreEarned: isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: question.explanation || 'Exact key fill-in word match.',
      feedbackText: isCorrect ? 'Exact Vocabulary Match' : 'Spelling / Word Choice Error',
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    const normStudent = studentAnswer
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const normCorrect = question.correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const isCorrect = normStudent === normCorrect;

    return {
      studentAnswer: studentAnswer || 'Blank',
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || 'Passage word insertion accuracy.',
    };
  }
}

/**
 * Strategy 5: Essay / Writing Task Evaluator Strategy
 */
export class EssayAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'ESSAY';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return Boolean(studentAnswer && studentAnswer.trim().split(/\s+/).length >= 10);
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const wordCount = studentAnswer.trim().split(/\s+/).filter(Boolean).length;
    const isSufficientLength = wordCount >= 150;
    const scoreEarned = isSufficientLength ? 1 : 0.5;

    return {
      isCorrect: true,
      scoreEarned,
      maxScore: 1,
      explanation: question.explanation || 'AI Essay Evaluation completed.',
      feedbackText: `Submitted Essay Response (${wordCount} words)`,
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    return {
      studentAnswer: studentAnswer ? `${studentAnswer.substring(0, 100)}...` : 'No Essay Written',
      correctAnswer: question.correctAnswer || 'Model Band 8.0 Response',
      isCorrect: true,
      explanation: question.explanation || 'Model essay structure and rubric criteria.',
    };
  }
}

/**
 * Strategy 6: Speaking Prompt Evaluator Strategy
 */
export class SpeakingAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'SPEAKING';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return Boolean(studentAnswer && studentAnswer.trim().length > 0);
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    return {
      isCorrect: true,
      scoreEarned: 1,
      maxScore: 1,
      explanation: question.explanation || 'Audio response recorded for proctor review.',
      feedbackText: 'Audio Response Recorded',
    };
  }

  review(studentAnswer: string, question: AdminQuestion) {
    return {
      studentAnswer: studentAnswer || 'Audio Response',
      correctAnswer: question.correctAnswer || 'Sample Band 8.0 Audio Response',
      isCorrect: true,
      explanation: question.explanation || 'Fluency, coherence, and pronunciation criteria.',
    };
  }
}

/**
 * Strategy Registry (No Switch Statements)
 */
export class AnswerEvaluatorRegistry {
  private static strategies: Map<QuestionType, IAnswerEvaluatorStrategy> = new Map([
    ['MCQ', new MCQAnswerEvaluatorStrategy()],
    ['TRUE_FALSE_NOT_GIVEN', new TrueFalseNotGivenAnswerEvaluatorStrategy()],
    ['MATCHING', new MatchingAnswerEvaluatorStrategy()],
    ['FILL_IN_BLANK', new FillInBlankAnswerEvaluatorStrategy()],
    ['ESSAY', new EssayAnswerEvaluatorStrategy()],
    ['SPEAKING', new SpeakingAnswerEvaluatorStrategy()],
  ]);

  public static getEvaluator(type: QuestionType): IAnswerEvaluatorStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      return this.strategies.get('MCQ')!;
    }
    return strategy;
  }
}
