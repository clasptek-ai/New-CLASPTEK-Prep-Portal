import { GoogleGenAI, AIClientFactory } from '../configuration/AIClientFactory';
import { GeminiConfiguration } from '../configuration/GeminiConfiguration';

export class GeminiClient {
  private client: GoogleGenAI;

  constructor(private readonly config: GeminiConfiguration) {
    const factory = new AIClientFactory();
    this.client = factory.createGeminiClient(config);
  }

  public getRawClient(): GoogleGenAI {
    return this.client;
  }

  public getModelCode(): string {
    return this.config.model;
  }
}
