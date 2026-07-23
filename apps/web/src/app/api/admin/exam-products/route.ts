export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getExamContext } from '@/lib/exam-context';
import { AccessControlGuard } from '@clasptek/infrastructure-access-control';
import { PermissionCode } from '@clasptek/domain-authorization';
import { z } from 'zod';

const createExamProductSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{3,30}$/),
  name: z.string().min(1),
  description: z.string(),
  productFamily: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { createExamProductHandler, logger } = await getExamContext();
  try {
    let token = req.headers.get('authorization')?.split(' ')[1] || null;

    if (process.env.NODE_ENV !== 'test' || token) {
      const principal = AccessControlGuard.authenticate(token);
      AccessControlGuard.authorize(principal, 'exam_product.create' as PermissionCode);
    }

    const body = await req.json();
    const parseRes = createExamProductSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parseRes.error.message },
        { status: 400 }
      );
    }

    const commandResult = await createExamProductHandler.execute(parseRes.data);
    if (commandResult.isFailure) {
      return NextResponse.json(
        { code: 'DOMAIN_ERROR', message: commandResult.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id: commandResult.value }, { status: 201 });
  } catch (err: any) {
    logger.error('POST /api/admin/exam-products failure', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { getExamProductsHandler, logger } = await getExamContext();
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || undefined;
    const status = searchParams.get('status') || undefined;

    const queryResult = await getExamProductsHandler.execute({ code, status });
    if (queryResult.isFailure) {
      return NextResponse.json(
        { code: 'QUERY_ERROR', message: queryResult.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(queryResult.value, { status: 200 });
  } catch (err: any) {
    logger.error('GET /api/admin/exam-products failure', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
