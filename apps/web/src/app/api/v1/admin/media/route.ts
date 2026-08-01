export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(`
      SELECT id, title, type, url, exam_type, tags, size_bytes, created_at
      FROM public.media_assets
      ORDER BY created_at DESC
    `);

    const media = res.rows.map((row) => {
      const bytes = Number(row.size_bytes || 0);
      const sizeMb = bytes > 0 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB';

      return {
        id: row.id,
        title: row.title,
        type: row.type || 'AUDIO',
        url: row.url,
        examType: row.exam_type || 'English Proficiency',
        tags: row.tags || [],
        sizeMb,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({ success: true, data: media });
  } catch (err: any) {
    console.error('GET /api/v1/admin/media error:', err);
    return NextResponse.json({ success: false, data: [] });
  }
}
