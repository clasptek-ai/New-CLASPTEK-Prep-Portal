import { describe, test, expect, vi } from 'vitest';
import {
  CreateCurriculumHandler,
  CreateCurriculumCommand,
  CreateCurriculumVersionHandler,
  CreateCurriculumVersionCommand,
  AddLearningModuleHandler,
  AddLearningModuleCommand,
} from './index';
import {
  CurriculumRepository,
  CurriculumVersionRepository,
  LearningModuleRepository,
  Curriculum,
  CurriculumCode,
} from '@clasptek/domain-curriculum';

describe('Curriculum Application Handlers Tests', () => {
  test('CreateCurriculumHandler calls repository and executes successfully', async () => {
    const mockRepo: CurriculumRepository = {
      findById: vi.fn(),
      findByCode: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    };

    const handler = new CreateCurriculumHandler(mockRepo);
    const command: CreateCurriculumCommand = {
      code: 'IELTS-AC-TEST',
      name: 'IELTS Academic Test',
      description: 'Testing',
    };

    const id = await handler.execute(command);
    expect(id).toBeDefined();
    expect(mockRepo.findByCode).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
  });

  test('CreateCurriculumVersionHandler and AddLearningModuleHandler execute successfully', async () => {
    const curId = 'mock-cur-123';
    const mockCur = Curriculum.create(
      curId,
      new CurriculumCode('IELTS-AC-TEST'),
      'IELTS Academic',
      'Testing'
    );

    const mockCurRepo: CurriculumRepository = {
      findById: vi.fn().mockResolvedValue(mockCur),
      findByCode: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    };

    const mockVersionRepo: CurriculumVersionRepository = {
      findById: vi.fn(),
      findByCurriculumAndVersion: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const versionHandler = new CreateCurriculumVersionHandler(mockCurRepo, mockVersionRepo);
    const versionCommand: CreateCurriculumVersionCommand = {
      curriculumId: curId,
      versionNo: '1.0.0',
      name: 'Release 1.0.0',
      description: 'First version',
      expectedVersion: 0,
    };

    const versionId = await versionHandler.execute(versionCommand);
    expect(versionId).toBeDefined();
    expect(mockVersionRepo.save).toHaveBeenCalled();
    expect(mockCurRepo.save).toHaveBeenCalled();

    const mockModuleRepo: LearningModuleRepository = {
      findById: vi.fn(),
      findByVersion: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const moduleHandler = new AddLearningModuleHandler(mockModuleRepo);
    const moduleCommand: AddLearningModuleCommand = {
      curriculumVersionId: versionId,
      code: 'MOD-1',
      name: 'Listening Skills Module',
      description: 'Study listening skills',
      moduleType: 'core',
      defaultSequenceNo: 1,
      estimatedStudyMinutes: 60,
      isRequired: true,
    };

    const moduleId = await moduleHandler.execute(moduleCommand);
    expect(moduleId).toBeDefined();
    expect(mockModuleRepo.save).toHaveBeenCalled();
  });
});
