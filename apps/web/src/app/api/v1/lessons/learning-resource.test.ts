/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables before config module loads
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';
import { POST as createLessonApi } from '../admin/lessons/route';
import { PATCH as updateLessonApi } from '../admin/lessons/[id]/route';
import { POST as createResourceApi } from '../admin/resources/route';
import { PATCH as updateResourceApi } from '../admin/resources/[id]/route';
import { POST as publishResourceApi } from '../admin/resources/[id]/publish/route';
import { POST as archiveResourceApi } from '../admin/resources/[id]/archive/route';
import { POST as restoreResourceApi } from '../admin/resources/[id]/restore/route';
import { POST as uploadResourceApi } from '../admin/resources/[id]/upload/route';
import { GET as searchLessonsApi } from './route';
import { GET as getLessonApi } from './[id]/route';
import { GET as getResourceApi } from '../resources/[id]/route';
import { GET as searchResourcesApi } from '../resources/search/route';

const mockLessons = new Map<string, any>();
const mockLessonVersions = new Map<string, any>();
const mockContentBlocks = new Map<string, any>();
const mockResources = new Map<string, any>();
const mockResourceVersions = new Map<string, any>();
const mockMediaAssets = new Map<string, any>();
const mockAttachments = new Map<string, any>();
const mockMetadata = new Map<string, any>();
const mockTranscripts = new Map<string, any>();
const mockCaptions = new Map<string, any>();
const mockResourceVariants = new Map<string, any>();
const mockStorageObjects = new Map<string, any>();
const mockResourceVersionObjects = new Map<string, any>();
const mockMetadataDefinitions = new Map<string, any>();

