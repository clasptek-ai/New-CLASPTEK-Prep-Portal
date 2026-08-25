import { z } from 'zod';

export interface OpenAIConfiguration {
  apiKey: string;
  model: string;
  timeoutMs: number;
  whisperModel: string;
}

export const OpenAIConfigSchema = z.object({
  apiKey: z
    .string({
      required_error: 'OPENAI_API_KEY environment variable is required',
    })
    .min(1, 'OPENAI_API_KEY cannot be empty'),
  model: z.string().min(1, 'OPENAI_IELTS_GRADING_MODEL cannot be empty').default('gpt-4o'),
  timeoutMs: z.preprocess(
    (val) => (val ? Number(val) : 60000),
    z
      .number({
        invalid_type_error: 'OPENAI_TIMEOUT must be a valid number',
      })
      .positive('OPENAI_TIMEOUT must be a positive number')
      .default(60000)
  ),
  whisperModel: z.string().default('whisper-1'),
});

export class OpenAIConfigurationLoader {
  public static fromEnv(
    env: Record<string, string | undefined> = process.env
  ): OpenAIConfiguration | null {
    const apiKey = env.OPENAI_API_KEY;

    // If no API key is configured, return null (OpenAI is not available)
    if (!apiKey || apiKey.trim().length === 0) {
      return null;
    }

    const raw = {
      apiKey,
      model: env.OPENAI_IELTS_GRADING_MODEL || 'gpt-4o',
      timeoutMs: env.OPENAI_TIMEOUT || '60000',
      whisperModel: env.OPENAI_WHISPER_MODEL || 'whisper-1',
    };

    const parsed = OpenAIConfigSchema.safeParse(raw);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      throw new Error(`OpenAI configuration initialization failed: ${errorMsg}`);
    }

    return parsed.data;
  }
}
