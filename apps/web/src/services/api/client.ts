import { APIError } from './errors';
import { interceptors } from './interceptors';

export interface RequestOptions extends RequestInit {
  retries?: number;
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { retries = 2, ...fetchOptions } = options;

    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    };

    // Apply request interceptors
    for (const interceptor of interceptors.request) {
      if (interceptor.onRequest) {
        config = await interceptor.onRequest(config);
      }
    }

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(path, config);

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
          throw new APIError(
            interceptedResponse.status,
            errorData?.message || `HTTP error! status: ${interceptedResponse.status}`,
            errorData
          );
        }

        return (await interceptedResponse.json()) as T;
      } catch (error: any) {
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
        // Exponential backoff delay
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
