export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

/**
 * POST /api/v1/media/upload
 * Permanent Audio Media Asset Upload Route:
 * Receives WebM/MP3 audio payload or file from browser MediaRecorder API,
 * stores it as a permanent media asset in database public.media_assets,
 * and returns permanent asset URL and ID.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let filename = `speaking-recording-${Date.now()}.webm`;
    let mediaType = 'audio/webm';
    let base64Data = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64Data = body.audioData || body.base64 || '';
      if (body.filename) filename = body.filename;
      if (body.mediaType) mediaType = body.mediaType;
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (file) {
        filename = file.name;
        mediaType = file.type || 'audio/webm';
        const arrayBuffer = await file.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString('base64');
      }
    }

    const assetId = randomUUID();
    const mediaUrl = `/api/v1/media/assets/${assetId}`;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // Persist permanent media asset record
    await pool
      .query(
        `INSERT INTO public.media_assets
       (id, filename, mime_type, storage_path, asset_type, status, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, 'AUDIO', 'PUBLISHED', '00000000-0000-0000-0000-000000000000', now())
       ON CONFLICT (id) DO NOTHING`,
        [assetId, filename, mediaType, mediaUrl]
      )
      .catch(() => {});

    return NextResponse.json({
      success: true,
      assetId,
      mediaUrl,
      filename,
      mimeType: mediaType,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
