export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { ProgrammeRegistry } from '@/features/dashboard/models/programme-registry';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');

    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // Query candidate profile, enrolled programme, and target score from primary enrollment source
    const res = await pool.query(
      `SELECT 
         spe.programme_id as enrollment_programme_id,
         p.target_programme as profile_programme,
         au.raw_user_meta_data->>'programme' as meta_programme,
         COALESCE(spe.target_score::text, au.raw_user_meta_data->>'target_score', au.raw_user_meta_data->>'targetScore', 'Band 7.5+') as target_score
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id OR p.id = au.id
       LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id AND spe.enrollment_status = 'ACTIVE'
       WHERE au.id = $1
       ORDER BY spe.enrolled_at DESC NULLS LAST LIMIT 1`,
      [studentId]
    );

    const row = res.rows[0] || {};
    const rawProgramme = row.enrollment_programme_id || row.profile_programme || row.meta_programme || 'IELTS Academic Prep';
    const programmeConfig = ProgrammeRegistry.get(rawProgramme);

    const skills = programmeConfig.skills.map((s) => s.name);

    return NextResponse.json({
      success: true,
      studentId,
      programmeId: programmeConfig.id,
      programmeTitle: programmeConfig.title,
      examType: programmeConfig.id,
      targetScore: row.target_score || programmeConfig.badge,
      skills,
    });
  } catch (err: any) {
    console.error('GET /api/v1/student/active-programme error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

