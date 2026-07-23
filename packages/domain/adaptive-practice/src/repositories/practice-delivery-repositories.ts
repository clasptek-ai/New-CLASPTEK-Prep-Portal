import { PracticeResult } from '../aggregates/practice-result.aggregate';
import { PracticeBookmark } from '../aggregates/practice-bookmark.aggregate';
import { WrongAnswerQueue } from '../aggregates/wrong-answer-queue.aggregate';
import { PracticeReviewQueue } from '../aggregates/practice-review-queue.aggregate';
import { PracticeAttempt } from '../entities/practice-attempt.entity';

export interface PracticeResultRepository {
  save(result: PracticeResult): Promise<void>;
  findBySessionId(sessionId: string): Promise<PracticeResult | null>;
  findByStudentId(studentId: string): Promise<PracticeResult[]>;
}

export interface PracticeBookmarkRepository {
  save(bookmark: PracticeBookmark): Promise<void>;
  delete(studentId: string, questionId: string): Promise<void>;
  findByStudentId(studentId: string): Promise<PracticeBookmark[]>;
}

export interface PracticeAttemptRepository {
  save(attempt: PracticeAttempt): Promise<void>;
  findLatest(sessionId: string): Promise<PracticeAttempt | null>;
  findByStudentId(studentId: string): Promise<PracticeAttempt[]>;
}

export interface WrongAnswerQueueRepository {
  save(queue: WrongAnswerQueue): Promise<void>;
  findByStudentId(studentId: string): Promise<WrongAnswerQueue | null>;
}

export interface PracticeReviewQueueRepository {
  save(queue: PracticeReviewQueue): Promise<void>;
  findBySessionId(sessionId: string): Promise<PracticeReviewQueue | null>;
}

export interface PracticeStatisticsRecord {
  studentId: string;
  currentStreak: number;
  completionPercentage: number;
  masteryPercentage: number;
  averageScore: number;
  weakSkillIds: string[];
}

export interface PracticeStatisticsRepository {
  save(stats: PracticeStatisticsRecord): Promise<void>;
  findByStudentId(studentId: string): Promise<PracticeStatisticsRecord | null>;
}
