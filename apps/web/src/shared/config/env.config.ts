import { getAppUrl } from '@clasptek/configuration';

export const APP_URL = getAppUrl(process.env);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  NEXT_PUBLIC_DEV_MOCK_AUTH: process.env.NEXT_PUBLIC_DEV_MOCK_AUTH || 'false',
} as const;
