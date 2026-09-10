export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiRouter } from '@/lib/api-router-registry';

async function handle(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const params = await context.params;
  const slug = params.slug || [];
  const res = await apiRouter.dispatch(req, slug);
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
