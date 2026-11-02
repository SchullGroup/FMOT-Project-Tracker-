import '@fontsource-variable/outfit';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Rail Project Tracker · Federal Ministry of Transportation',
  description: 'Railway construction projects across Nigeria, their gates, progress and evidence.',
};

// Applies the Large text choice before first paint, so the page does not jump.
const textSizeScript = `try{if(localStorage.getItem('fmot.textSize')==='large')document.documentElement.dataset.text='large'}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: textSizeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
