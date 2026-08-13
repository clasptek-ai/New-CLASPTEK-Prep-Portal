export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const progressData = [
    {
      skill: 'Matching Headings',
      exam: 'IELTS Academic',
      section: 'Reading',
      accuracy: 42,
      attemptedCount: 35,
      averageTimeSeconds: 85,
      status: 'NEEDS_IMPROVEMENT',
    },
    {
      skill: 'Integrated Writing',
      exam: 'TOEFL iBT',
      section: 'Writing',
      accuracy: 68,
      attemptedCount: 20,
      averageTimeSeconds: 420,
      status: 'DEVELOPING',
    },
    {
      skill: 'Quadratic Equations',
      exam: 'SAT',
      section: 'Math',
      accuracy: 88,
      attemptedCount: 45,
      averageTimeSeconds: 52,
      status: 'MASTERED',
    },
    {
      skill: 'True / False / Not Given',
      exam: 'IELTS Academic',
      section: 'Reading',
      accuracy: 75,
      attemptedCount: 50,
      averageTimeSeconds: 60,
      status: 'DEVELOPING',
    },
  ];

  return NextResponse.json({ success: true, data: progressData }, { status: 200 });
}
