// MapLibre 6 loads its web worker from a file next to its own bundle, which
// does not exist once Next bundles the library. Copy the worker into public/
// before dev and build so it always matches the installed version; the map
// component points MapLibre at /maplibre/maplibre-gl-worker.mjs.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve('maplibre-gl/dist/maplibre-gl.css'));
mkdirSync('public/maplibre', { recursive: true });
copyFileSync(join(dist, 'maplibre-gl-worker.mjs'), 'public/maplibre/maplibre-gl-worker.mjs');
