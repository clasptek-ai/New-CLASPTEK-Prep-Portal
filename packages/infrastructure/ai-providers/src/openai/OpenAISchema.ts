import { z } from 'zod';

/**
 * IELTS Writing Evaluation Schema — OpenAI structured output validation.
 *
 * Task 1 criterion: "Task Achievement"
 * Task 2 criterion: "Task Response"
 * Both use the same schema structure; the criterion name differs in the prompt.
 */
export const IELTSWritingEvaluationSchema = z.object({
  overallBand: z
    .number()
    .min(0)
    .max(9)
    .refine((v) => v % 0.5 === 0, {
      message: 'IELTS band must be in 0.5 increments (e.g. 6.0, 6.5, 7.0)',
    }),
  taskType: z.enum(['TASK_1', 'TASK_2']),
  criteria: z.object({
    taskAchievement: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    coherenceCohesion: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    lexicalResource: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    grammaticalRangeAccuracy: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
  }),
  feedback: z.string().min(50, 'Feedback must be at least 50 characters'),
  strengths: z.array(z.string().min(1)).min(1, 'At least one strength required'),
  weaknesses: z.array(z.string().min(1)).min(1, 'At least one weakness required'),
  improvements: z.array(z.string().min(1)).min(1, 'At least one improvement required'),
});

export type IELTSWritingEvaluationOutput = z.infer<typeof IELTSWritingEvaluationSchema>;

/**
 * IELTS Speaking Evaluation Schema — OpenAI structured output validation.
 *
 * All four IELTS Speaking criteria:
 * - Fluency & Coherence
 * - Lexical Resource
 * - Grammatical Range & Accuracy
 * - Pronunciation
 */
export const IELTSSpeakingEvaluationSchema = z.object({
  overallBand: z
    .number()
    .min(0)
    .max(9)
    .refine((v) => v % 0.5 === 0, { message: 'IELTS band must be in 0.5 increments' }),
  criteria: z.object({
    fluencyCoherence: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    lexicalResource: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    grammaticalRangeAccuracy: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
    pronunciation: z
      .number()
      .min(0)
      .max(9)
      .refine((v) => v % 0.5 === 0, { message: 'Criterion score must be in 0.5 increments' }),
  }),
  feedback: z.string().min(50, 'Feedback must be at least 50 characters'),
  strengths: z.array(z.string().min(1)).min(1, 'At least one strength required'),
  weaknesses: z.array(z.string().min(1)).min(1, 'At least one weakness required'),
  improvements: z.array(z.string().min(1)).min(1, 'At least one improvement required'),
});

export type IELTSSpeakingEvaluationOutput = z.infer<typeof IELTSSpeakingEvaluationSchema>;
