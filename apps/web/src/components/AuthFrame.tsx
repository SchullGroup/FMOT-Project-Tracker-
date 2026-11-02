import type { ReactNode } from 'react';

/** The frame around sign-in and invite screens: ministry header, one card. */
export function AuthFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b-4 border-accent bg-brand-900 text-white">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-6 py-5">
          {/* Slot for the ministry crest, supplied by the ministry. */}
          <div aria-hidden className="size-11 shrink-0 rounded-md border-2 border-dashed border-white/60" />
          <div>
            <p className="text-lg font-semibold leading-tight">Rail Project Tracker</p>
            <p className="text-sm text-brand-100">Federal Ministry of Transportation</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold text-brand-900">{title}</h1>
        {children}
        <p className="mt-10 text-base text-ink-muted">
          Need help signing in? Call the IT support desk on <span className="tabular">0700 000 0000</span>.
        </p>
      </main>
    </div>
  );
}
