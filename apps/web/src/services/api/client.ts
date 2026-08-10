import { APIError } from './errors';
import { interceptors } from './interceptors';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface RequestOptions extends RequestInit {
  retries?: number;
  /**
   * If true, this request will NOT be retried or trigger an auth redirect on 401/403.
   * Used internally to avoid infinite loops.
   */
  skipAuthRetry?: boolean;
}

type AuthErrorHandler = () => void;
let _authErrorHandler: AuthErrorHandler | null = null;

/**
 * Register a global handler to be called when any API request receives a 401.
 * The handler should clear the session and redirect to /login.
 */
export function registerAuthErrorHandler(handler: AuthErrorHandler) {
  _authErrorHandler = handler;
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { retries = 2, skipAuthRetry = false, ...fetchOptions } = options;

    const reqHeaders = new Headers(fetchOptions.headers || {});
    if (!reqHeaders.has('Content-Type')) {
      reqHeaders.set('Content-Type', 'application/json');
    }

    if (!reqHeaders.has('Authorization') && typeof window !== 'undefined') {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          reqHeaders.set('Authorization', `Bearer ${data.session.access_token}`);
        }
      } catch {
        // Ignore session fetch error
      }
    }

    let config: RequestInit = {
      ...fetchOptions,
      headers: reqHeaders,
    };

    // Apply request interceptors
    for (const interceptor of interceptors.request) {
      if (interceptor.onRequest) {
        config = await interceptor.onRequest(config);
      }
    }

    const targetUrl =
      typeof window === 'undefined' && path.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`
        : path;

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(targetUrl, config);

        // Apply response interceptors
        let interceptedResponse = response;
        for (const interceptor of interceptors.response) {
          if (interceptor.onResponse) {
            interceptedResponse = await interceptor.onResponse(interceptedResponse);
          }
        }

        if (!interceptedResponse.ok) {
          let errorData = null;
          try {
            errorData = await interceptedResponse.json();
          } catch {
            // No json body
          }

          // On 401 Unauthorized — do NOT retry. Clear session and redirect to login.
          if (interceptedResponse.status === 401 || interceptedResponse.status === 403) {
            const authError = new APIError(
              interceptedResponse.status,
              errorData?.error ||
                errorData?.message ||
                `HTTP ${interceptedResponse.status}: Authentication required`,
              errorData
            );

            // Trigger global auth error handler exactly once (no retry loop)
            if (!skipAuthRetry && _authErrorHandler) {
              _authErrorHandler();
            }

            throw authError;
          }

          throw new APIError(
            interceptedResponse.status,
            errorData?.message || `HTTP error! status: ${interceptedResponse.status}`,
            errorData
          );
        }

        return (await interceptedResponse.json()) as T;
      } catch (error: any) {
        // Never retry on auth errors — throw immediately
        if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
          throw error;
        }

        // Ensure that thrown objects (including DOM Event objects) are normalized into valid Error instances
        const normalizedError =
          error instanceof Error
            ? error
            : new Error(
                error && typeof error === 'object' && 'message' in error
                  ? String(error.message)
                  : typeof error === 'string'
                    ? error
                    : 'Network request failed'
              );

        if (attempt >= retries) {
          throw normalizedError;
        }
        attempt++;
        // Exponential backoff delay (not applied for auth errors, which are thrown immediately above)
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 100));
      }
    }

    throw new Error('API Client request failed');
  },

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};
