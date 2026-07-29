import * as crypto from 'crypto';

/**
 * @service Security
 * Shared reusable security primitives
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'font-src'?: string[];
  'img-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
}

export const defaultCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
};

export function buildCSPHeader(directives: CSPDirectives = defaultCSP): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export function getSecureHeaders() {
  return {
    'Content-Security-Policy': buildCSPHeader(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
}

export function getSessionCookieConfig(env: 'development' | 'production' | 'test'): CookieConfig {
  return {
    httpOnly: true,
    secure: env !== 'development',
    sameSite: 'lax',
    path: '/',
  };
}

export function generateCryptoHash(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyCryptoHash(data: string, hash: string, secret: string): boolean {
  const generated = generateCryptoHash(data, secret);
  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(hash));
}
