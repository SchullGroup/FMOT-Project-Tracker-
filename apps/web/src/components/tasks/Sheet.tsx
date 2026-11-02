'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** A modal sheet on the native <dialog>: focus is trapped, Escape closes it. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="sheet-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg bg-surface p-0 text-ink shadow-xl backdrop:bg-brand-900/50"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <h2 id="sheet-title" className="text-xl font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-2 grid size-12 place-items-center rounded-md text-2xl hover:bg-brand-50">×</button>
      </div>
      <div className="p-5">{open && children}</div>
    </dialog>
  );
}
