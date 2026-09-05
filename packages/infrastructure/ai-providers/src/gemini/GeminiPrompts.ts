/**
 * Production IELTS Grading Prompts for Google Gemini.
 *
 * Implements official IELTS examiner system and user prompts for CLASPTEK Prep Portal.
 */

export interface WritingEvaluationInput {
  taskType: 'TASK_1' | 'TASK_2';
  taskPrompt: string;
  response: string;
  stimulusContext?: string;
}

export interface SpeakingEvaluationInput {
  part: number;
  prompt: string;
  transcript: string;
}

const IELTS_SYSTEM_PROMPT = `You are a professional IELTS examiner and AI evaluation engine for CLASPTEK Prep Portal.

Your responsibility is to evaluate IELTS candidates objectively and consistently according to the IELTS assessment criteria.

CRITICAL EVALUATION RULES:

1. Evaluate only the evidence contained in the supplied task, candidate response, transcript, and/or audio.
2. Never fabricate candidate content, errors, strengths, weaknesses, or evidence.
3. Never infer abilities that are not demonstrated by the candidate.
4. Do not reward vocabulary simply because it appears advanced or unusual.
5. Do not penalize opinions or ideas because they differ from your own.
6. Apply IELTS band descriptors consistently and conservatively.
7. Every criterion score MUST be between 0.0 and 9.0.
8. Every criterion score MUST use 0.5 increments only.
9. Do not output scores such as 6.2, 7.3, or 8.8.
10. The overall band MUST be calculated from the criterion scores.
11. Do not independently guess the overall band.
12. The application server is responsible for final deterministic overall-band calculation.
13. Return ONLY the requested JSON object.
14. Do not return Markdown, code fences, commentary, or additional properties.
15. If evidence is insufficient to evaluate a criterion reliably, evaluate only the available evidence and do not invent missing evidence.
16. Never generate a successful evaluation merely because the candidate submitted an answer.

IELTS BAND SCALE:

0.0 = Did not attempt / no meaningful response
0.5–8.5 = Intermediate performance levels according to IELTS descriptors
9.0 = Expert performance

Use the official IELTS assessment concepts rather than superficial keyword matching.
`;

export class GeminiPrompts {
  /**
   * Object-style prompt generator for Writing evaluation (consumed by GeminiGateway / GeminiProvider).
   */
  public static writing(input: WritingEvaluationInput) {
    const taskWordCount = input.taskType === 'TASK_1' ? '150-word' : '250-word';
    const stimulusSection = input.stimulusContext
      ? `\nVISUAL STIMULUS CONTEXT / DESCRIPTION:\n${input.stimulusContext}\n`
      : '';

    return {
      systemInstruction: IELTS_SYSTEM_PROMPT,
      userPrompt: `Evaluate the following IELTS Writing response.

TASK TYPE:
${input.taskType}

TASK QUESTION:
${input.taskPrompt}
${stimulusSection}
CANDIDATE RESPONSE:
${input.response}

Evaluate the candidate using the following four IELTS Writing criteria (must fulfill minimum ${taskWordCount} requirement):

1. TASK ACHIEVEMENT / TASK RESPONSE

For Task 1:
- Addressing the task requirements
- Providing a clear overview
- Selecting and reporting key features
- Making relevant comparisons
- Accuracy of reported information
- Appropriate development

For Task 2:
- Addressing every part of the question
- Presenting a clear position
- Developing ideas logically
- Providing relevant explanations and examples
- Maintaining relevance throughout

2. COHERENCE AND COHESION

Evaluate:
- Logical organization
- Paragraphing
- Progression of ideas
- Cohesive devices
- Referencing and substitution
- Natural rather than mechanical cohesion

3. LEXICAL RESOURCE

Evaluate:
- Range of vocabulary
- Precision
- Word choice
- Collocation
- Paraphrasing
- Spelling
- Word formation
- Natural and appropriate vocabulary use

Do not award a high score simply for using uncommon vocabulary.

4. GRAMMATICAL RANGE AND ACCURACY

Evaluate:
- Variety of structures
- Complex sentence control
- Accuracy
- Sentence formation
- Agreement
- Tenses
- Articles
- Prepositions
- Punctuation
- Frequency and impact of errors

Do not award a high score merely because complex structures are attempted.

FEEDBACK:

Provide useful examiner-style feedback based specifically on the candidate's response.

The feedback must:
- Explain the principal reasons for the scores.
- Identify specific strengths.
- Identify specific weaknesses.
- Provide actionable improvements.
- Refer to evidence actually present in the response.
- Never fabricate quotations or examples.

Return exactly:

{
  "overallBand": number,
  "taskType": "${input.taskType}",
  "criteria": {
    "taskAchievement": number,
    "coherenceCohesion": number,
    "lexicalResource": number,
    "grammaticalRangeAccuracy": number
  },
  "feedback": string,
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[]
}

All criterion scores must be 0.0–9.0 in 0.5 increments.

Do not add any other fields.`,
    };
  }

