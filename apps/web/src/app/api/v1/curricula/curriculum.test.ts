/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables before config module loads
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { getCurriculumContext } from '@/lib/curriculum-context';
import { POST as createCurriculumApi } from '../admin/curricula/route';
import { PATCH as updateCurriculumApi } from '../admin/curricula/[id]/route';
import { POST as reviewCurriculumApi } from '../admin/curricula/[id]/review/route';
import { POST as approveCurriculumApi } from '../admin/curricula/[id]/approve/route';
import { POST as publishCurriculumApi } from '../admin/curricula/[id]/publish/route';
import { POST as archiveCurriculumApi } from '../admin/curricula/[id]/archive/route';
import { POST as restoreCurriculumApi } from '../admin/curricula/[id]/restore/route';
import { GET as searchCurriculaApi } from './route';
import { GET as getCurriculumApi } from './[id]/route';

const mockCurricula = new Map<string, any>();
const mockCurriculumVersions = new Map<string, any>();
const mockProgrammes = new Map<string, any>();
const mockProgrammeVersions = new Map<string, any>();
const mockCourses = new Map<string, any>();

// Mock pg module queries
vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    // 1. INSERT operations
    if (sql.includes('INSERT INTO curricula')) {
      if (params) {
        const id = params[0];
        const code = params[1];
        const slug = params[2];
        const name = params[3];
        const description = params[4];
        const status = params[5];
        const current_version_id = params[6];
        const current_version_no = params[7];
        mockCurricula.set(id, {
          id,
          code,
          slug,
          name,
          description,
          status,
          current_version_id,
          current_version_no,
          lock_version: 0,
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO curriculum_versions')) {
      if (params) {
        const id = params[0];
        const curriculum_id = params[1];
        const version_no = params[2];
        const status = params[3];
        const name = params[4];
        const description = params[5];
        mockCurriculumVersions.set(id, {
          id,
          curriculum_id,
          version_no,
          status,
          name,
          description,
          lock_version: 0,
        });
      }
      return { rowCount: 1 };
    }

    // 2. UPDATE operations
    if (sql.includes('UPDATE curricula')) {
      if (params) {
        const name = params[0];
        const description = params[1];
        const status = params[2];
        const current_version_id = params[3];
        const current_version_no = params[4];
        const id = params[5];

        const current = mockCurricula.get(id);
        if (current) {
          current.name = name;
          current.description = description;
          current.status = status;
          current.current_version_id = current_version_id;
          current.current_version_no = current_version_no;
          current.lock_version += 1;
        }
      }
      return { rowCount: 1 };
    }
    if (sql.includes('UPDATE curriculum_versions')) {
      if (params) {
        const status = params[0];
        const name = params[1];
        const description = params[2];
        const id = params[8];
        const current = mockCurriculumVersions.get(id);
        if (current) {
          current.status = status;
          current.name = name;
          current.description = description;
        }
      }
      return { rowCount: 1 };
    }

    // 3. SELECT operations
    if (sql.includes('SELECT') && sql.includes('FROM curricula')) {
      if (sql.includes('code = $1')) {
        const code = params?.[0];
        const found = Array.from(mockCurricula.values()).find((c) => c.code === code);
        return { rows: found ? [found] : [] };
      }
      if (sql.includes('id = $1')) {
        const id = params?.[0];
        const found = mockCurricula.get(id);
        return { rows: found ? [found] : [] };
      }
      return { rows: Array.from(mockCurricula.values()) };
    }

    if (sql.includes('SELECT') && sql.includes('FROM curriculum_versions')) {
      const curriculumId = params?.[0];
      const found = Array.from(mockCurriculumVersions.values()).filter(
        (v) => v.curriculum_id === curriculumId
      );
      return { rows: found };
    }

    if (sql.includes('SELECT') && sql.includes('FROM curriculum_programme_version_mappings')) {
      return { rows: [] };
    }
    if (sql.includes('SELECT') && sql.includes('FROM curriculum_prerequisites')) {
      return { rows: [] };
    }
    if (sql.includes('SELECT') && sql.includes('FROM curriculum_metadata')) {
      return { rows: [] };
    }

    return { rows: [] };
  });

  return {
    Pool: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue({
        query: queryMock,
        release: vi.fn(),
      }),
      query: queryMock,
      on: vi.fn(),
    })),
  };
});

describe('Curriculum & Programme REST APIs Integration Tests', () => {
  beforeEach(() => {
    mockCurricula.clear();
    mockCurriculumVersions.clear();
    mockProgrammes.clear();
    mockProgrammeVersions.clear();
    mockCourses.clear();
  });

  test('Create Curriculum admin POST route successfully', async () => {
    const req = new NextRequest('http://localhost/api/v1/admin/curricula', {
      method: 'POST',
      body: JSON.stringify({
        code: 'IELTS-AC-PREP-CURRIC',
        name: 'IELTS Academic Master Curriculum',
        description: 'Standard master curriculum',
      }),
    });

    const res = await createCurriculumApi(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockCurricula.size).toBe(1);
  });

  test('Search and Get Curriculum by ID successfully', async () => {
    // Manually inject a mock curriculum
    const cId = 'mock-cur-123';
    mockCurricula.set(cId, {
      id: cId,
      code: 'IELTS-AC-PREP-CURRIC',
      slug: 'ielts-ac-prep-curric',
      name: 'IELTS Academic Master Curriculum',
      description: 'Standard master curriculum',
      status: 'PUBLISHED',
      current_version_id: 'mock-ver-123',
      current_version_no: '1.0.0',
      lock_version: 0,
    });
    mockCurriculumVersions.set('mock-ver-123', {
      id: 'mock-ver-123',
      curriculum_id: cId,
      version_no: '1.0.0',
      status: 'PUBLISHED',
      name: 'V1 Release',
    });

    const reqSearch = new NextRequest('http://localhost/api/v1/curricula?status=PUBLISHED');
    const resSearch = await searchCurriculaApi(reqSearch);
    expect(resSearch.status).toBe(200);
    const searchBody = await resSearch.json();
    expect(searchBody.length).toBe(1);

    const resGet = await getCurriculumApi(
      new NextRequest('http://localhost/api/v1/curricula/' + cId),
      {
        params: Promise.resolve({ id: cId }),
      }
    );
    expect(resGet.status).toBe(200);
    const detailBody = await resGet.json();
    expect(detailBody.code).toBe('IELTS-AC-PREP-CURRIC');
    expect(detailBody.versions.length).toBe(1);
  });
});
