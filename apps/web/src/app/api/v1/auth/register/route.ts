export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { registerAuthPreferencesHandler, identitySynchronizer, logger } = await getAuthContext();
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, provider } = body;

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json(
        { code: 'AUTH_ERROR', message: 'User registration failed' },
        { status: 400 }
      );
    }

    // 2. Guarantee Domain User Aggregate and Security Profile exist atomically
    const { ensureUserAggregateExistsService } = await getAuthContext();
    await ensureUserAggregateExistsService.execute({
      userId: data.user.id,
      email: data.user.email || email,
      firstName,
      lastName,
      provider: provider || 'LOCAL',
    });

    return NextResponse.json({ success: true, userId: data.user.id }, { status: 201 });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/auth/register failure',
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
