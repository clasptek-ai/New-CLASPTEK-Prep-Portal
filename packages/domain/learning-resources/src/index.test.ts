import { describe, test, expect } from 'vitest';
import {
  Lesson,
  LessonCode,
  SemanticVersion,
  LearningResource,
  ResourceCode,
  DomainError
} from './index';

describe('Domain Learning Resources & Lessons Aggregate Tests', () => {
  test('Create Lesson aggregate with versions and content blocks successfully', () => {
    const lessonId = '10000000-0000-0000-0000-000000000001';
    const moduleId = 'b1000000-0000-0000-0000-000000000001';
    const code = new LessonCode('IELTS-LIS-L1');
    
    const lesson = Lesson.create(lessonId, moduleId, code, 'Part 1 Intro', 'Description', 1);
    expect(lesson.status).toBe('DRAFT');
    expect(lesson.domainEvents.length).toBe(1);
    expect((lesson.domainEvents[0] as any).eventName).toBe('LessonCreated');

    const versionNo = new SemanticVersion('1.0.0');
    const version = lesson.createVersion('lv-101', versionNo, 'Version 1', 'Desc');
    expect(lesson.versions.length).toBe(1);

    lesson.addContentBlock(versionNo, 'cb-1', 'HEADING', '## Heading', 1);
    lesson.addContentBlock(versionNo, 'cb-2', 'PARAGRAPH', 'Body text', 2);
    expect(version.contentBlocks.length).toBe(2);

    // Duplicate order constraint check
    expect(() => {
      lesson.addContentBlock(versionNo, 'cb-3', 'PARAGRAPH', 'Conflict', 2);
    }).toThrow(DomainError);

    // Publish
    lesson.publishVersion(versionNo);
    expect(lesson.status).toBe('PUBLISHED');
    expect(version.status).toBe('PUBLISHED');

    // Immutable check
    expect(() => {
      lesson.addContentBlock(versionNo, 'cb-3', 'PARAGRAPH', 'Conflict', 3);
    }).toThrow(DomainError);
  });

  test('Create LearningResource aggregate with versions and metadata successfully', () => {
    const resId = '1a000000-0000-0000-0000-000000000001';
    const lessonId = '10000000-0000-0000-0000-000000000001';
    const code = new ResourceCode('IELTS-LIS-R1');

    const res = LearningResource.create(resId, lessonId, code, 'VIDEO', 'ielts-listening-video', 'Tutorial', 'Desc', 1);
    expect(res.status).toBe('DRAFT');

    const versionNo = new SemanticVersion('1.0.0');
    res.createVersion('lrv-101', versionNo, 'Video Version 1', 'Desc');
    
    res.setMediaAsset(versionNo, 'ma-1', 'SUPABASE_STORAGE', 'resource-private', 'video.mp4', 'us-east-1', 'chk123', 'video/mp4', 5000000, 120);
    res.setMetadata(versionNo, 'difficulty', 'BEGINNER');

    res.publishVersion(versionNo);
    expect(res.status).toBe('PUBLISHED');

    // Modify check on published version
    expect(() => {
      res.setMetadata(versionNo, 'difficulty', 'ADVANCED');
    }).toThrow(DomainError);
  });
});
