export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { BulkImportEngine } from '@clasptek/application-question-bank';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileType, rawContent } = body;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'rawContent is required for bulk import' },
        { status: 400 }
      );
    }

    const engine = new BulkImportEngine();
    const report = engine.parseAndValidate(fileType || 'json', rawContent);

    return NextResponse.json(report, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
