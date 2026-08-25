import OpenAI from 'openai';
import { OpenAIConfiguration } from '../configuration/OpenAIConfiguration';

export class OpenAIClient {
  private client: OpenAI;

  constructor(private readonly config: OpenAIConfiguration) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeoutMs,
    });
  }

  public getRawClient(): OpenAI {
    return this.client;
  }

  public getModelCode(): string {
    return this.config.model;
  }

  public getWhisperModel(): string {
    return this.config.whisperModel;
  }

  public getTimeoutMs(): number {
    return this.config.timeoutMs;
  }
}
