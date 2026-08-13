export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { AdminAcademicService } from '@clasptek/application-question-bank';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, currentStage } = body;

    const service = new AdminAcademicService();
    const res = await service.unlockPractice(studentId, currentStage || 'DIAGNOSTIC_RESULTS');

    return NextResponse.json(res, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
