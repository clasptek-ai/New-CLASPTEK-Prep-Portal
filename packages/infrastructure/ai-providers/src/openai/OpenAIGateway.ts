import { OpenAIClient } from './OpenAIClient';

export interface OpenAIChatResponse {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason: string;
}

export interface OpenAITranscriptionResponse {
  text: string;
}

export class OpenAIGateway {
  constructor(private readonly client: OpenAIClient) {}

  /**
   * Send a chat completion request to OpenAI with JSON mode enabled.
   * Used for IELTS Writing and Speaking evaluation.
   */
  public async generateChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<OpenAIChatResponse> {
    if (!systemPrompt || !userPrompt) {
      throw new Error('System prompt and user prompt are required for OpenAI chat completion');
    }

    const sdk = this.client.getRawClient();
    const model = this.client.getModelCode();

    const completion = await sdk.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 2048,
    });

    const choice = completion.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error(
        `OpenAI returned empty response. Model: ${model}, finish_reason: ${choice?.finish_reason || 'unknown'}`
      );
    }

    return {
      content: choice.message.content,
      model: completion.model || model,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
      finishReason: choice.finish_reason || 'unknown',
    };
  }

  /**
   * Transcribe an audio file using OpenAI Whisper.
   * Used for IELTS Speaking evaluation when only audio (no transcript) is provided.
   */
  public async transcribeAudio(
    audioBuffer: Buffer,
    filename: string,
    options?: { language?: string }
  ): Promise<OpenAITranscriptionResponse> {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty or undefined for transcription');
    }

    const sdk = this.client.getRawClient();
    const whisperModel = this.client.getWhisperModel();

    // Convert Buffer to Uint8Array/File object for the OpenAI SDK
    const uint8Array = new Uint8Array(audioBuffer);
    const audioFile = new File([uint8Array], filename, {
      type: OpenAIGateway.getMimeType(filename),
    });

    const transcription = await sdk.audio.transcriptions.create({
      file: audioFile,
      model: whisperModel,
      language: options?.language || 'en',
      response_format: 'text',
    });

    const text =
      typeof transcription === 'string' ? transcription : (transcription as any).text || '';

    if (!text || text.trim().length === 0) {
      throw new Error('Whisper transcription returned empty text');
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
