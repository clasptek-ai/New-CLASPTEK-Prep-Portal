import { Entity } from '@clasptek/kernel';

export class LessonPrerequisite extends Entity<string> {
  constructor(
    id: string,
    public readonly lessonId: string,
    public readonly prerequisiteLessonId: string,
    public prerequisiteType: string = 'lesson_completion', // lesson_completion, outcome_mastery, skill_mastery, diagnostic_clearance, custom
    public minimumCompletionPercentage: number = 100.00,
    public minimumMasteryPercentage: number = 100.00,
    public requiredSkillRevisionId?: string,
    public requiredSkillLevelId?: string,
    public isMandatory: boolean = true,
    public rationale?: string,
    public status: string = 'active'
  ) {
    super(id);
  }
}
