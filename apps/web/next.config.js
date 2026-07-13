let getSecureHeaders;
try {
  getSecureHeaders = require('@clasptek/security').getSecureHeaders;
} catch (err) {
  // Safe default fallback headers to prevent bootstrap race conditions
  getSecureHeaders = () => ({
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: Object.entries(getSecureHeaders()).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },
};

module.exports = nextConfig;
