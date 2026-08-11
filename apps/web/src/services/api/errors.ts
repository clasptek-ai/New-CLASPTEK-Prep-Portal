export type APIErrorCode =
  'AUTH_REQUIRED' | 'SESSION_EXPIRED' | 'FORBIDDEN' | 'NETWORK_ERROR' | 'API_ERROR';

export class APIError extends Error {
  public code: APIErrorCode;

  constructor(
    public status: number,
    message: string,
    public data?: any,
    code?: APIErrorCode
  ) {
    super(message);
    this.name = 'APIError';
    if (code) {
      this.code = code;
    } else if (status === 401) {
      this.code = 'AUTH_REQUIRED';
    } else if (status === 403) {
      this.code = 'FORBIDDEN';
    } else if (status === 0 || message.includes('Failed to fetch') || message.includes('Network')) {
      this.code = 'NETWORK_ERROR';
    } else {
      this.code = 'API_ERROR';
    }
  }
}
