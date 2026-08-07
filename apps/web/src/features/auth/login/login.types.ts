import type { Session } from '@supabase/supabase-js';
import { LoginSchema } from './login.schema';

export type LoginFormData = LoginSchema;

export interface LoginActionResult {
  success: boolean;
  message?: string;
  roles?: string[];
  userId?: string;
  session?: Session;
}
