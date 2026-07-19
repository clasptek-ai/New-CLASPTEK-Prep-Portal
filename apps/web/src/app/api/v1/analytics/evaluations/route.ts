import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    // Evaluation trends and overrides details
    return NextResponse.json({
      measuredDate: new Date().toISOString().split('T')[0],
      agreementRate: 88.50,
      humanOverrideRate: 4.20,
      totalEvals: 840
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
