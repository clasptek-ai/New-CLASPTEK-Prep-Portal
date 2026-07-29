export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const history = [
    {
      id: 'ps-101',
      date: '2026-07-28T14:20:00Z',
      exam: 'IELTS Academic',
      section: 'Reading',
      skill: 'Matching Headings',
      score: '8 / 10',
      percentage: 80,
      bandScore: 'Band 7.5',
      timeSpentSeconds: 650,
      accuracy: 80,
    },
    {
      id: 'ps-102',
      date: '2026-07-25T11:00:00Z',
      exam: 'TOEFL iBT',
      section: 'Writing',
      skill: 'Integrated Task',
      score: '15 / 20',
      percentage: 75,
      bandScore: '105 / 120',
      timeSpentSeconds: 1200,
      accuracy: 75,
    },
    {
      id: 'ps-103',
      date: '2026-07-20T09:45:00Z',
      exam: 'SAT',
      section: 'Math',
      skill: 'Quadratic Equations',
      score: '9 / 10',
      percentage: 90,
      bandScore: '1450 / 1600',
      timeSpentSeconds: 510,
      accuracy: 90,
    },
  ];

  return NextResponse.json({ success: true, data: history }, { status: 200 });
}
