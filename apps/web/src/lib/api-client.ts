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

export const apiClient = {
  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
