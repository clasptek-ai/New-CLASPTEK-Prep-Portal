export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const recommendations = [
    {
      id: 'rec-01',
      type: 'PRACTICE',
      title: 'Target Practice: Matching Headings',
      targetSkill: 'Matching Headings',
      priority: 'HIGH',
      actionUrl: '/practice?skill=Matching+Headings',
      description: 'Your accuracy in this skill is 42%. Completing 15 items will boost confidence.',
    },
    {
      id: 'rec-02',
      type: 'MOCK',
      title: 'Official IELTS Academic Full Mock Set 2',
      targetSkill: 'All Sections',
      priority: 'HIGH',
      actionUrl: '/student/mock',
      description: 'Simulate official exam conditions to test your readiness projection.',
    },
  ];

  return NextResponse.json({ success: true, data: recommendations }, { status: 200 });
}
