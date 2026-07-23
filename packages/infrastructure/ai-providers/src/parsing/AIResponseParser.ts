export class AIResponseParser {
  public static parseJsonBlock(text: string): Record<string, any> {
    if (!text || text.trim() === '') {
      throw new Error('AI response is empty or undefined');
    }

    let jsonText = text.trim();

    const markdownBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const markdownMatch = text.match(markdownBlockRegex);

    if (markdownMatch && markdownMatch[1]) {
      jsonText = markdownMatch[1].trim();
    } else {
      const firstCurly = text.indexOf('{');
      const lastCurly = text.lastIndexOf('}');

      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        jsonText = text.substring(firstCurly, lastCurly + 1).trim();
      }
    }

    try {
      return JSON.parse(jsonText);
    } catch (error: any) {
      throw new Error(
        `AI response JSON parsing failed: ${error.message}. Input segment: ${jsonText.substring(0, 100)}`
      );
    }
  }
}
