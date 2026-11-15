import { notFound } from 'next/navigation';
import { BasemapsLoader } from '@/components/dev/BasemapsLoader';

/** Development only: MapTiler and Esri imagery side by side, to choose the sharper. A production build answers 404. */
export default function DevBasemaps() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <BasemapsLoader />;
}
