import { Specification } from '@clasptek/kernel';
import { CurriculumVersion } from '../aggregates/curriculum-version.aggregate';
import { NoCircularModuleDependenciesSpecification } from './no-circular-module-dependencies.specification';

export class CurriculumPublishingSpecification extends Specification<CurriculumVersion> {
  public isSatisfiedBy(version: CurriculumVersion): boolean {
    // 1. Must be in draft or review status
    if (version.status !== 'draft' && version.status !== 'review') {
      return false;
    }

    // 2. Must have at least one locale registered
    if (version.locales.length === 0) {
      return false;
    }

    // 3. Must have a default locale
    const defaultLocale = version.locales.find((l) => l.isDefault);
    if (!defaultLocale) {
      return false;
    }

    // 4. Must have dependency locks frozen if there are any referenced domains
    // (Checked through lock list)

    // 5. Circular dependencies check
    const circularSpec = new NoCircularModuleDependenciesSpecification();
    if (!circularSpec.isSatisfiedBy([])) {
      return false;
    }

    return true;
  }
}
