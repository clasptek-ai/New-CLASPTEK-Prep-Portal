import { describe, test, expect } from 'vitest';
import {
  Curriculum,
  CurriculumCode,
  SemanticVersion,
  Programme,
  DomainError
} from './index';

describe('Curriculum Aggregate Invariant Tests', () => {
  const cId = 'c0000000-0000-0000-0000-000000000002';
  const cCode = new CurriculumCode('IELTS-AC-CURRIC');
  const cSlug = 'ielts-academic-curric';

  test('Create Curriculum aggregate with events successfully', () => {
    const cur = new Curriculum(cId, cCode, cSlug, 'IELTS Prep', 'IELTS test preparation');
    expect(cur.id).toBe(cId);
    expect(cur.code.value).toBe('IELTS-AC-CURRIC');
    expect(cur.status).toBe('DRAFT');
    expect(cur.domainEvents.length).toBe(1);
    expect((cur.domainEvents[0] as any).eventName).toBe('CurriculumCreated');
  });

  test('Create curriculum versions successfully', () => {
    const cur = new Curriculum(cId, cCode, cSlug, 'IELTS Prep', 'IELTS test preparation');
    const ver = cur.createVersion('cv-101', new SemanticVersion('1.0.0'), 'V1 Release', 'First draft');
    expect(ver.id).toBe('cv-101');
    expect(ver.versionNo.value).toBe('1.0.0');
    expect(cur.versions.length).toBe(1);
    
    // Attempting duplicate versionNo throws DomainError
    expect(() => {
      cur.createVersion('cv-102', new SemanticVersion('1.0.0'), 'V1 Copy');
    }).toThrow(DomainError);
  });

  test('Transition Curriculum versions status machine successfully', () => {
    const cur = new Curriculum(cId, cCode, cSlug, 'IELTS Prep', 'IELTS test preparation');
    cur.createVersion('cv-101', new SemanticVersion('1.0.0'), 'V1 Release');
    
    cur.submitReview('cv-101');
    expect(cur.versions[0].status).toBe('UNDER_REVIEW');

    cur.approveVersion('cv-101');
    expect(cur.versions[0].status).toBe('APPROVED');

    cur.publishVersion('cv-101', 'admin-user');
    expect(cur.versions[0].status).toBe('PUBLISHED');
    expect(cur.currentVersionId).toBe('cv-101');

    // Create a new version and publish it to deprecate the older one
    cur.createVersion('cv-102', new SemanticVersion('2.0.0'), 'V2 Release');
    cur.publishVersion('cv-102', 'admin-user');
    
    expect(cur.versions[0].status).toBe('DEPRECATED');
    expect(cur.versions[1].status).toBe('PUBLISHED');
    expect(cur.currentVersionId).toBe('cv-102');
  });

  test('Prerequisite cycle prevention throws error', () => {
    const cur = new Curriculum(cId, cCode, cSlug, 'IELTS Prep', 'IELTS test preparation');
    cur.createVersion('cv-101', new SemanticVersion('1.0.0'), 'V1');

    // Add prerequisite: Module B depends on Module A
    cur.addPrerequisite('cv-101', {
      sourceKind: 'Module',
      sourceId: 'm-A',
      targetKind: 'Module',
      targetId: 'm-B',
      prerequisiteType: 'REQUIRED'
    });

    // Add prerequisite: Module C depends on Module B
    cur.addPrerequisite('cv-101', {
      sourceKind: 'Module',
      sourceId: 'm-B',
      targetKind: 'Module',
      targetId: 'm-C',
      prerequisiteType: 'REQUIRED'
    });

    // Trying to add prerequisite: Module A depends on Module C (cycle: A -> B -> C -> A) must throw DomainError
    expect(() => {
      cur.addPrerequisite('cv-101', {
        sourceKind: 'Module',
        sourceId: 'm-C',
        targetKind: 'Module',
        targetId: 'm-A',
        prerequisiteType: 'REQUIRED'
      });
    }).toThrow(DomainError);
  });
});

describe('Programme Aggregate Invariant Tests', () => {
  const pId = 'p0000000-0000-0000-0000-000000000002';
  const pCode = new CurriculumCode('IELTS-AC-PREP');
  const pSlug = 'ielts-academic-prep';
  const exId = 'e0000000-0000-0000-0000-000000000002';

  test('Add Course, Subject, Module, and Competency with display order uniqueness check', () => {
    const prog = new Programme(pId, exId, pCode, pSlug, 'IELTS Academic Prep', 'Prep');
    prog.createVersion('pv-101', new SemanticVersion('1.0.0'), 'V1');

    // Add Course
    prog.addCourse('pv-101', 'co-001', 'Complete Prep Course', 'Desc', 1);

    // Duplicate Course display order throws error
    expect(() => {
      prog.addCourse('pv-101', 'co-002', 'Course B', 'Desc', 1);
    }).toThrow(DomainError);

    // Add Subjects under Course
    prog.addSubject('co-001', 'sub-001', 'Listening', 'Desc', 1);
    
    // Duplicate Subject display order throws error
    expect(() => {
      prog.addSubject('co-001', 'sub-002', 'Reading', 'Desc', 1);
    }).toThrow(DomainError);

    // Add Modules under Subject
    prog.addModule('sub-001', 'mod-001', 'Form Spelling', 'Desc', 1);
    
    // Duplicate Module display order throws error
    expect(() => {
      prog.addModule('sub-001', 'mod-002', 'Audio Section 2', 'Desc', 1);
    }).toThrow(DomainError);

    // Add Competencies under Module
    prog.addCompetency('mod-001', 'comp-001', 'IELTS-C1', 'Numbers Spelling', 'Desc', 1);

    // Duplicate Competency display order throws error
    expect(() => {
      prog.addCompetency('mod-001', 'comp-002', 'IELTS-C2', 'Names Spelling', 'Desc', 1);
    }).toThrow(DomainError);
  });

  test('Immutability enforcement on published versions', () => {
    const prog = new Programme(pId, exId, pCode, pSlug, 'IELTS Academic Prep', 'Prep');
    prog.createVersion('pv-101', new SemanticVersion('1.0.0'), 'V1');
    prog.addCourse('pv-101', 'co-001', 'Complete Prep Course', 'Desc', 1);

    prog.publishVersion('pv-101', 'admin-user');

    // Mutating published versions throws DomainError
    expect(() => {
      prog.addCourse('pv-101', 'co-002', 'Course B', 'Desc', 2);
    }).toThrow(DomainError);
  });
});
