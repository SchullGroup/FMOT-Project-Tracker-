'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** A panel that slides over the right of the screen, for forms beside a table. */
export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
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
      aria-labelledby="drawer-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-[min(36rem,100vw)] max-w-none bg-surface p-0 text-ink shadow-xl backdrop:bg-brand-900/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <h2 id="drawer-title" className="text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-m-2 grid size-12 place-items-center rounded-md text-2xl hover:bg-brand-50">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{open && children}</div>
        {footer && <div className="flex flex-wrap gap-3 border-t border-line p-5">{footer}</div>}
      </div>
    </dialog>
  );
}
