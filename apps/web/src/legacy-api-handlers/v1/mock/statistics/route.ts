export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') ?? 'demo-student';

    return NextResponse.json({
      success: true,
      statistics: {
        studentId,
        totalMocksTaken: 3,
        averageScore: 82.5,
        highestScore: 88.0,
        improvementVelocity: 5.2,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
