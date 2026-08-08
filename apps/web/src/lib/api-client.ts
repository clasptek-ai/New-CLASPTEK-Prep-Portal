export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
}

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function getAuthHeaders(
  customHeaders?: Record<string, string>
): Promise<Record<string, string>> {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (typeof window !== 'undefined' && !reqHeaders['Authorization']) {
    try {
      const { getSupabaseBrowserClient } = await import('./supabase-browser');
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        reqHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignore if browser client is uninitialized
    }
  }

  return reqHeaders;
}

export const apiClient = {
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const finalHeaders = await getAuthHeaders(headers);
    const res = await fetch(url, {
      method: 'GET',
      headers: finalHeaders,
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      throw new ApiError(errorData.message || 'API request failed', res.status, errorData.code);
    }

    return res.json() as Promise<T>;
  },

  async post<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    const finalHeaders = await getAuthHeaders(headers);
    const res = await fetch(url, {
      method: 'POST',
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      throw new ApiError(errorData.message || 'API request failed', res.status, errorData.code);
    }

    return res.json() as Promise<T>;
  },

  async put<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    const finalHeaders = await getAuthHeaders(headers);
    const res = await fetch(url, {
      method: 'PUT',
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      throw new ApiError(errorData.message || 'API request failed', res.status, errorData.code);
    }

    return res.json() as Promise<T>;
  },

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const finalHeaders = await getAuthHeaders(headers);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: finalHeaders,
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      throw new ApiError(errorData.message || 'API request failed', res.status, errorData.code);
    }

    return res.json() as Promise<T>;
  },
};
