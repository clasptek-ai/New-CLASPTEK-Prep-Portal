import { describe, test, expect } from 'vitest';
import {
  ExamProduct,
  ExamCode,
  VersionNumber,
  ExamProductStatus,
  DomainError,
  SkillFramework,
  SkillCode
} from './index';

describe('Exam Product Domain V3 Unit Tests', () => {
  const pId = 'e0000000-0000-0000-0000-000000000001';
  const vId = 'e0000000-0000-0000-0000-000000000101';

  test('Value Objects enforce validation rules', () => {
    // Valid inputs
    expect(new ExamCode('IELTS-AC').value).toBe('IELTS-AC');
    expect(new VersionNumber('1.0.0').value).toBe('1.0.0');

    // Invalid inputs
    expect(() => new ExamCode('ielts-ac')).toThrow(DomainError);
    expect(() => new ExamCode('I@')).toThrow(DomainError);
    expect(() => new VersionNumber('1.0')).toThrow(DomainError);
    expect(() => new VersionNumber('abc')).toThrow(DomainError);
  });

  test('ExamProduct State Transitions', () => {
    const product = new ExamProduct(
      pId,
      new ExamCode('IELTS-AC'),
      'ielts-academic',
      'IELTS Academic',
      'International English Language Testing System',
      'language_proficiency',
      new ExamProductStatus('DRAFT')
    );
    expect(product.status.value).toBe('DRAFT');

    const version = product.createVersion(vId, new VersionNumber('1.0.0'), 'V1 Draft');
    expect(version.status).toBe('DRAFT');

    // Approve version
    product.approveVersion(vId);
    expect(version.status).toBe('APPROVED');

    // Publish version
    product.publishVersion(vId, 'admin-1');
    expect(product.status.value).toBe('PUBLISHED');
    expect(version.status).toBe('PUBLISHED');
    expect(product.currentVersionId).toBe(vId);

    // Archive product
    product.archive('admin-1');
    expect(product.status.value).toBe('ARCHIVED');
    expect(version.status).toBe('ARCHIVED');
  });

  test('SkillFramework Hierarchies', () => {
    const framework = new SkillFramework(
      'sf-1',
      'SF-CODE',
      'Skill Framework 1'
    );
    expect(framework.status).toBe('DRAFT');

    const vNo = '1.0.0';
    const version = framework.createVersion('sfv-1', vNo, 'Version 1');
    expect(version.status).toBe('DRAFT');

    const skill = framework.addSkill('sk-1', new SkillCode('SK-CODE'), 'Canonical Skill');
    expect(skill.canonicalName).toBe('Canonical Skill');

    const rev = framework.addRevision('r-1', 'sk-1', 'sfv-1', 1, 'Revision 1');
    expect(rev.name).toBe('Revision 1');
    expect(skill.currentRevisionId).toBe('r-1');
  });
});