  /**
   * Object-style prompt generator for Speaking evaluation (consumed by GeminiGateway / GeminiProvider).
   */
  public static speaking(input: SpeakingEvaluationInput) {
    return {
      systemInstruction: IELTS_SYSTEM_PROMPT,
      userPrompt: `Evaluate the following IELTS Speaking performance.

PART:
${String(input.part).startsWith('Part') ? input.part : `Part ${input.part}`}

QUESTION / PROMPT:
${input.prompt}

CANDIDATE TRANSCRIPT:
${input.transcript}

Evaluate the candidate using these four IELTS Speaking criteria:

1. FLUENCY AND COHERENCE

Evaluate:
- Speed and flow of speech
- Hesitation
- Pausing
- Repetition
- Self-correction
- Ability to extend answers
- Logical connection of ideas
- Ability to maintain discourse

Do not confuse natural thinking pauses with serious fluency problems.

2. LEXICAL RESOURCE

Evaluate:
- Range of vocabulary
- Precision
- Flexibility
- Paraphrasing
- Collocation
- Appropriacy
- Repetition
- Ability to express meaning effectively

Do not award a high score merely because advanced words appear.

3. GRAMMATICAL RANGE AND ACCURACY

Evaluate:
- Range of grammatical structures
- Complex structures
- Accuracy
- Tenses
- Agreement
- Articles
- Prepositions
- Sentence construction
- Frequency and impact of errors

4. PRONUNCIATION

Evaluate:
- Individual sounds
- Word stress
- Sentence stress
- Rhythm
- Intonation
- Connected speech
- Clarity
- Ease of understanding

Important:
Do not infer pronunciation problems from grammar or vocabulary errors.
If audio is supplied, use the audio as the primary pronunciation evidence.
If only a transcript is supplied, assess pronunciation conservatively and do not fabricate pronunciation errors.

FEEDBACK:

Provide examiner-style feedback based only on the candidate evidence.

Identify:
- Strong aspects of performance
- Main weaknesses
- Specific areas for improvement
- Practical improvements that could increase the candidate's IELTS performance

Never fabricate words, pronunciation errors, or examples that are not supported by the supplied evidence.

Return exactly:

{
  "overallBand": number,
  "criteria": {
    "fluencyCoherence": number,
    "lexicalResource": number,
    "grammaticalRangeAccuracy": number,
    "pronunciation": number
  },
  "feedback": string,
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[]
}

All criterion scores must be 0.0–9.0 in 0.5 increments.

Do not add any other fields.`,
    };
  }

  // --- Backward-Compatible Static Helper Methods ---

  public static buildWritingSystemPrompt(taskType: 'TASK_1' | 'TASK_2'): string {
    const taskName = taskType === 'TASK_1' ? 'Task Achievement' : 'Task Response';
    const wordCount = taskType === 'TASK_1' ? '150-word' : '250-word';
    return `${IELTS_SYSTEM_PROMPT}\nCriteria to assess: ${taskName}, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy (minimum ${wordCount} requirement).`;
  }

  public static buildWritingUserPrompt(
    taskPrompt: string,
    candidateResponse: string,
    taskType: 'TASK_1' | 'TASK_2',
    stimulusContext?: string
  ): string {
    return GeminiPrompts.writing({
      taskType,
      taskPrompt,
      response: candidateResponse,
      ...(stimulusContext ? { stimulusContext } : {}),
    }).userPrompt;
  }

  public static buildSpeakingSystemPrompt(): string {
    return `${IELTS_SYSTEM_PROMPT}\nCriteria to assess: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation.`;
  }

  public static buildSpeakingUserPrompt(
    partNumber: number,
    questionPrompt: string,
    transcript: string
  ): string {
    return GeminiPrompts.speaking({
      part: partNumber,
      prompt: questionPrompt,
      transcript,
    }).userPrompt;
  }
}
