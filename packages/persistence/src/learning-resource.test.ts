import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';
import { DatabasePool } from './index';
import {
  LearningResource,
  ResourceCode,
  SensitivityLevel,
  VisibilityScope,
  VariantPurpose,
  ResourceVersion,
  VersionStatus,
  ResourceCollection,
  StorageAsset,
} from '@clasptek/domain-learning-resources';
import {
  PostgresLearningResourceRepository,
  PostgresResourceVersionRepository,
  PostgresResourceCollectionRepository,
  PostgresStorageAssetRepository,
} from './index';

// Initialize mutable mock variables on globalThis to bypass Vitest hoist closure isolation
(globalThis as any).queriesRun = [];
(globalThis as any).mockRows = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, _params?: any[]) => {
    (globalThis as any).queriesRun.push(sql);

    // Simple routing based on SQL keywords
    if (sql.includes('SELECT') && sql.includes('learning_resources')) {
      const customRows = (globalThis as any).mockRows;
      if (customRows && customRows.length > 0) {
        return { rows: customRows };
      }
      return {
        rows: [
          {
            id: 'lr-123',
            code: 'LR-CODE',
            slug: 'lr-slug',
            canonical_title: 'Title',
            canonical_description: 'Desc',
            resource_type_id: 'type-123',
            primary_category_id: null,
            sensitivity: 'normal',
            visibility: 'authenticated',
            owner_organization_id: null,
            default_language_code: 'en',
            current_default_variant_id: null,
            status: 'draft',
            lock_version: 0,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('resource_variants')) {
      return {
        rows: [
          {
            id: 'v-123',
            learning_resource_id: 'lr-123',
            code: 'VAR-CODE',
            language_code: 'en',
            region_code: null,
            accessibility_profile: 'none',
            variant_purpose: 'standard',
            is_default: true,
            current_published_version_id: null,
            current_version_no: 1,
            status: 'active',
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('resource_versions')) {
      return {
        rows: [
          {
            id: 'rv-123',
            resource_variant_id: 'v-123',
            version_no: 1,
            status: 'draft',
            title: 'Title',
            description: 'Desc',
            resource_format_id: 'format-123',
            version_label: null,
            change_summary: null,
            source_attribution: null,
            copyright_owner: null,
            copyright_year: null,
            license_id: null,
            estimated_study_minutes: 10,
            requires_preview: false,
            allows_download: true,
            allows_streaming: false,
            effective_from: null,
            effective_to: null,
            reviewed_at: null,
            reviewed_by: null,
            published_at: null,
            published_by: null,
            retired_at: null,
            retired_by: null,
            lock_version: 0,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('resource_collections')) {
      return {
        rows: [
          {
            id: 'rc-123',
            code: 'RC-CODE',
            name: 'Collection',
            description: 'Desc',
            parent_collection_id: null,
            display_order: 1,
            status: 'active',
            lock_version: 0,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('collection_resources')) {
      return {
        rows: [
          {
            id: 'mem-123',
            resource_collection_id: 'rc-123',
            learning_resource_id: 'lr-123',
            display_order: 1,
          },
        ],
      };
    }
    if (sql.includes('SELECT') && sql.includes('storage_objects')) {
      return {
        rows: [
          {
            id: 'so-123',
            storage_provider: 'supabase_storage',
            bucket_name: 'bucket',
            object_path: 'key',
            provider_object_id: null,
            original_filename: 'test.png',
            detected_mime_type: 'image/png',
            detected_extension: 'png',
            size_bytes: 100,
            etag: null,
            storage_class: 'STANDARD',
            integrity_status: 'validated',
            security_status: 'validated_clear',
            availability_status: 'available',
            uploaded_at: new Date(),
            validated_at: null,
            promoted_at: null,
            retention_until: null,
            lock_version: 0,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        ],
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
    }),
  };
});

describe('Postgres Repository V2 Integration Tests', () => {
  let dbPool: DatabasePool;
  let resourceRepo: PostgresLearningResourceRepository;
  let versionRepo: PostgresResourceVersionRepository;
  let collectionRepo: PostgresResourceCollectionRepository;
  let storageRepo: PostgresStorageAssetRepository;

  const logger = new ConsoleLogger('PersistenceTest');
  const mockConfig = loadEnvironment(process.env);

  beforeEach(async () => {
    dbPool = new DatabasePool(mockConfig, logger);
    await dbPool.connect();
    resourceRepo = new PostgresLearningResourceRepository(dbPool);
    versionRepo = new PostgresResourceVersionRepository(dbPool);
    collectionRepo = new PostgresResourceCollectionRepository(dbPool);
    storageRepo = new PostgresStorageAssetRepository(dbPool);
    (globalThis as any).mockRows = [];
    (globalThis as any).queriesRun = [];
  });

  test('Save and Hydrate LearningResource successfully', async () => {
    const resource = LearningResource.create(
      'lr-123',
      new ResourceCode('LR-CODE'),
      'lr-slug',
      'Title',
      'Desc',
      'type-123',
      null,
      new SensitivityLevel('normal'),
      new VisibilityScope('authenticated')
    );
    resource.addVariant('v-123', 'VAR-CODE', 'en', new VariantPurpose('standard'), true);

    await resourceRepo.save(resource);
    const hasVariantInsert = (globalThis as any).queriesRun.some((q: string) =>
      q.includes('INSERT INTO public.resource_variants')
    );
    expect(hasVariantInsert).toBe(true);

    const retrieved = await resourceRepo.findById('lr-123');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code.value).toBe('LR-CODE');
    expect(retrieved!.variants.length).toBe(1);
    expect(retrieved!.variants[0].code).toBe('VAR-CODE');
  });

  test('Save and Hydrate ResourceVersion successfully', async () => {
    const version = new ResourceVersion(
      'rv-123',
      'v-123',
      1,
      new VersionStatus('draft'),
      'Title',
      'Desc',
      'format-123',
      null,
      null,
      null,
      null,
      null,
      null,
      10,
      false,
      true,
      false,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      new Date(),
      new Date(),
      null
    );

    await versionRepo.save(version);
    const hasVersionInsert = (globalThis as any).queriesRun.some((q: string) =>
      q.includes('INSERT INTO public.resource_versions')
    );
    expect(hasVersionInsert).toBe(true);

    const retrieved = await versionRepo.findById('rv-123');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.versionNo).toBe(1);
    expect(retrieved!.resourceVariantId).toBe('v-123');
  });

  test('Save and Hydrate ResourceCollection successfully', async () => {
    const collection = new ResourceCollection(
      'rc-123',
      null,
      'RC-CODE',
      'Collection',
      'Desc',
      1,
      'active',
      0,
      new Date(),
      new Date(),
      null
    );
    collection.addResource('lr-123');

    await collectionRepo.save(collection);
    const hasMembershipInsert = (globalThis as any).queriesRun.some((q: string) =>
      q.includes('INSERT INTO public.collection_resources')
    );
    expect(hasMembershipInsert).toBe(true);

    const retrieved = await collectionRepo.findById('rc-123');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code).toBe('RC-CODE');
    expect(retrieved!.resourceIds.length).toBe(1);
  });

  test('Save and Hydrate StorageAsset successfully', async () => {
    const asset = new StorageAsset(
      'so-123',
      'supabase_storage',
      'bucket',
      'key',
      'provider-id-123',
      'test.png',
      'image/png',
      'png',
      100,
      'etag-123',
      'STANDARD',
      'validated',
      'validated_clear',
      'available',
      new Date(),
      null,
      null,
      null,
      0,
      new Date(),
      new Date(),
      null
    );

    await storageRepo.save(asset);
    const hasStorageInsert = (globalThis as any).queriesRun.some((q: string) =>
      q.includes('INSERT INTO public.storage_objects')
    );
    expect(hasStorageInsert).toBe(true);

    const retrieved = await storageRepo.findById('so-123');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.bucketName).toBe('bucket');
    expect(retrieved!.availabilityStatus).toBe('available');
  });

  test('Optimistic locking concurrency check', async () => {
    const resource = LearningResource.create(
      'lr-123',
      new ResourceCode('LR-CODE'),
      'lr-slug',
      'Title',
      'Desc',
      'type-123',
      null,
      new SensitivityLevel('normal'),
      new VisibilityScope('authenticated')
    );

    // Mock existing resource lock version in DB to be higher
    (globalThis as any).mockRows = [
      {
        id: 'lr-123',
        code: 'LR-CODE',
        slug: 'lr-slug',
        canonical_title: 'Title',
        canonical_description: 'Desc',
        resource_type_id: 'type-123',
        primary_category_id: null,
        sensitivity: 'normal',
        visibility: 'authenticated',
        owner_organization_id: null,
        default_language_code: 'en',
        current_default_variant_id: null,
        status: 'draft',
        lock_version: 5, // different from resource.lockVersion = 0
      },
    ];

    await expect(resourceRepo.save(resource)).rejects.toThrow('Concurrency violation');
  });
});
