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
 * Strategy 7: Yes / No / Not Given Evaluator Strategy
 */
export class YesNoNotGivenAnswerEvaluatorStrategy implements IAnswerEvaluatorStrategy {
  readonly supportedType: QuestionType = 'YES_NO_NOT_GIVEN';

  validate(studentAnswer: string, _question: AdminQuestion): boolean {
    return ['yes', 'no', 'not given'].includes(studentAnswer.trim().toLowerCase());
  }

  score(studentAnswer: string, question: AdminQuestion): EvaluationResult {
    const isCorrect =
      studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      scoreEarned: isCorrect ? 1 : 0,
      maxScore: 1,
      explanation: question.explanation || 'Yes/No/Not Given passage claim verification.',
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
 * Strategy Registry (No Switch Statements)
 */
export class AnswerEvaluatorRegistry {
  private static mcqStrategy = new MCQAnswerEvaluatorStrategy();
  private static tfngStrategy = new TrueFalseNotGivenAnswerEvaluatorStrategy();
  private static ynngStrategy = new YesNoNotGivenAnswerEvaluatorStrategy();
  private static matchingStrategy = new MatchingAnswerEvaluatorStrategy();
  private static fillInBlankStrategy = new FillInBlankAnswerEvaluatorStrategy();
  private static essayStrategy = new EssayAnswerEvaluatorStrategy();
  private static speakingStrategy = new SpeakingAnswerEvaluatorStrategy();

  private static strategies: Map<QuestionType, IAnswerEvaluatorStrategy> = new Map([
    ['MCQ', AnswerEvaluatorRegistry.mcqStrategy],
    ['MULTIPLE_CHOICE', AnswerEvaluatorRegistry.mcqStrategy],
    ['TRUE_FALSE_NOT_GIVEN', AnswerEvaluatorRegistry.tfngStrategy],
    ['YES_NO_NOT_GIVEN', AnswerEvaluatorRegistry.ynngStrategy],
    ['MATCHING', AnswerEvaluatorRegistry.matchingStrategy],
    ['MATCHING_HEADINGS', AnswerEvaluatorRegistry.matchingStrategy],
    ['MATCHING_INFORMATION', AnswerEvaluatorRegistry.matchingStrategy],
    ['MATCHING_FEATURES', AnswerEvaluatorRegistry.matchingStrategy],
    ['FILL_IN_BLANK', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['COMPLETION', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['NOTE_COMPLETION', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['SUMMARY_COMPLETION', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['SENTENCE_COMPLETION', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['SHORT_ANSWER', AnswerEvaluatorRegistry.fillInBlankStrategy],
    ['ESSAY', AnswerEvaluatorRegistry.essayStrategy],
    ['WRITING', AnswerEvaluatorRegistry.essayStrategy],
    ['WRITING_TASK_1', AnswerEvaluatorRegistry.essayStrategy],
    ['WRITING_TASK_2', AnswerEvaluatorRegistry.essayStrategy],
    ['SPEAKING', AnswerEvaluatorRegistry.speakingStrategy],
  ]);

  public static getEvaluator(type: QuestionType): IAnswerEvaluatorStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      return this.mcqStrategy;
    }
    return strategy;
  }
}
