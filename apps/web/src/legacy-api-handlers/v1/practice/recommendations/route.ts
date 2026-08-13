export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 0. Query candidate's assigned target_programme
    const profileRes = await pool.query(
      `SELECT COALESCE(spe.programme_id::text, p.target_programme, au.raw_user_meta_data->>'programme', 'English Proficiency') as programme
       FROM auth.users au
       LEFT JOIN public.profiles p ON p.user_id = au.id
       LEFT JOIN public.student_programme_enrollments spe ON spe.student_id = au.id
       WHERE au.id = $1`,
      [studentId]
    );
    const candidateProgramme = profileRes.rows[0]?.programme || 'English Proficiency';

    // 1. Query candidate's completed diagnostic placement results and section scores
    const diagRes = await pool.query(
      `SELECT pr.placement_stage, pr.confidence_percentage, dss.section_code, dss.section_name, dss.score_percentage
       FROM public.placement_results pr
       LEFT JOIN public.diagnostic_section_scores dss ON dss.assessment_session_id = pr.assessment_session_id OR dss.assessment_session_id = pr.attempt_id
       WHERE pr.student_id = $1
       ORDER BY pr.created_at DESC`,
      [studentId]
    );

    // 2. Query student skill profiles as secondary signal
    const skillRes = await pool.query(
      `SELECT skill_code, mastery_percentage, computed_stage FROM public.student_skill_profiles WHERE student_id = $1`,
      [studentId]
    );

    const sectionScores = diagRes.rows
      .filter((r) => r.section_code && r.score_percentage !== null)
      .map((r) => ({
        skill: r.section_name || r.section_code,
        score: parseFloat(r.score_percentage),
        source: 'DIAGNOSTIC_BASELINE',
      }));

    if (sectionScores.length === 0 && skillRes.rows.length > 0) {
      skillRes.rows.forEach((r) => {
        sectionScores.push({
          skill: r.skill_code,
          score: parseFloat(r.mastery_percentage),
          source: 'PRACTICE_PROFILE',
        });
      });
    }

    // Default baseline if student has not taken Diagnostic yet
    if (sectionScores.length === 0) {
      sectionScores.push(
        { skill: 'Grammar & Structure', score: 45, source: 'DEFAULT_BASELINE' },
        { skill: 'Writing Expression', score: 52, source: 'DEFAULT_BASELINE' },
        { skill: 'Reading Comprehension', score: 68, source: 'DEFAULT_BASELINE' }
      );
    }

    // Sort by lowest accuracy score to recommend target practice areas
    const sorted = [...sectionScores].sort((a, b) => a.score - b.score);
    const prioritySkill = sorted[0];
    const secondarySkill = sorted[1] || sorted[0];

    const recommendations = [
      {
        id: 'rec-p1',
        title: `Targeted Practice: ${prioritySkill.skill}`,
        skill: prioritySkill.skill,
        priority: 'CRITICAL',
        currentAccuracy: prioritySkill.score,
        status: prioritySkill.score < 50 ? 'NEEDS_IMPROVEMENT' : 'DEVELOPING',
        reasoning: `Based on your Diagnostic Baseline (${prioritySkill.score}%), targeted practice in ${prioritySkill.skill} is recommended to build foundational accuracy.`,
        suggestedExam: candidateProgramme,
        suggestedSection: prioritySkill.skill.includes('Grammar') ? 'Grammar' : prioritySkill.skill,
      },
      {
        id: 'rec-p2',
        title: `Reinforcement Practice: ${secondarySkill.skill}`,
        skill: secondarySkill.skill,
        priority: 'HIGH',
        currentAccuracy: secondarySkill.score,
        status: secondarySkill.score < 65 ? 'DEVELOPING' : 'MASTERED',
        reasoning: `Your score of ${secondarySkill.score}% in ${secondarySkill.skill} indicates opportunity for rapid score improvement with deliberate practice.`,
        suggestedExam: candidateProgramme,
        suggestedSection: secondarySkill.skill.includes('Writing')
          ? 'Writing'
          : secondarySkill.skill,
      },
    ];

    return NextResponse.json({
      success: true,
      diagnosticPlacementStage: diagRes.rows[0]?.placement_stage || 'FOUNDATION',
      recommendations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
