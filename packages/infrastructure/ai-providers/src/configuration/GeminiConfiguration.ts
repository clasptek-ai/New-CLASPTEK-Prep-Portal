import { z } from 'zod';

export interface GeminiConfiguration {
  apiKey: string;
  model: string;
  timeoutMs: number;
  baseUrl?: string | undefined;
  useMock?: boolean | undefined;
}

export interface OpenAIConfiguration {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export const GeminiConfigSchema = z.object({
  apiKey: z
    .string({
      required_error: 'GEMINI_API_KEY environment variable is required',
    })
    .min(1, 'GEMINI_API_KEY cannot be empty'),
  model: z
    .string({
      required_error: 'GEMINI_MODEL environment variable is required',
    })
    .min(1, 'GEMINI_MODEL cannot be empty'),
  timeoutMs: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z
      .number({
        required_error: 'GEMINI_TIMEOUT environment variable is required',
        invalid_type_error: 'GEMINI_TIMEOUT must be a valid number',
      })
      .positive('GEMINI_TIMEOUT must be a positive number')
  ),
  baseUrl: z.string().optional(),
  useMock: z.preprocess(
    (val) =>
      val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined,
    z.boolean().optional()
  ),
});

export class GeminiConfigurationLoader {
  public static fromEnv(
    env: Record<string, string | undefined> = process.env
  ): GeminiConfiguration {
    const raw = {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      timeoutMs: env.GEMINI_TIMEOUT,
      baseUrl: env.GEMINI_BASE_URL,
      useMock: env.USE_MOCK_AI,
    };

    const parsed = GeminiConfigSchema.safeParse(raw);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      throw new Error(`Gemini configuration initialization failed: ${errorMsg}`);
    }

    return parsed.data;
  }
}
