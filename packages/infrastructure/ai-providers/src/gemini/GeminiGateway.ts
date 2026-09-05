import { GeminiClient } from './GeminiClient';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export interface GeminiChatResponse {
  content: string;
  model: string;
  totalTokens: number;
  finishReason: string;
}

export interface GeminiTranscriptionResponse {
  text: string;
}

export class GeminiGateway {
  constructor(private readonly client: GeminiClient) {}

  public async generate(prompt: string): Promise<GeminiResponse> {
    if (!prompt) {
      throw new Error('Prompt template is empty or undefined');
    }

    const sdkClient = this.client.getRawClient();
    const model = this.client.getModelCode();

    const rawResponse = await sdkClient.models.generateContent({
      model: model,
      contents: prompt,
    });

    return rawResponse;
  }

  public async generateContent(prompt: string): Promise<GeminiResponse> {
    return this.generate(prompt);
  }

  /**
   * Send a chat completion request to Gemini with system + user prompt separation.
   * Used for IELTS Writing and Speaking evaluation — mirrors OpenAI gateway interface.
   *
   * Gemini API uses the system instruction in the config and user prompt in contents.
   */
  public async generateChatCompletion(
    systemPromptOrInput: string | { systemInstruction: string; userPrompt: string },
    userPromptOrOptions?: string | { temperature?: number; maxTokens?: number; timeout?: number },
    options?: { temperature?: number; maxTokens?: number; timeout?: number }
  ): Promise<GeminiChatResponse> {
    let systemPrompt: string;
    let userPrompt: string;
    let opts: { temperature?: number; maxTokens?: number; timeout?: number } | undefined;

    if (typeof systemPromptOrInput === 'object' && systemPromptOrInput !== null) {
      systemPrompt = systemPromptOrInput.systemInstruction;
      userPrompt = systemPromptOrInput.userPrompt;
      opts = typeof userPromptOrOptions === 'object' ? userPromptOrOptions : options;
    } else {
      systemPrompt = systemPromptOrInput;
      userPrompt = typeof userPromptOrOptions === 'string' ? userPromptOrOptions : '';
      opts = options;
    }

    if (!systemPrompt || !userPrompt) {
      throw new Error('System prompt and user prompt are required for Gemini chat completion');
    }

    const sdkClient = this.client.getRawClient();
    const model = this.client.getModelCode();
    const timeoutMs = opts?.timeout ?? options?.timeout ?? this.client.getTimeoutMs();

    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const rawResponse = await Promise.race([
        sdkClient.models.generateContent({
          model: model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: opts?.temperature ?? options?.temperature ?? 0.2,
            maxOutputTokens: opts?.maxTokens ?? options?.maxTokens ?? 8192,
            responseMimeType: 'application/json',
          },
        }),
        timeoutPromise,
      ]);

      const candidate = rawResponse.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const textContent =
        typeof rawResponse.text === 'string' && rawResponse.text.length > 0
          ? rawResponse.text
          : parts.map((p: any) => p.text || '').join('');

      if (!textContent) {
        throw new Error(
          `Gemini returned empty response. Model: ${model}, finish_reason: ${candidate?.finishReason || 'unknown'}`
        );
      }

      return {
        content: textContent,
        model: model,
        totalTokens: rawResponse.usageMetadata?.totalTokenCount ?? 0,
        finishReason: candidate?.finishReason || 'unknown',
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Transcribe an audio file using Gemini's native audio understanding.
   * Gemini accepts audio as inline data for multimodal prompts.
   *
   * This replaces the need for OpenAI Whisper for speaking evaluation.
   */
  public async transcribeAudio(
    audioBuffer: Buffer,
    filename: string,
    _options?: { language?: string }
  ): Promise<GeminiTranscriptionResponse> {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty or undefined for transcription');
    }

    const sdkClient = this.client.getRawClient();
    const model = this.client.getModelCode();
    const mimeType = GeminiGateway.getMimeType(filename);

    // Convert buffer to base64 for Gemini inline_data
    const base64Audio = Buffer.isBuffer(audioBuffer)
      ? audioBuffer.toString('base64')
      : Buffer.from(audioBuffer).toString('base64');

    const rawResponse = await sdkClient.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe this audio recording accurately. The speaker is an IELTS candidate answering an exam question in English. Return ONLY the transcription text, no commentary or labels.',
            },
          ],
        },
      ],
    });

    const text = rawResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini audio transcription returned empty text');
    }

    return { text: text.trim() };
  }

  public getModelCode(): string {
    return this.client.getModelCode();
  }

  private static getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      webm: 'audio/webm',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/m4a',
      ogg: 'audio/ogg',
      mp4: 'audio/mp4',
      mpeg: 'audio/mpeg',
      mpga: 'audio/mpeg',
    };
    return mimeMap[ext] || 'audio/webm';
  }
}
