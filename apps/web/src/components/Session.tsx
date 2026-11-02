'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { refreshSession, SignedOutError } from '@/lib/api';
import { getMe } from '@/lib/endpoints';
import type { Permission } from '@fmot/shared';
import type { Me } from '@/lib/types';

const SessionContext = createContext<Me | null>(null);

/** The signed-in person. Only usable inside the signed-in area. */
export function useMe(): Me {
  const me = useContext(SessionContext);
  if (!me) throw new Error('useMe used outside <RequireSession>');
  return me;
}

export function useCan(permission: Permission): boolean {
  return useMe().permissions.includes(permission);
}

/*
 * Restores the session from the refresh cookie on first load, then loads
 * /me. Anyone not signed in is sent to the sign-in screen and brought back
 * afterwards.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof SignedOutError && (await refreshSession())) return getMe();
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (me.isError) router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [me.isError, pathname, router]);

  if (me.isPending || me.isError) {
    return (
      <main className="grid min-h-dvh place-items-center text-lg text-ink-muted" aria-busy="true">
        Opening the tracker…
      </main>
    );
  }

  return <SessionContext.Provider value={me.data}>{children}</SessionContext.Provider>;
}
