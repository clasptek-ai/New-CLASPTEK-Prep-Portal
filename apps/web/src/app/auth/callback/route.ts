export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl, loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';

/**
 * Auth Callback Route Handler
 * Exchanging Supabase PKCE recovery / OAuth code for session cookies
 */
export async function GET(req: NextRequest) {
  const appUrl = getAppUrl(process.env);
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next') || '/reset-password';

  // Open Redirect Security Check: Ensure next is a relative path starting with a single '/'
  const isRelativePath =
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/\\') &&
    !rawNext.includes(':');

  const safeNext = isRelativePath ? rawNext : '/reset-password';

  if (code) {
    try {
      const config = loadEnvironment(process.env);
      const cookieStore = await cookies();
      const supabase = createSupabaseServerClient(
        config.NEXT_PUBLIC_SUPABASE_URL,
        config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore if response headers are already sent
            }
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${appUrl}${safeNext}`);
      }
    } catch {
      // Exchange error handling
    }
  }

  // Token expired, missing, or invalid
  return NextResponse.redirect(`${appUrl}/reset-password?error=invalid_token`);
}
