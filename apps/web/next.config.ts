import { resolve } from 'node:path';
import type { NextConfig } from 'next';

// The browser only ever talks to the web app's own origin. Requests to /api
// are forwarded to the NestJS API, so the refresh cookie (httpOnly, SameSite
// Strict) is first-party and no CORS setup is needed in development.
const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

// Security headers on every response; the Content Security Policy is set per request in src/proxy.ts (it carries
// a nonce). HSTS only matters over HTTPS (staging and production); browsers ignore it on http://localhost.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A standalone server (server.js plus only the files it needs) for the Docker image.
  output: 'standalone',
  // The workspace root, so @fmot/shared and the hoisted node_modules are traced into it.
  outputFileTracingRoot: resolve(process.cwd(), '../..'),
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
