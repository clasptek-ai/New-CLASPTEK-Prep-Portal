import { describe, test, expect, vi } from 'vitest';
import {
  CreateCurriculumHandler,
  CreateCurriculumCommand,
  CreateProgrammeHandler,
  CreateProgrammeCommand,
  AddCourseHandler,
  AddCourseCommand
} from './index';
import { CurriculumRepository, ProgrammeRepository, Programme } from '@clasptek/domain-curriculum';

describe('Application Handlers tests', () => {
  test('CreateCurriculumHandler calls repository and executes successfully', async () => {
    const mockRepo: CurriculumRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      save: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      findPublished: vi.fn(),
      findVersion: vi.fn(),
      search: vi.fn(),
      nextIdentity: vi.fn().mockReturnValue('mock-cur-id')
    };

    const handler = new CreateCurriculumHandler(mockRepo);
    const command: CreateCurriculumCommand = {
      code: 'IELTS-AC-TEST',
      name: 'IELTS Academic Test',
      description: 'Testing'
    };

    const id = await handler.execute(command);
    expect(id).toBe('mock-cur-id');
    expect(mockRepo.exists).toHaveBeenCalledWith('IELTS-AC-TEST');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  test('CreateProgrammeHandler and AddCourseHandler execute successfully', async () => {
    const mockProgRepo: ProgrammeRepository = {
      findById: vi.fn().mockImplementation(async (id) => {
        const prog = new Programme(id, 'ex-1', { value: 'PROG-1' } as any, 'prog-1', 'Prog Name', 'description');
        prog.createVersion('pv-101', { value: '1.0.0' } as any, 'V1');
        return prog;
      }),
      findByCode: vi.fn(),
      save: vi.fn(),
      exists: vi.fn().mockResolvedValue(false),
      findPublished: vi.fn(),
      search: vi.fn(),
      nextIdentity: vi.fn().mockReturnValue('mock-prog-id')
    };

    const createHandler = new CreateProgrammeHandler(mockProgRepo);
    const createCommand: CreateProgrammeCommand = {
      code: 'IELTS-PROG',
      name: 'IELTS Academic Programme',
      description: 'Prep',
      examProductId: 'ex-1'
    };

    const pId = await createHandler.execute(createCommand);
    expect(pId).toBe('mock-prog-id');

    const courseHandler = new AddCourseHandler(mockProgRepo);
    const courseCommand: AddCourseCommand = {
      programmeId: 'mock-prog-id',
      versionId: 'pv-101',
      courseId: 'course-1',
      name: 'IELTS Complete Prep Course',
      displayOrder: 1,
      expectedVersion: 0
    };

    const courseId = await courseHandler.execute(courseCommand);
    expect(courseId).toBe('course-1');
    expect(mockProgRepo.save).toHaveBeenCalled();
  });
});
