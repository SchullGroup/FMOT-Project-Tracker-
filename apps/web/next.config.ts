import type { NextConfig } from 'next';

// The browser only ever talks to the web app's own origin. Requests to /api
// are forwarded to the NestJS API, so the refresh cookie (httpOnly, SameSite
// Strict) is first-party and no CORS setup is needed in development.
const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
