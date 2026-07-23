export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { AdminAcademicService } from '@clasptek/application-question-bank';

export async function GET() {
  const service = new AdminAcademicService();
  const kpis = await service.getDashboardKPIs();
  return NextResponse.json(kpis);
}
