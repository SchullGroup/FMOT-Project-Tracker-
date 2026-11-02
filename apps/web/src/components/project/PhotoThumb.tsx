'use client';

import { useQuery } from '@tanstack/react-query';
import { getMediaUrl } from '@/lib/endpoints';

/** A photo fetched through a short-lived signed link (5 minutes on the API). */
export function PhotoThumb({ mediaId, alt, className = '' }: { mediaId: string | null; alt: string; className?: string }) {
  const media = useQuery({
    queryKey: ['media', mediaId, 'thumb'],
    queryFn: () => getMediaUrl(mediaId!, 'thumb'),
    enabled: Boolean(mediaId),
    staleTime: 4 * 60_000,
    retry: false,
  });
  if (media.data?.url && media.data.url !== '#') {
    // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL
    return <img src={media.data.url} alt={alt} loading="lazy" className={`aspect-[4/3] w-full rounded-md object-cover ${className}`} />;
  }
  return (
    <div role="img" aria-label={alt} className={`grid aspect-[4/3] w-full place-items-center rounded-md bg-brand-50 text-brand-700 ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-8 8" />
      </svg>
    </div>
  );
}
