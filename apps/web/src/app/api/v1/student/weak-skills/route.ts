export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const weakSkills = [
    {
      skill: 'Matching Headings',
      exam: 'IELTS Academic',
      section: 'Reading',
      accuracy: 42,
      recommendation: 'Complete 15 target practice questions in Academic Reading.',
    },
    {
      skill: 'Integrated Writing Synthesis',
      exam: 'TOEFL iBT',
      section: 'Writing',
      accuracy: 48,
      recommendation: 'Focus on connecting lecture counter-arguments with reading passages.',
    },
  ];

  return NextResponse.json({ success: true, data: weakSkills }, { status: 200 });
}
