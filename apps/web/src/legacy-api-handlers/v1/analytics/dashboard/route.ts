export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLearningAnalyticsContext } from '@/lib/learning-analytics-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'STUDENT';
    const id = searchParams.get('id') || 'user-1';

    const ctx = await getLearningAnalyticsContext();

    if (role === 'INSTRUCTOR') {
      const dash = await ctx.getInstructorDashboard.execute(id);
      return NextResponse.json({ success: true, data: dash });
    } else if (role === 'ADMIN') {
      const dash = await ctx.getAdminDashboard.execute(id);
      return NextResponse.json({ success: true, data: dash });
    }

    const dash = await ctx.getStudentDashboard.execute(id, id);
    return NextResponse.json({ success: true, data: dash });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
