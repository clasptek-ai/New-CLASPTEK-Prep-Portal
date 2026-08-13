export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { logger } = await getAuthContext();
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { code: 'INVALID_PASSWORD', message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const config = loadEnvironment(process.env);
    const cookieStore = await cookies();

    // 1. Extract Bearer token if passed by client JS / authFetch
    let bearerToken: string | null = null;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-auth');
    if (authHeader?.startsWith('Bearer ')) {
      bearerToken = authHeader.substring(7).trim();
    } else if (authHeader) {
      bearerToken = authHeader.trim();
    }

    // 2. If explicit Bearer token is provided by client, update user directly with token
    if (bearerToken) {
      const client = createClient(
        config.NEXT_PUBLIC_SUPABASE_URL,
        config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          },
        }
      );
      const { error } = await client.auth.updateUser({ password });
      if (error) {
        return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // 3. Fallback to cookie-based session client
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
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
              });
            });
          } catch {
            // Handled if cookies are immutable
          }
        },
      }
    );

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/auth/reset-password failure',
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
