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
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

module.exports = {
  devIndicators: false,
  transpilePackages: clasptekPackages,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.json).*)',
        headers: Object.entries(getSecureHeaders()).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};
