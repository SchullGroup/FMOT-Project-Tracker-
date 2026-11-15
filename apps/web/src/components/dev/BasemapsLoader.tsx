'use client';

import dynamic from 'next/dynamic';

export const BasemapsLoader = dynamic(() => import('./BasemapCompare').then((m) => m.BasemapCompare), {
  ssr: false,
  loading: () => <p className="p-6 text-ink-muted">Loading the maps…</p>,
});
