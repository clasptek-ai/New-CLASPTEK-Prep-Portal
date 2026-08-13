export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(_req: NextRequest) {
  const { sessionRepo, logger } = await getAuthContext();
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
            // Handled if cookies are immutable
          }
        },
      }
    );

    // Retrieve active session token before signing out
    const sessionToken = cookieStore.get('sb-access-token')?.value;

    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    // Revoke corresponding db security session record if token is found
    if (sessionToken) {
      const activeSession = await sessionRepo.findBySupabaseSessionId(
        sessionToken.substring(0, 100)
      );
      if (activeSession) {
        activeSession.revoke();
        await sessionRepo.save(activeSession);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/auth/logout failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
