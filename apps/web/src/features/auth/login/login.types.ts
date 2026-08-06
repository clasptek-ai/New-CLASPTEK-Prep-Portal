import { LoginSchema } from './login.schema';

export type LoginFormData = LoginSchema;

export interface LoginActionResult {
  success: boolean;
  message?: string;
  roles?: string[];
  userId?: string;
  session?: Record<string, unknown>;
}
