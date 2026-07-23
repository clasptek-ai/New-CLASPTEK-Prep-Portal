import { GeminiClient } from './GeminiClient';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
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

  public getModelCode(): string {
    return this.client.getModelCode();
  }
}
