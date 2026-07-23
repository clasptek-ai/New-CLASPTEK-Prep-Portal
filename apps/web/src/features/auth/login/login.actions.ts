import { apiClient, ApiError } from '../../../lib/api-client';
import { LoginFormData, LoginActionResult } from './login.types';

export async function loginAction(data: LoginFormData): Promise<LoginActionResult> {
  try {
    const res = await apiClient.post<LoginActionResult>('/api/v1/auth/login', data);
    return res;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || 'Login failed. Please verify your credentials.',
      };
    }
    return {
      success: false,
      message: 'Unable to connect to authentication server. Please check your internet connection.',
    };
  }
}
