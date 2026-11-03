import { Button, Screen, SupportButton, T } from '@/components/ui';
import { useSession } from '@/session/session';
import { colour } from '@/theme';

/** Anyone who is not a site manager or resident engineer: the website is where their work is. */
export default function NotForYou() {
  const { strings: s, signOut } = useSession();
  return (
    <Screen footer={<><Button label={s.notForYou.signOut} onPress={() => void signOut()} /><SupportButton /></>}>
      <T variant="title" accessibilityRole="header">{s.notForYou.title}</T>
      <T colour={colour.textSecondary}>{s.notForYou.body}</T>
    </Screen>
  );
}
