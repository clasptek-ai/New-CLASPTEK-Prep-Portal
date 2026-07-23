import { z } from 'zod';

export const EvaluationResponseSchema = z.object({
  overallBand: z
    .number({
      required_error: 'overallBand is required',
      invalid_type_error: 'overallBand must be a number',
    })
    .min(0, 'overallBand must be at least 0')
    .max(9, 'overallBand cannot exceed 9'),
  criteria: z.object({
    taskAchievement: z.number().min(0).max(9),
    coherence: z.number().min(0).max(9),
    lexicalResource: z.number().min(0).max(9),
    grammar: z.number().min(0).max(9),
  }),
  feedback: z
    .string({
      required_error: 'feedback is required',
    })
    .min(1, 'feedback cannot be empty'),
  improvements: z.array(z.string()),
});

export type EvaluationResponseOutput = z.infer<typeof EvaluationResponseSchema>;

export class EvaluationSchema {
  public static validate(rawObj: unknown): EvaluationResponseOutput {
    return EvaluationResponseSchema.parse(rawObj);
  }

  public static validateGemini(rawObj: unknown): EvaluationResponseOutput {
    return this.validate(rawObj);
  }
}
