# Web app (apps/web)

Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4 with the design
tokens from the Penpot library, MapLibre GL 6, TanStack Query 5, Outfit
self-hosted from npm.

## Run

    pnpm --filter web dev          # http://localhost:3000, API on :4000
    NEXT_PUBLIC_API_MOCK=1 pnpm --filter web dev   # sample data, no API

Sample-data sign-in: any phone, code 123456, any four-digit PIN that is not
an easy one (1111, 1234 and similar are refused). The sample project with
every section filled in is Kaduna–Kano (/projects/p-kk).

## Map styles

The maps read any MapLibre style JSON from `NEXT_PUBLIC_MAP_STYLE_URL`. The default is OpenFreeMap's free vector
style (no key). For the satellite look in the designs, use MapTiler's satellite-hybrid style:

    NEXT_PUBLIC_MAP_STYLE_URL=https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_MAPTILER_KEY

- Create the key in the MapTiler Cloud account and restrict it to the web app's domains (MapTiler, Account, Keys,
  Allowed HTTP origins), since the key is visible in the browser.
- The free plan's monthly map loads are enough for development and a pilot; check the usage page before go-live.
- The content security policy must allow `api.maptiler.com` (styles, tiles, fonts) when this style is used.
- `public/map-style-plain.json` is an offline style (a plain background) for when no tile server can be reached.

Every map carries the CC BY 4.0 credit for the state boundaries (GRID3 Nigeria via geoBoundaries,
`docs/data-sources.md`) as custom attribution, set once in `src/lib/map.ts`.

## How it is put together

- The browser only talks to this app's origin. `/api/*` is forwarded to the
  NestJS API (next.config.ts), so the refresh cookie is first-party and no
  CORS is needed.
- The access token lives in memory only (`src/lib/api.ts`); a 401 triggers
  one refresh from the cookie and a retry.
- Every API call is in `src/lib/endpoints.ts`, every response shape in
  `src/lib/types.ts`, every error message in `src/lib/messages.ts`.
- Screens follow the screen map ids: W1 sign-in, W2 invite, W3 map home,
  W4 project card, W5.1 to W5.13 project view (one route per section under
  /projects/[id]), W6 wizard (/projects/new, then /setup/[id]?step=n),
  W7.0 to W7.9 tasks (/tasks?task=id), S1 to S10 administration (/admin). Later screens are placeholders that say which web step
  builds them.
- MapLibre's worker is copied to `public/maplibre/` before dev and build
  (`scripts/copy-maplibre-worker.mjs`).
- `public/map-style-plain.json` is an offline map style (plain background)
  for when tile servers cannot be reached.

## Rules

- 16 px base text, nothing under 13 px, 48 px touch targets, one primary
  action per screen, sentence case, British spelling.
- Status colours only through `src/lib/status.ts` and the `--color-status-*`
  tokens; never a raw hex for a status in a component.
- Large text is `html[data-text="large"]` (125 percent), switched from the
  account menu and remembered on the device.
