import { describe, test, expect, vi } from 'vitest';
import {
  CreateLessonHandler,
  CreateLessonCommand,
  PublishResourceHandler,
  PublishResourceCommand,
} from './index';
import {
  LessonRepository,
  LearningResourceRepository,
  LearningResource,
} from '@clasptek/domain-learning-resources';

describe('Application Handlers Tests for Lessons & Resources', () => {
  test('CreateLessonHandler creates and saves lesson aggregate successfully', async () => {
    const mockRepo: LessonRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      save: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      search: vi.fn(),
      nextIdentity: vi.fn().mockReturnValue('mock-les-id'),
    };

    const handler = new CreateLessonHandler(mockRepo);
    const command: CreateLessonCommand = {
      moduleId: 'm-1',
      code: 'IELTS-LIS-L1',
      name: 'Lesson 1',
      description: 'Intro to part 1',
      displayOrder: 1,
    };

    const id = await handler.execute(command);
    expect(id).toBe('mock-les-id');
    expect(mockRepo.exists).toHaveBeenCalledWith('IELTS-LIS-L1');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  test('PublishResourceHandler publishes a resource version successfully', async () => {
    const mockResource = LearningResource.create(
      'res-1',
      'les-1',
      { value: 'IELTS-R1' } as any,
      'VIDEO',
      'video-slug',
      'Video Name',
      'desc',
      1
    );
    mockResource.createVersion('lrv-1', { value: '1.0.0' } as any, 'Ver 1', 'desc');

    const mockRepo: LearningResourceRepository = {
      findById: vi.fn().mockResolvedValue(mockResource),
      findByCode: vi.fn(),
      save: vi.fn(),
      exists: vi.fn(),
      search: vi.fn(),
      nextIdentity: vi.fn(),
    };

    const handler = new PublishResourceHandler(mockRepo);
    const command: PublishResourceCommand = {
      resourceId: 'res-1',
      versionNo: '1.0.0',
    };

    await handler.execute(command);
    expect(mockResource.status).toBe('PUBLISHED');
    expect(mockRepo.save).toHaveBeenCalledWith(mockResource);
  });
});
