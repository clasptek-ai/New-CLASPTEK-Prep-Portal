export interface SkillHierarchyReadModel {
  skillRevisionId: string;
  skillId: string;
  skillFrameworkVersionId: string;
  parentSkillRevisionId?: string | undefined;
  skillName: string;
  category?: string | undefined;
  domain?: string | undefined;
  isLeafSkill: boolean;
  depth: number;
  path: string[];
}
