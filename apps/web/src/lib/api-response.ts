import { NextResponse } from 'next/server';

/**
 * Clasptek API Response Factory
 *
 * Guarantees a consistent response envelope across all 323 API routes:
 *
 * Success: { "success": true, "data": {...}, "meta": {...} }
 * Error:   { "success": false, "error": { "code": "...", "message": "..." } }
 *
 * Usage:
 *   return ApiResponse.success(data);
 *   return ApiResponse.error('NOT_FOUND', 'Assessment not found', 404);
 *   return ApiResponse.unauthorized();
 *   return ApiResponse.validationError([{ field: 'email', message: 'Invalid email' }]);
 */

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  version?: number;
  [key: string]: unknown;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fields?: { field: string; message: string }[];
  requestId?: string;
}

function buildMeta(requestId?: string, extra?: Partial<ApiMeta>): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    version: 1,
    ...(requestId ? { requestId } : {}),
    ...extra,
  };
}

export const ApiResponse = {
  /**
   * 200 OK — successful response with data payload.
   */
  success<T>(
    data: T,
    options?: { requestId?: string; status?: number; meta?: Partial<ApiMeta> }
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: buildMeta(options?.requestId, options?.meta),
      },
      { status: options?.status ?? 200 }
    );
  },

  /**
   * 201 Created — resource successfully created.
   */
  created<T>(data: T, options?: { requestId?: string; meta?: Partial<ApiMeta> }): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: buildMeta(options?.requestId, options?.meta),
      },
      { status: 201 }
    );
  },

  /**
   * Paginated response with total count and page info.
   */
  paginated<T>(
    data: T[],
    pagination: { total: number; page: number; pageSize: number },
    options?: { requestId?: string }
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        ...buildMeta(options?.requestId),
        pagination,
      },
    });
  },

  /**
   * Error response with standardised error envelope.
   */
  error(
    code: string,
    message: string,
    status: number,
    options?: { requestId?: string; fields?: { field: string; message: string }[] }
  ): NextResponse {
    const error: ApiErrorDetail = {
      code,
      message,
      ...(options?.requestId ? { requestId: options.requestId } : {}),
      ...(options?.fields ? { fields: options.fields } : {}),
    };
    return NextResponse.json({ success: false, error }, { status });
  },

  /** 401 Unauthorized */
  unauthorized(requestId?: string): NextResponse {
    return ApiResponse.error('UNAUTHORIZED', 'Authentication required.', 401, { requestId });
  },

  /** 403 Forbidden */
  forbidden(requestId?: string): NextResponse {
    return ApiResponse.error(
      'FORBIDDEN',
      'You do not have permission to perform this action.',
      403,
      { requestId }
    );
  },

  /** 404 Not Found */
  notFound(resource: string, requestId?: string): NextResponse {
    return ApiResponse.error('NOT_FOUND', `${resource} not found.`, 404, { requestId });
  },

  /** 400 Validation Error with field-level details */
  validationError(fields: { field: string; message: string }[], requestId?: string): NextResponse {
    return ApiResponse.error('VALIDATION_ERROR', 'One or more fields are invalid.', 400, {
      requestId,
      fields,
    });
  },

  /** 429 Rate Limited */
  rateLimited(requestId?: string): NextResponse {
    return ApiResponse.error(
      'RATE_LIMITED',
      'Too many requests. Please wait before trying again.',
      429,
      { requestId }
    );
  },

  /** 500 Internal Server Error — never exposes raw error.message in production */
  internalError(requestId?: string, devMessage?: string): NextResponse {
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred. Please try again.'
        : (devMessage ?? 'Internal server error.');
    return ApiResponse.error('INTERNAL_ERROR', message, 500, { requestId });
  },
};

export default ApiResponse;
