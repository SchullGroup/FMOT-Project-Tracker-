'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getTasks, signOut } from '@/lib/endpoints';
import { roleLabel } from '@/lib/roles';
import { useCan, useMe } from './Session';

function useLargeText(): [boolean, () => void] {
  const [large, setLarge] = useState(false);
  useEffect(() => setLarge(document.documentElement.dataset.text === 'large'), []);
  const toggle = () => {
    const next = !large;
    document.documentElement.dataset.text = next ? 'large' : '';
    localStorage.setItem('fmot.textSize', next ? 'large' : 'normal');
    setLarge(next);
  };
  return [large, toggle];
}

const TITLES = /^(engr|dr|mr|mrs|ms|prof|arc|hon|alhaji|chief)\.?$/i;

/** "Engr. H. Danjuma" -> "HD": titles dropped, first and last name. */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter((w) => w && !TITLES.test(w));
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function TopBar() {
  const me = useMe();
  const canPortfolio = useCan('reports:read');
  const canAdmin = useCan('admin:users');
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [large, toggleLarge] = useLargeText();
  const menu = useRef<HTMLDetailsElement>(null);

  // Close the account menu on a click outside it or on Escape.
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      const el = menu.current;
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
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: getTasks });
  const openCount = tasks.data?.groups.reduce((n, g) => n + g.tasks.length, 0) ?? 0;

  const nav = [
    { href: '/', label: 'Map' },
    { href: '/tasks', label: 'Tasks', count: openCount },
    ...(canPortfolio ? [{ href: '/portfolio', label: 'Portfolio' }] : []),
    ...(canAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    router.replace('/sign-in');
  }

  return (
    <header className="border-b-4 border-accent bg-brand-900 text-white">
      <div className="flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2">
        <Link href="/" className="flex items-center gap-3 rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed 36 px picture, nothing to optimise */}
          <img src="/coat-of-arms.png" alt="" className="size-9 shrink-0 object-contain" />
          <span className="leading-tight">
            <span className="block font-semibold">Rail Project Tracker</span>
            <span className="block text-sm text-brand-100">Federal Ministry of Transportation</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-1">
          {nav.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-2 rounded-md px-4 font-medium ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                {item.label}
                {item.count ? (
                  <span className="tabular min-w-6 rounded-full bg-white px-2 text-center text-sm font-semibold text-brand-900">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <details ref={menu} className="relative">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-md px-3 hover:bg-white/10">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-semibold">
              {initials(me.name)}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block font-medium">{me.name}</span>
              <span className="block text-sm text-brand-100">{roleLabel(me.role)}</span>
            </span>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-line bg-surface p-2 text-ink shadow-lg">
            <p className="px-3 py-2 text-sm text-ink-muted">{me.organisation.name}</p>
            <button
              type="button"
              onClick={toggleLarge}
              aria-pressed={large}
              className="flex min-h-12 w-full items-center justify-between rounded-md px-3 text-left hover:bg-brand-50"
            >
              Large text <span className="font-semibold">{large ? 'On' : 'Off'}</span>
            </button>
            <Link href="/settings/notifications" className="flex min-h-12 w-full items-center rounded-md px-3 hover:bg-brand-50" onClick={() => menu.current && (menu.current.open = false)}>
              Your messages
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-12 w-full items-center rounded-md px-3 text-left hover:bg-brand-50"
            >
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
