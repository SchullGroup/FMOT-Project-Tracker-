'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCan } from '@/components/Session';

const NAV = [
  { href: '/admin/users', label: 'People' },
  { href: '/admin/organisations', label: 'Organisations' },
  { href: '/admin/roles', label: 'Roles' },
  { href: '/admin/settings', label: 'Settings and reminders' },
  { href: '/admin/messages', label: 'Messages sent' },
  { href: '/admin/audit', label: 'Activity record' },
];

/** S1 to S10: the IT administrator's area. No map and no approve buttons here. */
export function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const allowed = useCan('admin:users');
  if (!allowed) {
    return <main className="p-6 text-lg">This area is for the IT administrator.</main>;
  }
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <nav aria-label="Administration" className="border-b border-line bg-surface lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <p className="hidden px-5 pb-1 pt-5 text-sm font-semibold text-ink-muted lg:block">Administration</p>
        <ul className="flex overflow-x-auto lg:flex-col lg:pb-3">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <li key={n.href} className="shrink-0">
                <Link href={n.href} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center whitespace-nowrap px-5 ${active ? 'border-b-4 border-brand-900 font-semibold text-brand-900 lg:border-b-0 lg:border-l-4 lg:bg-brand-50' : 'hover:bg-brand-50'}`}>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="flex-1 overflow-x-hidden p-5 lg:p-6">{children}</main>
    </div>
  );
}
