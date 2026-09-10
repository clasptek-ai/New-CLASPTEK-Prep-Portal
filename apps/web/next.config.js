const pkg = require('./package.json');
const clasptekPackages = Object.keys(pkg.dependencies || {}).filter((name) =>
  name.startsWith('@clasptek/')
);

const isDev = process.env.NODE_ENV === 'development';

const getSecureHeaders = () => ({
  'Content-Security-Policy': isDev
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.supabase.co ws: wss:",
        "frame-ancestors 'none'",
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "connect-src 'self' https://*.supabase.co",
        "frame-ancestors 'none'",
      ].join('; '),

  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
});

module.exports = {
  transpilePackages: clasptekPackages,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      // 1. Dynamic API routes: Never cache
      {
        source: '/api/:path*',
        headers: [
          ...Object.entries(getSecureHeaders()).map(([key, value]) => ({ key, value })),
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // 2. Audio assets: Cache with revalidation
      {
        source: '/audio/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }],
      },
      // 3. Application HTML Pages & Shell: Revalidate on every deployment
      {
        source: '/((?!_next/static|_next/image|audio|favicon.ico|logo.png|manifest.json).*)',
        headers: [
          ...Object.entries(getSecureHeaders()).map(([key, value]) => ({ key, value })),
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
};
