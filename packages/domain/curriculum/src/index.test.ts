import { describe, test, expect } from 'vitest';
import {
  CurriculumCode,
  CurriculumStatus,
  DependencyVersion,
  MasteryPercentage,
  SequenceNumber,
  NoCircularModuleDependenciesSpecification,
  ModulePrerequisite,
} from './index';
import { ValidationError } from '@clasptek/kernel';

describe('Curriculum Domain Value Objects and Specifications Tests', () => {
  test('CurriculumCode validates formats correctly', () => {
    // Valid
    const code = new CurriculumCode('IELTS-AC-PREP');
    expect(code.value).toBe('IELTS-AC-PREP');

    // Invalid
    expect(() => new CurriculumCode('ielts-lowercase')).toThrow(ValidationError);
    expect(() => new CurriculumCode('AB')).toThrow(ValidationError);
  });

  test('CurriculumStatus normalization and factory methods', () => {
    const status1 = new CurriculumStatus('draft');
    expect(status1.value).toBe('draft');

    // Case normalization
    const status2 = new CurriculumStatus('PUBLISHED' as any);
    expect(status2.value).toBe('published');

    // Invalid
    expect(() => new CurriculumStatus('INVALID_STATUS' as any)).toThrow(ValidationError);
  });

  test('DependencyVersion format verification', () => {
    const version = new DependencyVersion('1.2.3');
    expect(version.value).toBe('1.2.3');

    expect(() => new DependencyVersion('1.2')).toThrow(ValidationError);
  });

  test('MasteryPercentage range checks', () => {
    const pct = new MasteryPercentage(85.5);
    expect(pct.value).toBe(85.5);

    expect(() => new MasteryPercentage(-1.0)).toThrow(ValidationError);
    expect(() => new MasteryPercentage(100.5)).toThrow(ValidationError);
  });

  test('SequenceNumber non-negative checks', () => {
    const seq = new SequenceNumber(5);
    expect(seq.value).toBe(5);

    expect(() => new SequenceNumber(-2)).toThrow(ValidationError);
  });

  test('NoCircularModuleDependenciesSpecification detects cycles', () => {
    const spec = new NoCircularModuleDependenciesSpecification();

    // No cycle
    const prereqs1: ModulePrerequisite[] = [
      new ModulePrerequisite(
        'p-1',
        'v-1',
        'MOD-A',
        'MOD-B',
        'module_completion',
        100,
        100,
        undefined,
        undefined,
        true,
        undefined,
        'active'
      ),
      new ModulePrerequisite(
        'p-2',
        'v-1',
        'MOD-B',
        'MOD-C',
        'module_completion',
        100,
        100,
        undefined,
        undefined,
        true,
        undefined,
        'active'
      ),
    ];
    expect(spec.isSatisfiedBy(prereqs1)).toBe(true);

    // Cycle A -> B -> A
    const prereqs2: ModulePrerequisite[] = [
      new ModulePrerequisite(
        'p-1',
        'v-1',
        'MOD-A',
        'MOD-B',
        'module_completion',
        100,
        100,
        undefined,
        undefined,
        true,
        undefined,
        'active'
      ),
      new ModulePrerequisite(
        'p-2',
        'v-1',
        'MOD-B',
        'MOD-A',
        'module_completion',
        100,
        100,
        undefined,
        undefined,
        true,
        undefined,
        'active'
      ),
    ];
    expect(spec.isSatisfiedBy(prereqs2)).toBe(false);
  });
});
