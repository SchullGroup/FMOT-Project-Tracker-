import { type NextRequest, NextResponse } from 'next/server';
import { STYLE_URL } from '@/lib/map';

// Origins the maps load from: the style's own host (style, tiles, glyphs and sprites for OpenFreeMap and MapTiler),
// plus any listed in MAP_EXTRA_ORIGINS (comma separated) for a style that spreads over several hosts.
const mapOrigins = (() => {
  const list = (process.env.MAP_EXTRA_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  try {
    const style = new URL(STYLE_URL, 'http://self.invalid');
    if (style.origin !== 'http://self.invalid') list.unshift(style.origin);
  } catch {
    // A relative style (public/map-style-plain.json) is 'self'.
  }
  return [...new Set(list)].join(' ');
})();

/**
 * The Content Security Policy, with a fresh nonce on every page request (Next.js puts it on its own scripts and
 * styles; the root layout passes it to the one inline script). Everything comes from this origin, the API included
 * (/api is proxied), except the map tiles. React renders some style="" attributes, hence style-src-attr; no inline
 * <style> or script runs without the nonce.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // next dev injects its CSS as <style> elements without the nonce; a production build serves CSS as files.
    dev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: ${mapOrigins}`,
    `connect-src 'self' ${mapOrigins}${dev ? ' ws:' : ''}`,
    "worker-src 'self' blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ]
    .map((d) => d.trim())
    .join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: not the API proxy, static files or prefetches.
      source: '/((?!api|_next/static|_next/image|maplibre|favicon.ico|map-style-plain.json).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
