import { Entity } from '@clasptek/kernel';

export class ModulePrerequisite extends Entity<string> {
  constructor(
    id: string,
    public readonly curriculumVersionId: string,
    public readonly moduleId: string,
    public readonly prerequisiteModuleId: string,
    public prerequisiteType: string = 'module_completion', // module_completion, outcome_mastery, skill_mastery, diagnostic_clearance, learning_path_entry, custom
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
