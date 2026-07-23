import { AssessmentProfile } from '@clasptek/domain-ai-evaluation';
import { EvaluationRubric } from '@clasptek/domain-ai-evaluation';
import { AIEvaluationStandard } from '@clasptek/domain-ai-evaluation';
import { PromptTemplate } from '@clasptek/domain-ai-evaluation';
import { PromptVersionAggregate } from '@clasptek/domain-ai-evaluation';

// ═══════════════════════════════════════════════════════════════════
// PROMPT BUILDER SERVICE V2 — Assessment-profile-driven prompt builder
// ═══════════════════════════════════════════════════════════════════

export interface CompiledPromptContext {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  outputFormat: string;
  responseSchema?: Record<string, any>;
}

export class PromptBuilderService {
  /**
   * Keep backward compatibility with existing tests.
   */
  public buildPrompt(
    systemPromptTemplate: string,
    userPromptTemplate: string,
    variables: Record<string, string>
  ): { systemPrompt: string; userPrompt: string } {
    let systemPrompt = systemPromptTemplate;
    let userPrompt = userPromptTemplate;

    Object.entries(variables).forEach(([key, val]) => {
      systemPrompt = systemPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });

    return { systemPrompt, userPrompt };
  }

  /**
   * PromptBuilder v2 pipeline compile method.
   * Compiles the system and user prompts using profile, rubric, standard, and template information.
   */
  public buildPromptFromProfile(
    profile: AssessmentProfile,
    rubric: EvaluationRubric,
    standard: AIEvaluationStandard,
    template: PromptTemplate,
    version: PromptVersionAggregate | undefined,
    variables: Record<string, string>
  ): CompiledPromptContext {
    // 1. Validate variables against required placeholders
    const missingPlaceholders = template.validateVariables(variables);
    if (missingPlaceholders.length > 0) {
      throw new Error(
        `Missing required variables for prompt compilation: ${missingPlaceholders.join(', ')}`
      );
    }

    // 2. Generate Rubric Instructions
    const rubricInstructions = rubric.generateEvaluationInstructions();

    // 3. Compile Standard Rules
    const standardInstructions = standard.compileRules();

    // 4. Combine system prompt template with rubric instructions and standard rules
    // By default, we append rubric instructions and standard rules to the system prompt
    let systemPrompt = [
      template.systemPrompt,
      '# EVALUATION SYSTEM RULES & REQUIREMENTS',
      standardInstructions,
      '# EVALUATION SCORING CRITERIA',
      rubricInstructions,
    ].join('\n\n');

    // 5. User prompt template
    let userPrompt = template.userPromptTemplate;

    // 6. Inject variables into system and user prompts
    Object.entries(variables).forEach(([key, val]) => {
      systemPrompt = systemPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });

    // 7. Resolve LLM configuration parameters from version (or fall back to profile default)
    const temperature = version?.temperature ?? profile.temperature;
    const topP = version?.topP ?? profile.topP;
    const maxTokens = version?.maxTokens ?? profile.maxTokens;
    const outputFormat = template.outputFormat;
    const responseSchema = standard.outputSchema;

    return {
      systemPrompt,
      userPrompt,
      temperature,
      topP,
      maxTokens,
      outputFormat,
      responseSchema,
    };
  }
}
