export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      message:
        'All demo datasets, mock history, and local storage states reset to default initial state.',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      message: 'Demo data reset endpoint active.',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
