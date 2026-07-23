import { Specification } from '@clasptek/kernel';
import { LessonPrerequisite } from '../entities/lesson-prerequisite.entity';

export class NoCircularLessonDependenciesSpecification extends Specification<LessonPrerequisite[]> {
  public isSatisfiedBy(prerequisites: LessonPrerequisite[]): boolean {
    const adj: Map<string, string[]> = new Map();
    prerequisites.forEach((p) => {
      if (p.status === 'active' && p.isMandatory) {
        const list = adj.get(p.lessonId) || [];
        list.push(p.prerequisiteLessonId);
        adj.set(p.lessonId, list);
      }
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recStack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recStack.delete(node);
      return false;
    };

    for (const key of adj.keys()) {
      if (hasCycle(key)) {
        return false;
      }
    }
    return true;
  }
}
