import type { Session, User } from '@supabase/supabase-js';
import { LoginSchema } from './login.schema';

export type LoginFormData = LoginSchema;

export interface LoginActionResult {
  success: boolean;
  message?: string;
  roles?: string[];
  userId?: string;
  user?: User;
  session?: Session;
}
