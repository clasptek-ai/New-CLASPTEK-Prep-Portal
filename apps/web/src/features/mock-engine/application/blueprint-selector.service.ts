import { MockBlueprint, MockBlueprintSection } from '../domain/mock-blueprint';
import { adminQuestionsService, AdminQuestion, QuestionType, SectionType } from '../../../services/admin/questions.service';

export interface BlueprintValidationResult {
  isValid: boolean;
  errors: string[];
  itemDeficits: Array<{
    sectionName: string;
    questionType: string;
    required: number;
    available: number;
  }>;
}

export class BlueprintValidationError extends Error {
  constructor(public result: BlueprintValidationResult) {
    super(`Blueprint Validation Failed: ${result.errors.join(' | ')}`);
    this.name = 'BlueprintValidationError';
  }
}

export class BlueprintSelectorService {
  /**
   * Validates whether the Question Bank contains sufficient published items to satisfy the blueprint.
   */
  public async validateBlueprint(blueprint: MockBlueprint): Promise<BlueprintValidationResult> {
    const published = await adminQuestionsService.getPublishedQuestionsForCandidates(
      blueprint.exam,
      'MOCK'
    );

    const errors: string[] = [];
    const itemDeficits: BlueprintValidationResult['itemDeficits'] = [];

    for (const section of blueprint.sections) {
      const sectionQuestions = published.filter(
        (q) => q.section === section.name || q.programmeName === blueprint.exam
      );

      // Check group-level type distribution if specified
      if (section.questionGroups && section.questionGroups.length > 0) {
        for (const groupReq of section.questionGroups) {
          const matching = sectionQuestions.filter((q) => q.type === groupReq.questionType);
          if (matching.length < groupReq.questionCount) {
            errors.push(
              `Section "${section.name}" requires ${groupReq.questionCount}x ${groupReq.questionType} questions, but only ${matching.length} are published.`
            );
            itemDeficits.push({
              sectionName: section.name,
              questionType: groupReq.questionType,
              required: groupReq.questionCount,
              available: matching.length,
            });
          }
        }
      } else {
        // Flat section requirement check
        if (sectionQuestions.length < section.questionCount) {
          errors.push(
            `Section "${section.name}" requires ${section.questionCount} total questions, but only ${sectionQuestions.length} are published.`
          );
          itemDeficits.push({
            sectionName: section.name,
            questionType: 'ANY',
            required: section.questionCount,
            available: sectionQuestions.length,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      itemDeficits,
    };
  }

  /**
   * Selects candidate questions satisfying all blueprint constraints.
   * Throws BlueprintValidationError if bank cannot satisfy requirements (no fake placeholders).
   */
  public async selectQuestionsForBlueprint(
    blueprint: MockBlueprint
  ): Promise<Array<{ sectionName: SectionType; timeLimitMinutes: number; questions: AdminQuestion[] }>> {
    const validation = await this.validateBlueprint(blueprint);
    if (!validation.isValid) {
      throw new BlueprintValidationError(validation);
    }

    const published = await adminQuestionsService.getPublishedQuestionsForCandidates(
      blueprint.exam,
      'MOCK'
    );

    const resultSections: Array<{
      sectionName: SectionType;
      timeLimitMinutes: number;
      questions: AdminQuestion[];
    }> = [];

    for (const section of blueprint.sections) {
      const sectionCandidates = published.filter(
        (q) => q.section === section.name || q.programmeName === blueprint.exam
      );

      const selectedQuestions: AdminQuestion[] = [];
      const usedIds = new Set<string>();

      if (section.questionGroups && section.questionGroups.length > 0) {
        for (const groupReq of section.questionGroups) {
          const matching = sectionCandidates.filter(
            (q) => q.type === groupReq.questionType && !usedIds.has(q.id)
          );
          const taken = matching.slice(0, groupReq.questionCount);
          taken.forEach((q) => usedIds.add(q.id));
          selectedQuestions.push(...taken);
        }
      } else {
        const taken = sectionCandidates.slice(0, section.questionCount);
        selectedQuestions.push(...taken);
      }

      resultSections.push({
        sectionName: section.name as SectionType,
        timeLimitMinutes: section.timeLimitMinutes,
        questions: selectedQuestions,
      });
    }

    return resultSections;
  }
}

export const blueprintSelectorService = new BlueprintSelectorService();
