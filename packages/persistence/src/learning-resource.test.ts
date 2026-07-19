import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool, PostgresLessonRepository, PostgresLearningResourceRepository } from './index';
import {
  Lesson,
  LessonCode,
  SemanticVersion as ResourceSemanticVersion,
  LearningResource,
  ResourceCode
} from '@clasptek/domain-learning-resources';

let lessonQueryCount = 0;
let resourceQueryCount = 0;

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT') && sql.includes('lessons')) {
      if (lessonQueryCount === 0) {
        lessonQueryCount++;
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [{
          id: '10000000-0000-0000-0000-000000000001',
          module_id: 'b1000000-0000-0000-0000-000000000001',
          code: 'IELTS-LIS-L1',
          name: 'IELTS Listening Part 1 Intro',
          description: 'Desc',
          display_order: 1,
          status: 'DRAFT',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('lesson_versions')) {
      return {
        rows: [{
          id: '1f000000-0000-0000-0000-000000000001',
          lesson_id: '10000000-0000-0000-0000-000000000001',
          version_no: '1.0.0',
          status: 'DRAFT',
          name: 'V1.0',
          description: 'Desc',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('content_blocks')) {
      return {
        rows: [{
          id: 'cb000000-0000-0000-0000-000000000001',
          lesson_version_id: '1f000000-0000-0000-0000-000000000001',
          block_type: 'HEADING',
          text_content: '## Heading',
          display_order: 1
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('learning_resources')) {
      if (resourceQueryCount === 0) {
        resourceQueryCount++;
        return { rows: [], rowCount: 0 };
      }
      return {
        rows: [{
          id: '1a000000-0000-0000-0000-000000000001',
          lesson_id: '10000000-0000-0000-0000-000000000001',
          code: 'IELTS-LIS-R1',
          resource_type: 'VIDEO',
          slug: 'ielts-listening-video',
          name: 'Video Name',
          description: 'Desc',
          display_order: 1,
          status: 'DRAFT',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('learning_resource_versions')) {
      return {
        rows: [{
          id: 'lrv00000-0000-0000-0000-000000000001',
          learning_resource_id: 'lr000000-0000-0000-0000-000000000001',
          version_no: '1.0.0',
          status: 'DRAFT',
          name: 'V1.0',
          description: 'Desc',
          lock_version: 0
        }]
      };
    }
    if (sql.includes('SELECT') && sql.includes('media_assets')) {
      return {
        rows: [{
          id: 'ma000000-0000-0000-0000-000000000001',
          resource_version_id: 'lrv00000-0000-0000-0000-000000000001',
          provider: 'SUPABASE_STORAGE',
          bucket: 'resource-private',
          object_key: 'video.mp4',
          region: 'us-east-1',
          checksum: 'chk123',
          mime_type: 'video/mp4',
          size: 5000000,
          duration: 120,
          hash_algorithm: 'SHA-256',
          encryption_status: 'NONE'
        }]
      };
    }
    return { rows: [], rowCount: 0 };
  });

  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
          query: queryMock,
        }),
        end: vi.fn().mockResolvedValue(undefined),
        query: queryMock,
      };
    })
  };
});

describe('Postgres Repository Integration Tests for Lessons & Resources', () => {
  let dbPool: DatabasePool;
  let lessonRepo: PostgresLessonRepository;
  let resourceRepo: PostgresLearningResourceRepository;
  const logger = new ConsoleLogger('PersistenceTest');
  const mockConfig = loadEnvironment(process.env);

  beforeEach(async () => {
    dbPool = new DatabasePool(mockConfig, logger);
    await dbPool.connect();
    lessonRepo = new PostgresLessonRepository(dbPool);
    resourceRepo = new PostgresLearningResourceRepository(dbPool);
    lessonQueryCount = 0;
    resourceQueryCount = 0;
  });

  test('Save and Hydrate Lesson aggregate with content blocks successfully', async () => {
    const lessonId = '10000000-0000-0000-0000-000000000001';
    const lesson = Lesson.create(
      lessonId,
      'b1000000-0000-0000-0000-000000000001',
      new LessonCode('IELTS-LIS-L1'),
      'Intro',
      'Desc',
      1
    );
    lesson.createVersion('lv-1', new ResourceSemanticVersion('1.0.0'), 'Ver 1', 'desc');
    lesson.addContentBlock(new ResourceSemanticVersion('1.0.0'), 'cb-1', 'HEADING', '## Welcome', 1);

    await lessonRepo.save(lesson);

    const retrieved = await lessonRepo.findById(lessonId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code.value).toBe('IELTS-LIS-L1');
    expect(retrieved!.versions.length).toBe(1);
    expect(retrieved!.versions[0].contentBlocks.length).toBe(1);
    expect(retrieved!.versions[0].contentBlocks[0].blockType).toBe('HEADING');
  });

  test('Save and Hydrate LearningResource aggregate with media asset successfully', async () => {
    const resId = '1a000000-0000-0000-0000-000000000001';
    const resource = LearningResource.create(
      resId,
      '10000000-0000-0000-0000-000000000001',
      new ResourceCode('IELTS-LIS-R1'),
      'VIDEO',
      'video-slug',
      'Video Name',
      'desc',
      1
    );
    const verNo = new ResourceSemanticVersion('1.0.0');
    resource.createVersion('lrv-1', verNo, 'Ver 1', 'desc');
    resource.setMediaAsset(verNo, 'ma-1', 'SUPABASE_STORAGE', 'resource-private', 'video.mp4', 'us-east-1', 'chk123', 'video/mp4', 5000000, 120);

    await resourceRepo.save(resource);

    const retrieved = await resourceRepo.findById(resId);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code.value).toBe('IELTS-LIS-R1');
    expect(retrieved!.versions.length).toBe(1);
    expect(retrieved!.versions[0].mediaAsset).not.toBeNull();
    expect(retrieved!.versions[0].mediaAsset!.objectKey).toBe('video.mp4');
  });
});
