import { z } from 'zod';

export const GeminiEvaluationSchema = z.object({
  overallBand: z.number().min(0).max(9),
  criteria: z.object({
    taskAchievement: z.number().min(0).max(9),
    coherence: z.number().min(0).max(9),
    lexicalResource: z.number().min(0).max(9),
    grammar: z.number().min(0).max(9),
  }),
  feedback: z.string().min(1),
  improvements: z.array(z.string()),
});

export type GeminiEvaluationOutput = z.infer<typeof GeminiEvaluationSchema>;
