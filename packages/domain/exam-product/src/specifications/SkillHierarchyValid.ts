import { Specification } from '@clasptek/kernel';
import { SkillFramework } from '../aggregates/skill-framework.aggregate';

export class SkillHierarchyValid extends Specification<SkillFramework> {
  public isSatisfiedBy(candidate: SkillFramework): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const checkCycle = (revId: string): boolean => {
      if (stack.has(revId)) {
        return true; // Circular dependency detected
      }
      if (visited.has(revId)) {
        return false;
      }

      visited.add(revId);
      stack.add(revId);

      const rev = candidate.revisions.find((r) => r.id === revId);
      if (rev?.parentSkillRevisionId) {
        if (checkCycle(rev.parentSkillRevisionId)) {
          return true;
        }
      }

      stack.delete(revId);
      return false;
    };

    for (const rev of candidate.revisions) {
      if (checkCycle(rev.id)) {
        return false; // Hierarchy is invalid (circular reference exists)
      }
    }

    return true;
  }
}
