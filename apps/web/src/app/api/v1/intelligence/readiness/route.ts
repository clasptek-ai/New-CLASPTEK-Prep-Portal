export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const readiness = {
    projectedScore: 'Band 7.0',
    confidenceLevelPercent: 87,
    examReadinessPercent: 82,
    estimatedDaysRemaining: 43,
    probabilityOfAchievingTargetPercent: 84,
    riskLevel: 'LOW',
    topRecommendations: [
      'Complete 2 target practice sets in Matching Headings (Reading)',
      'Review Integrated Writing structure for Task 2',
      'Take full timed Mock Examination this weekend',
    ],
  };

  return NextResponse.json({ success: true, data: readiness }, { status: 200 });
}
