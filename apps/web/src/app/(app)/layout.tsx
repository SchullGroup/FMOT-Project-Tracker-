import type { ReactNode } from 'react';
import { RequireSession } from '@/components/Session';
import { TopBar } from '@/components/TopBar';

export default function SignedInLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSession>
      <div className="flex min-h-dvh flex-col">
        <TopBar />
        {children}
      </div>
    </RequireSession>
  );
}
