export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examType: string }> }
) {
  try {
    const { examType: rawExamType } = await params;
    const examType = decodeURIComponent(rawExamType);

    const { canonicalAssessmentRepo, dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Query canonical definition
    const def = await canonicalAssessmentRepo.getDefinitionByExamType(examType, 'DIAGNOSTIC');
    
    // 2. Query canonical sections
    let sections = await canonicalAssessmentRepo.getSectionsByExamType(examType);

    if (sections.length === 0) {
      if (examType === 'English Proficiency') {
        sections = [
          { id: 'sec-g', code: 'ENG-PROF-GRAMMAR', examType, name: 'Grammar & Structure', displayOrder: 1, timeLimitMinutes: 10, instructions: 'Answer all grammar questions.' },
          { id: 'sec-r', code: 'ENG-PROF-READING', examType, name: 'Reading Comprehension', displayOrder: 2, timeLimitMinutes: 10, instructions: 'Read passage and answer.' },
          { id: 'sec-w', code: 'ENG-PROF-WRITING', examType, name: 'Writing Expression', displayOrder: 3, timeLimitMinutes: 10, instructions: 'Compose written essay.' },
          { id: 'sec-l', code: 'ENG-PROF-LISTENING', examType, name: 'Listening Comprehension', displayOrder: 4, timeLimitMinutes: 10, instructions: 'Listen to track and answer.' },
          { id: 'sec-s', code: 'ENG-PROF-SPEAKING', examType, name: 'Speaking & Oral Delivery', displayOrder: 5, timeLimitMinutes: 10, instructions: 'Record cue card response.' },
        ];
      } else {
        sections = [
          { id: 'sec-gen', code: `${examType.toUpperCase().replace(/\s+/g, '-')}-READINESS`, examType, name: `${examType} Readiness Section`, displayOrder: 1, timeLimitMinutes: 30, instructions: 'Answer readiness assessment items.' },
        ];
      }
    }

    // 3. Query DB content entities for real persisted stimulus assets
    const [passagesRes, audioRes, writingRes, speakingRes] = await Promise.all([
      pool.query('SELECT * FROM public.reading_passages WHERE exam_type = $1 LIMIT 1', [examType]).catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM public.listening_tracks WHERE exam_type = $1 LIMIT 1', [examType]).catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM public.writing_tasks WHERE exam_type = $1 LIMIT 1', [examType]).catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM public.speaking_tasks WHERE exam_type = $1 LIMIT 1', [examType]).catch(() => ({ rows: [] })),
    ]);

    const readingPassage = passagesRes.rows[0] || null;
    const listeningTrack = audioRes.rows[0] || null;
    const writingTask = writingRes.rows[0] || null;
    const speakingTask = speakingRes.rows[0] || null;

    // 4. Query placement rules if definition exists
    const placementRules = def ? await canonicalAssessmentRepo.getPlacementRules(def.id) : [];
    const totalDurationMinutes = sections.reduce((acc: number, s: any) => acc + (s.timeLimitMinutes || 0), 0);
    const skillsEvaluated = sections.map((s: any) => s.name);

    return NextResponse.json({
      success: true,
      definition: {
        id: def?.id || `def-${examType}`,
        code: def?.code || `DIAG-${examType}`,
        examType,
        title: def?.title || `${examType} Diagnostic Assessment`,
        assessmentType: 'DIAGNOSTIC',
        durationMinutes: totalDurationMinutes || 30,
        skillsEvaluated,
      },
      contentAssets: {
        readingPassage: readingPassage ? { id: readingPassage.id, title: readingPassage.title, content: readingPassage.content } : null,
        listeningTrack: listeningTrack ? { id: listeningTrack.id, title: listeningTrack.title, url: listeningTrack.url } : null,
        writingTask: writingTask ? { id: writingTask.id, prompt: writingTask.prompt, instructions: writingTask.instructions } : null,
        speakingTask: speakingTask ? { id: speakingTask.id, prompt: speakingTask.prompt } : null,
      },
      sections: sections.map((s: any) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        displayOrder: s.displayOrder,
        timeLimitMinutes: s.timeLimitMinutes,
        instructions: s.instructions,
      })),
      placementRules: placementRules.map((r: any) => ({
        placementLevel: r.placementLevel,
        minOverallScore: r.minOverallScore,
        maxOverallScore: r.maxOverallScore,
        requiredSkillMinimums: r.requiredSkillMinimums,
        priority: r.priority,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
