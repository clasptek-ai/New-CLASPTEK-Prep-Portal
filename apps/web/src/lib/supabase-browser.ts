import { createSupabaseBrowserClient } from '@clasptek/persistence';
import { env } from '../shared/config/env.config';

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient(): ReturnType<typeof createSupabaseBrowserClient> {
  if (browserClient) return browserClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://placeholder.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';

  browserClient = createSupabaseBrowserClient(url, key);
  return browserClient;
}
