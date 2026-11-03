'use client';

import { useEffect, useRef } from 'react';

/*
 * A filter chip that opens a short list of choices, as in the design
 * ("Status ▾"). The chip shows how many are chosen. Nothing chosen means
 * no filter.
 */
export function FilterChip({ label, options, chosen, onChange }: { label: string; options: Array<{ value: string; label: string }>; chosen: Set<string>; onChange: (next: Set<string>) => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  const toggle = (v: string) => {
    const next = new Set(chosen);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };

  return (
    <details ref={ref} className="relative">
      <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border-2 px-4 font-medium shadow-sm ${chosen.size ? 'border-brand-900 bg-brand-900 text-white' : 'border-line bg-surface hover:border-line-strong'}`}>
        {label}
        {chosen.size > 0 && <span className="tabular rounded-full bg-white px-2 text-sm text-brand-900">{chosen.size}</span>}
        <span aria-hidden className="text-xs">▾</span>
      </summary>
      <fieldset className="absolute left-0 z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-md border border-line bg-surface p-2 shadow-lg">
        <legend className="sr-only">{label}</legend>
        {options.length === 0 && <p className="p-2 text-ink-muted">Nothing to choose.</p>}
        {options.map((o) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-2 hover:bg-brand-50">
            <input type="checkbox" className="size-5 accent-brand-900" checked={chosen.has(o.value)} onChange={() => toggle(o.value)} />
            {o.label}
          </label>
        ))}
        {chosen.size > 0 && (
          <button type="button" onClick={() => onChange(new Set())} className="mt-1 min-h-11 w-full rounded px-2 text-left font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">
            Clear
          </button>
        )}
      </fieldset>
    </details>
  );
}
