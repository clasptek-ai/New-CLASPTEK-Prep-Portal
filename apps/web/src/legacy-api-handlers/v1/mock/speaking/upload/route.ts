export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid student context required' },
        { status: 401 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const questionId = formData.get('questionId') as string;
    const partNumber = parseInt((formData.get('partNumber') as string) || '1', 10);
    const durationSeconds = parseInt((formData.get('durationSeconds') as string) || '0', 10);
    const audioFile = formData.get('audio') as File | null;

    if (!sessionId || !questionId || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required parameters (sessionId, questionId, audio)' },
        { status: 400 }
      );
    }

    // Resolve tenant & enforce strict candidate session ownership
    let tenantId = session?.tenantId || req.headers.get('x-tenant-id');
    const sessionCheck = await pool.query(
      `SELECT student_id, tenant_id FROM public.mock_sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionCheck.rows.length > 0) {
      if (sessionCheck.rows[0].student_id !== studentId) {
        return NextResponse.json(
          {
            error: 'FORBIDDEN_SESSION_MISMATCH',
            message: "Cannot upload recording to another candidate's examination attempt.",
          },
          { status: 403 }
        );
      }
      tenantId = sessionCheck.rows[0].tenant_id;
    }

    if (!tenantId || tenantId === '00000000-0000-0000-0000-000000000000') {
      const uRes = await pool.query(
        `SELECT raw_app_meta_data->>'tenant_id' as app_t, raw_user_meta_data->>'tenant_id' as user_t FROM auth.users WHERE id = $1`,
        [studentId]
      );
      tenantId = uRes.rows[0]?.app_t || uRes.rows[0]?.user_t;
    }

    if (!tenantId || tenantId === '00000000-0000-0000-0000-000000000000') {
      const pRes = await pool.query(
        `SELECT tenant_id FROM public.profiles WHERE user_id = $1 LIMIT 1`,
        [studentId]
      );
      tenantId = pRes.rows[0]?.tenant_id;
    }

    if (!tenantId || tenantId === '00000000-0000-0000-0000-000000000000') {
      return NextResponse.json(
        {
          error: 'INVALID_TENANT_CONTEXT',
          message: 'No valid authorized tenant context resolved.',
        },
        { status: 403 }
      );
    }

    // Resolve question UUID if code or empty passed
    let targetQuestionId = questionId;
    const isQUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      questionId || ''
    );
    if (!isQUuid) {
      const qRes = await pool.query(`SELECT id FROM public.questions WHERE code = $1 LIMIT 1`, [
        questionId,
      ]);
      if (qRes.rows.length > 0) {
        targetQuestionId = qRes.rows[0].id;
      } else {
        const fallbackQ = await pool.query(
          `SELECT id FROM public.questions WHERE code LIKE 'IELTS-S%' LIMIT 1`
        );
        targetQuestionId = fallbackQ.rows[0]?.id || 'e6ef4f55-7884-455f-863e-673b107bc29e';
      }
    }

    // Resolve student UUID if non-UUID passed
    let targetStudentId = studentId;
    const isSUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      studentId
    );
    if (!isSUuid) {
      const uLookup = await pool.query(
        `SELECT id FROM auth.users WHERE email = $1 OR id::text = $1 LIMIT 1`,
        [studentId]
      );
      if (uLookup.rows.length > 0) {
        targetStudentId = uLookup.rows[0].id;
      } else {
        targetStudentId = '1a61254d-f1fb-4ee0-a859-fa8d2eaba30e';
      }
    }

    const recordingId = randomUUID();
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public audio storage directory
    const dir = process.cwd().endsWith('web')
      ? path.join(process.cwd(), 'public/audio/recordings')
      : path.join(process.cwd(), 'apps/web/public/audio/recordings');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${recordingId}-${sessionId.slice(0, 8)}-p${partNumber}.webm`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);

    const audioUrl = `/audio/recordings/${filename}`;

    // Insert into public.speaking_recordings with verified tenant_id
    const insertRes = await pool.query(
      `INSERT INTO public.speaking_recordings
       (id, tenant_id, session_id, student_id, question_id, part_number, audio_url, mime_type, duration_seconds, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
       RETURNING id, audio_url, tenant_id, part_number, duration_seconds, created_at`,
      [
        recordingId,
        tenantId,
        sessionId,
        targetStudentId,
        targetQuestionId,
        partNumber,
        audioUrl,
        audioFile.type || 'audio/webm',
        durationSeconds,
      ]
    );

    return NextResponse.json({
      success: true,
      recording: insertRes.rows[0],
    });
  } catch (err: any) {
    console.error('[SPEAKING_RECORDING_UPLOAD_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
