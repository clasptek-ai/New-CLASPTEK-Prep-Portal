export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiRouter } from '@/lib/api-router-registry';

async function handle(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const params = await context.params;
  const slug = params.slug || [];
  return apiRouter.dispatch(req, slug);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
