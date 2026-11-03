import { Redirect } from 'expo-router';
import { FIELD_ROLES, useSession } from '@/session/session';

/** Where to go now: welcome, sign-in, unlock, or the home for the person's role. */
export default function Index() {
  const { status, me, offerBiometric } = useSession();
  if (status === 'welcome') return <Redirect href="/welcome" />;
  if (status === 'signedOut') return <Redirect href="/sign-in" />;
  if (status === 'locked') return <Redirect href="/unlock" />;
  if (status !== 'open' || !me) return null;
  const role = me.role.code;
  if (!(FIELD_ROLES as readonly string[]).includes(role)) return <Redirect href="/not-for-you" />;
  if (offerBiometric) return <Redirect href="/biometric" />;
  return <Redirect href={role === 'consultant_resident_engineer' ? '/re-home' : '/home'} />;
}
