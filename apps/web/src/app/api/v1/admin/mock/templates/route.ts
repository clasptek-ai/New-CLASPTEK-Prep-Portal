export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const templates = [
    {
      id: 'tmpl-ielts-acad',
      code: 'TMPL-IELTS-ACAD-01',
      blueprintId: 'bp-ielts-acad',
      exam: 'IELTS Academic',
      title: 'IELTS Academic Official Mock Exam Set 1',
      version: 'v4.2',
      totalQuestions: 40,
      totalDurationMinutes: 165,
      createdAt: '2026-06-10T10:00:00Z',
    },
    {
      id: 'tmpl-toefl-ibt',
      code: 'TMPL-TOEFL-IBT-01',
      blueprintId: 'bp-toefl-ibt',
      exam: 'TOEFL iBT',
      title: 'TOEFL iBT Full Test Simulation Set 1',
      version: 'v3.0',
      totalQuestions: 35,
      totalDurationMinutes: 116,
      createdAt: '2026-06-15T12:00:00Z',
    },
    {
      id: 'tmpl-sat-digital',
      code: 'TMPL-SAT-DIG-01',
      blueprintId: 'bp-sat-digital',
      exam: 'SAT',
      title: 'SAT Digital Test Set 1',
      version: 'v2.1',
      totalQuestions: 49,
      totalDurationMinutes: 134,
      createdAt: '2026-06-20T09:00:00Z',
    },
  ];

  return NextResponse.json({ success: true, data: templates }, { status: 200 });
}
