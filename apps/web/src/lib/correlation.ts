/**
 * Request Correlation
 *
 * Generates and propagates correlation IDs for every API request using the
 * Web Crypto API (crypto.randomUUID()), ensuring 100% Edge Runtime and Node.js
 * compatibility without importing Node-only modules.
 */

/**
 * Generate a new correlation ID for a request.
 * Uses Web Crypto API natively available in both Edge Runtime and Node.js 19+.
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for legacy environments
  return 'req_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * Extract the X-Request-ID from incoming request headers,
 * or generate a new one if absent.
 */
export function getOrCreateRequestId(headers: Headers | null): string {
  const existing = headers?.get('x-request-id');
  if (existing && existing.length > 0) return existing;
  return generateRequestId();
}