// Mock pg module queries
vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    // 1. INSERT / SAVE operations
    if (
      sql.includes('INSERT INTO public.lessons') ||
      sql.includes('INSERT INTO lessons') ||
      sql.includes('UPDATE public.lessons') ||
      sql.includes('UPDATE lessons')
    ) {
      if (params) {
        if (params.length === 16) {
          const [
            id,
            learning_module_id,
            code,
            slug,
            title,
            summary,
            _type,
            default_sequence_no,
            _est,
            _min,
            _max,
            _method,
            _policy,
            _req,
            status,
            lock,
          ] = params;
          mockLessons.set(id, {
            id,
            module_id: learning_module_id,
            code,
            slug,
            title,
            summary,
            name: title,
            description: summary,
            display_order: default_sequence_no,
            status,
            lock_version: lock,
          });
        } else if (params.length === 15) {
          const [
            code,
            slug,
            title,
            summary,
            _type,
            default_sequence_no,
            _est,
            _min,
            _max,
            _method,
            _policy,
            _req,
            status,
            lock,
            id,
          ] = params;
          mockLessons.set(id, {
            id,
            code,
            slug,
            title,
            summary,
            name: title,
            description: summary,
            display_order: default_sequence_no,
            status,
            lock_version: lock,
          });
        } else if (params.length === 7) {
          const [id, module_id, code, name, description, display_order, status] = params;
          mockLessons.set(id, {
            id,
            module_id,
            code,
            name,
            description,
            display_order,
            status,
            lock_version: 0,
          });
        }
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.lesson_versions') ||
      sql.includes('INSERT INTO lesson_versions')
    ) {
      if (params) {
        const [id, lesson_id, version_no, status, name, description] = params;
        mockLessonVersions.set(id, {
          id,
          lesson_id,
          version_no,
          status,
          name,
          description,
          lock_version: 0,
        });
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.content_blocks') ||
      sql.includes('INSERT INTO content_blocks')
    ) {
      if (params) {
        const [id, lesson_version_id, block_type, text_content, display_order] = params;
        mockContentBlocks.set(id, {
          id,
          lesson_version_id,
          block_type,
          text_content,
          display_order,
        });
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.learning_resources') ||
      sql.includes('INSERT INTO learning_resources')
    ) {
      if (params) {
        if (params.length >= 13) {
          const [
            id,
            code,
            slug,
            canonical_title,
            canonical_description,
            resource_type_id,
            _cat,
            _sens,
            _vis,
            _owner,
            _lang,
            _variant,
            status,
          ] = params;
          mockResources.set(id, {
            id,
            code,
            slug,
            canonical_title,
            canonical_description,
            name: canonical_title,
            description: canonical_description,
            resource_type: resource_type_id,
            status,
            lock_version: 0,
          });
        } else {
          const [
            id,
            lesson_id,
            code,
            resource_type,
            slug,
            name,
            description,
            display_order,
            status,
          ] = params;
          mockResources.set(id, {
            id,
            lesson_id,
            code,
            resource_type,
            slug,
            name,
            description,
            display_order,
            status,
            lock_version: 0,
          });
        }
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.resource_variants') ||
      sql.includes('INSERT INTO resource_variants')
    ) {
      if (params) {
        const [
          id,
          learning_resource_id,
          code,
          language_code,
          region_code,
          accessibility_profile,
          variant_purpose,
          is_default,
          current_published_version_id,
          current_version_no,
          status,
        ] = params;
        mockResourceVariants.set(id, {
          id,
          learning_resource_id,
          code,
          language_code,
          region_code,
          accessibility_profile,
          variant_purpose,
          is_default,
          current_published_version_id,
          current_version_no,
          status,
        });
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.resource_versions') ||
      sql.includes('INSERT INTO resource_versions') ||
      sql.includes('INSERT INTO learning_resource_versions')
    ) {
      if (params) {
        const [id, resource_variant_id, version_no, status, title, description] = params;
        mockResourceVersions.set(id, {
          id,
          resource_variant_id,
          version_no,
          status,
          name: title,
          description,
          lock_version: 0,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO media_assets')) {
      if (params) {
        const [
          id,
          resource_version_id,
          provider,
          bucket,
          object_key,
          region,
          checksum,
          mime_type,
          size,
          duration,
        ] = params;
        mockMediaAssets.set(id, {
          id,
          resource_version_id,
          provider,
          bucket,
          object_key,
          region,
          checksum,
          mime_type,
          size,
          duration,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO resource_attachments')) {
      if (params) {
        const [id, resource_version_id, name, file_size, mime_type, object_key] = params;
        mockAttachments.set(id, {
          id,
          resource_version_id,
          name,
          file_size,
          mime_type,
          object_key,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO resource_transcripts')) {
      if (params) {
        const [id, resource_version_id, transcript_text, language] = params;
        mockTranscripts.set(id, { id, resource_version_id, transcript_text, language });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO resource_captions')) {
      if (params) {
        const [id, resource_version_id, caption_text, language] = params;
        mockCaptions.set(id, { id, resource_version_id, caption_text, language });
      }
      return { rowCount: 1 };
    }
    if (
      (sql.includes('public.resource_metadata_definitions') ||
        sql.includes('resource_metadata_definitions')) &&
      !sql.includes('resource_metadata m')
    ) {
      if (sql.includes('SELECT')) {
        const [namespace, metadata_key] = params || [];
        const def = Array.from(mockMetadataDefinitions.values()).find(
          (d: any) => d.namespace === namespace && d.metadata_key === metadata_key
        );
        return { rows: def ? [def] : [], rowCount: def ? 1 : 0 };
      }
      if (sql.includes('INSERT')) {
        const [id, namespace, metadata_key, name] = params || [];
        mockMetadataDefinitions.set(id, { id, namespace, metadata_key, name });
        return { rowCount: 1 };
      }
    }
    if (
      sql.includes('INSERT INTO public.resource_metadata') ||
      sql.includes('INSERT INTO resource_metadata')
    ) {
      if (params) {
        const [resource_version_id, metadata_definition_id, metadata_value_json] = params;
        mockMetadata.set(`${resource_version_id}_${metadata_definition_id}`, {
          resource_version_id,
          metadata_definition_id,
          metadata_value_json,
        });
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.storage_objects') ||
      sql.includes('INSERT INTO storage_objects')
    ) {
      if (params) {
        const [
          id,
          storage_provider,
          bucket_name,
          object_path,
          original_filename,
          detected_mime_type,
          size_bytes,
          etag,
        ] = params;
        mockStorageObjects.set(id, {
          id,
          storage_provider,
          bucket_name,
          object_path,
          original_filename,
          detected_mime_type,
          size_bytes,
          etag,
        });
      }
      return { rowCount: 1 };
    }
    if (
      sql.includes('INSERT INTO public.resource_version_objects') ||
      sql.includes('INSERT INTO resource_version_objects')
    ) {
      if (params) {
        const [resource_version_id, storage_object_id, object_role] = params;
        mockResourceVersionObjects.set(`${resource_version_id}_${storage_object_id}`, {
          resource_version_id,
          storage_object_id,
          object_role,
        });
      }
      return { rowCount: 1 };
    }

    // 2. DELETE operations
    if (
      sql.includes('DELETE FROM content_blocks') ||
      sql.includes('DELETE FROM media_assets') ||
      sql.includes('DELETE FROM resource_attachments') ||
      sql.includes('DELETE FROM resource_metadata') ||
      sql.includes('DELETE FROM resource_transcripts') ||
      sql.includes('DELETE FROM resource_captions')
    ) {
      return { rowCount: 1 };
    }

    // 3. SELECT / QUERY operations
    if (sql.includes('SELECT 1 FROM public.lessons') || sql.includes('SELECT 1 FROM lessons')) {
      const code = params ? params[0] : '';
      const match = Array.from(mockLessons.values()).some((l: any) => l.code === code);
      return { rows: match ? [{ 1: 1 }] : [], rowCount: match ? 1 : 0 };
    }
    if (sql.includes('SELECT 1 FROM learning_resources')) {
      const code = params ? params[0] : '';
      const match = Array.from(mockResources.values()).some((r: any) => r.code === code);
      return { rows: match ? [{ 1: 1 }] : [], rowCount: match ? 1 : 0 };
    }
    if (sql.includes('SELECT * FROM public.lessons') || sql.includes('SELECT * FROM lessons')) {
      const id = params ? params[0] : '';
      const lesson = mockLessons.get(id);
      return { rows: lesson ? [lesson] : [], rowCount: lesson ? 1 : 0 };
    }
    if (
      sql.includes('SELECT * FROM public.lesson_versions') ||
      sql.includes('SELECT * FROM lesson_versions')
    ) {
      const id = params ? params[0] : '';
      const versions = Array.from(mockLessonVersions.values()).filter(
        (v: any) => v.lesson_id === id
      );
      return { rows: versions, rowCount: versions.length };
    }
    if (
      sql.includes('SELECT * FROM public.content_blocks') ||
      sql.includes('SELECT * FROM content_blocks')
    ) {
      const id = params ? params[0] : '';
      const blocks = Array.from(mockContentBlocks.values()).filter(
        (b: any) => b.lesson_version_id === id
      );
      return { rows: blocks, rowCount: blocks.length };
    }
    if (
      sql.includes('SELECT * FROM public.learning_resources') ||
      sql.includes('SELECT * FROM learning_resources')
    ) {
      const id = params ? params[0] : '';
      const resource = mockResources.get(id);
      if (resource) {
        return {
          rows: [
            {
              id: resource.id,
              code: resource.code,
              slug: resource.slug,
              canonical_title: resource.name || resource.canonical_title || 'Title',
              canonical_description:
                resource.description || resource.canonical_description || 'Desc',
              resource_type_id: resource.resource_type || 'type-1',
              primary_category_id: null,
              sensitivity: 'normal',
              visibility: 'authenticated',
              owner_organization_id: null,
              default_language_code: 'en',
              current_default_variant_id: null,
              status: resource.status || 'draft',
              lock_version: 0,
              name: resource.name,
              description: resource.description,
              resource_type: resource.resource_type,
              lesson_id: resource.lesson_id,
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }
    if (
      sql.includes('SELECT * FROM public.resource_versions') ||
      sql.includes('SELECT * FROM resource_versions') ||
      sql.includes('SELECT * FROM learning_resource_versions')
    ) {
      const filterVal = params ? params[0] : '';
      const versions = Array.from(mockResourceVersions.values()).filter((v: any) => {
        if (Array.isArray(filterVal)) {
          return (
            filterVal.includes(v.resource_variant_id) || filterVal.includes(v.learning_resource_id)
          );
        }
        return v.learning_resource_id === filterVal || v.resource_variant_id === filterVal;
      });
      const rows = versions.map((v: any) => ({
        id: v.id,
        resource_variant_id: v.resource_variant_id,
        version_no: v.version_no,
        status: v.status,
        title: v.title || v.name || 'Title',
        description: v.description,
        resource_format_id: v.resource_format_id || 'pdf',
        estimated_study_minutes: v.estimated_study_minutes || 0,
        lock_version: v.lock_version || 0,
      }));
      return { rows, rowCount: rows.length };
    }
    if (sql.includes('resource_version_objects') || sql.includes('storage_objects')) {
      const versionId = params ? params[0] : '';
      const rows: any[] = [];

      const rvos = Array.from(mockResourceVersionObjects.values()).filter(
        (r: any) => r.resource_version_id === versionId
      );
      for (const rvo of rvos) {
        const so = mockStorageObjects.get(rvo.storage_object_id);
        if (so) {
          rows.push({
            id: so.id,
            object_role: rvo.object_role,
            storage_provider: so.storage_provider,
            bucket_name: so.bucket_name,
            object_path: so.object_path,
            original_filename: so.original_filename,
            detected_mime_type: so.detected_mime_type,
            size_bytes: so.size_bytes,
            etag: so.etag,
          });
        }
      }
      return { rows, rowCount: rows.length };
    }
    if (
      sql.includes('SELECT * FROM public.resource_variants') ||
      sql.includes('SELECT * FROM resource_variants')
    ) {
      const lrId = params ? params[0] : '';
      const variants = Array.from(mockResourceVariants.values()).filter(
        (v: any) => v.learning_resource_id === lrId
      );
      return { rows: variants, rowCount: variants.length };
    }
    if (sql.includes('SELECT * FROM media_assets')) {
      const id = params ? params[0] : '';
      const media = Array.from(mockMediaAssets.values()).filter(
        (m: any) => m.resource_version_id === id
      );
      return { rows: media, rowCount: media.length };
    }
    if (sql.includes('SELECT * FROM resource_attachments')) {
      const id = params ? params[0] : '';
      const atts = Array.from(mockAttachments.values()).filter(
        (a: any) => a.resource_version_id === id
      );
      return { rows: atts, rowCount: atts.length };
    }
    if (sql.includes('SELECT * FROM resource_transcripts')) {
      const id = params ? params[0] : '';
      const ts = Array.from(mockTranscripts.values()).filter(
        (t: any) => t.resource_version_id === id
      );
      return { rows: ts, rowCount: ts.length };
    }
    if (sql.includes('SELECT * FROM resource_captions')) {
      const id = params ? params[0] : '';
      const cs = Array.from(mockCaptions.values()).filter((c: any) => c.resource_version_id === id);
      return { rows: cs, rowCount: cs.length };
    }
    if (
      sql.includes('SELECT md.namespace') ||
      sql.includes('resource_metadata m') ||
      sql.includes('SELECT * FROM resource_metadata')
    ) {
      const id = params ? params[0] : '';
      const rows: any[] = [];
      const mds = Array.from(mockMetadata.values()).filter(
        (m: any) => m.resource_version_id === id
      );
      for (const m of mds) {
        const def = mockMetadataDefinitions.get(m.metadata_definition_id);
        if (def) {
          rows.push({
            namespace: def.namespace,
            metadata_key: def.metadata_key,
            metadata_value_json: m.metadata_value_json,
          });
        }
      }
      return { rows, rowCount: rows.length };
    }
    if (
      sql.includes('SELECT id FROM lessons') ||
      sql.includes('SELECT DISTINCT lr.id FROM learning_resources lr')
    ) {
      return { rows: [], rowCount: 0 };
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

describe('REST API Controller Integration Tests for Lessons & Learning Resources', () => {
  beforeEach(() => {
    mockLessons.clear();
    mockLessonVersions.clear();
    mockContentBlocks.clear();
    mockResources.clear();
    mockResourceVersions.clear();
    mockMediaAssets.clear();
    mockAttachments.clear();
    mockMetadata.clear();
    mockTranscripts.clear();
    mockCaptions.clear();
    mockResourceVariants.clear();
    mockStorageObjects.clear();
    mockResourceVersionObjects.clear();
    mockMetadataDefinitions.clear();
  });

  test('Create Lesson via admin POST and retrieve it successfully', async () => {
    const postReq = new NextRequest('http://localhost/api/v1/admin/lessons', {
      method: 'POST',
      body: JSON.stringify({
        moduleId: 'b1000000-0000-0000-0000-000000000001',
        code: 'IELTS-LIS-L1',
        name: 'Intro to part 1',
        description: 'Test details',
        displayOrder: 1,
      }),
    });

    const postRes = await createLessonApi(postReq);
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.success).toBe(true);

    const lessonId = postBody.id;

    // Create a Version and add a Content Block via PATCH
    const patchReq = new NextRequest(`http://localhost/api/v1/admin/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'createVersion',
        versionNo: '1.0.0',
        name: 'V1.0',
        description: 'Initial',
      }),
    });
    const patchRes = await updateLessonApi(patchReq, { params: Promise.resolve({ id: lessonId }) });
    expect(patchRes.status).toBe(200);

    const blockReq = new NextRequest(`http://localhost/api/v1/admin/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'addContentBlock',
        versionNo: '1.0.0',
        blockId: 'cb-1',
        blockType: 'HEADING',
        textContent: '## Welcomes',
        displayOrder: 1,
      }),
    });
    const blockRes = await updateLessonApi(blockReq, { params: Promise.resolve({ id: lessonId }) });
    expect(blockRes.status).toBe(200);

    // Retrieve details
    const getReq = new NextRequest(`http://localhost/api/v1/lessons/${lessonId}`);
    const getRes = await getLessonApi(getReq, { params: Promise.resolve({ id: lessonId }) });
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.code).toBe('IELTS-LIS-L1');
    expect(getBody.versions.length).toBe(1);
    expect(getBody.versions[0].contentBlocks.length).toBe(1);
    expect(getBody.versions[0].contentBlocks[0].blockType).toBe('HEADING');
  });

  test('Create Resource, upload media, captions, transcript, and retrieve successfully', async () => {
    const postReq = new NextRequest('http://localhost/api/v1/admin/resources', {
      method: 'POST',
      body: JSON.stringify({
        lessonId: '10000000-0000-0000-0000-000000000001',
        code: 'IELTS-LIS-R1',
        resourceType: 'VIDEO',
        slug: 'listening-part-1-strategy',
        name: 'Strategy Video',
        description: 'Traps review',
        displayOrder: 1,
      }),
    });

    const postRes = await createResourceApi(postReq);
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.success).toBe(true);

    const resId = postBody.id;

    // Create a resource version via PATCH
    const patchReq = new NextRequest(`http://localhost/api/v1/admin/resources/${resId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'createVersion',
        versionNo: '1.0.0',
        name: 'V1.0',
        description: 'First version',
      }),
    });
    const patchRes = await updateResourceApi(patchReq, { params: Promise.resolve({ id: resId }) });
    expect(patchRes.status).toBe(200);

    // Upload Media asset metadata
    const uploadMediaReq = new NextRequest(
      `http://localhost/api/v1/admin/resources/${resId}/upload`,
      {
        method: 'POST',
        body: JSON.stringify({
          uploadType: 'media',
          versionNo: '1.0.0',
          provider: 'SUPABASE_STORAGE',
          bucket: 'resource-private',
          objectKey: 'videos/intro.mp4',
          mimeType: 'video/mp4',
          fileSize: 104857600,
          duration: 360,
        }),
      }
    );
    const uploadMediaRes = await uploadResourceApi(uploadMediaReq, {
      params: Promise.resolve({ id: resId }),
    });
    expect(uploadMediaRes.status).toBe(200);

    // Upload Transcript
    const transcriptReq = new NextRequest(
      `http://localhost/api/v1/admin/resources/${resId}/upload`,
      {
        method: 'POST',
        body: JSON.stringify({
          uploadType: 'transcript',
          versionNo: '1.0.0',
          transcriptText: 'Tutorial rules transcript',
          language: 'en',
        }),
      }
    );
    const transcriptRes = await uploadResourceApi(transcriptReq, {
      params: Promise.resolve({ id: resId }),
    });
    expect(transcriptRes.status).toBe(200);

    // Set Metadata
    const mdReq = new NextRequest(`http://localhost/api/v1/admin/resources/${resId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: 'setMetadata',
        versionNo: '1.0.0',
        key: 'difficulty',
        value: 'BEGINNER',
      }),
    });
    const mdRes = await updateResourceApi(mdReq, { params: Promise.resolve({ id: resId }) });
    expect(mdRes.status).toBe(200);

    // Retrieve resource details
    const getReq = new NextRequest(`http://localhost/api/v1/resources/${resId}`);
    const getRes = await getResourceApi(getReq, { params: Promise.resolve({ id: resId }) });
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.code).toBe('IELTS-LIS-R1');
    expect(getBody.versions.length).toBe(1);
    expect(getBody.versions[0].mediaAsset.objectKey).toBe('videos/intro.mp4');
    expect(getBody.versions[0].transcripts.length).toBe(1);
    expect(getBody.versions[0].metadata.difficulty).toBe('BEGINNER');
  });
});
