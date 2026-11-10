'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMediaUrl } from '@/lib/endpoints';

/**
 * A photo fetched through a short-lived signed link (5 minutes on the API). While it loads, a soft shimmer; if it cannot
 * be shown (no access, a missing file, no signal), a plain line saying so, never an empty box.
 */
export function PhotoThumb({ mediaId, alt, className = '', size = 'thumb' }: { mediaId: string | null; alt: string; className?: string; size?: 'thumb' | 'web' }) {
  const media = useQuery({
    queryKey: ['media', mediaId, size],
    queryFn: () => getMediaUrl(mediaId!, size),
    enabled: Boolean(mediaId),
    staleTime: 4 * 60_000,
    retry: 1,
  });
  const [broken, setBroken] = useState<string | null>(null);
  const url = media.data?.url && media.data.url !== '#' ? media.data.url : null;
  // 4:3 unless the caller gives its own shape (the map card is 16:9).
  const box = `${/\baspect-/.test(className) ? '' : 'aspect-[4/3] '}w-full rounded-md ${className}`;

  if (url && broken !== url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL
      <img src={url} alt={alt} loading="lazy" onError={() => setBroken(url)} className={`${box} bg-canvas object-cover`} />
    );
  }
  if (mediaId && (media.isPending || media.isFetching) && !broken) {
    return <div role="img" aria-label={`${alt} (loading)`} aria-busy="true" className={`${box} animate-pulse bg-brand-50`} />;
  }
  return (
    <div role="img" aria-label={`${alt}: the photo could not be shown`} className={`${box} grid place-items-center bg-brand-50 p-3 text-center text-sm text-brand-700`}>
      <span className="flex flex-col items-center gap-1">
        <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-8 8" />
        </svg>
        Photo could not be shown
      </span>
    </div>
  );
}
