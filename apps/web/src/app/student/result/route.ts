export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /student/result
 * Redirect handler for singular /student/result -> plural /student/results
 * Preserves query parameters (attemptId, sessionId) and prevents 404 Portal Error.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  const targetPath = searchParams ? `/student/results?${searchParams}` : '/student/results';
  return NextResponse.redirect(new URL(targetPath, req.url), 307);
}
