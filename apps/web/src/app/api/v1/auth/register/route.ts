export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient, DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { logger } = await getAuthContext();
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, programme, provider } = body;

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
          phone: phone || null,
          programme: programme || null,
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

    // 3. Persist phone & target_programme to canonical public.profiles
    const dbLogger = new ConsoleLogger('RegisterRoute');
    const dbPool = new DatabasePool(config, dbLogger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    await pool.query(
      `UPDATE public.profiles
       SET phone = COALESCE($1, phone),
           target_programme = COALESCE($2, target_programme),
           updated_at = now()
       WHERE user_id = $3`,
      [phone || null, programme || null, data.user.id]
    );

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
