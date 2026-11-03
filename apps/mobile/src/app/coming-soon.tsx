import { router, useLocalSearchParams } from 'expo-router';
import { Button, Screen, SupportButton, T } from '@/components/ui';
import { useSession } from '@/session/session';
import { colour } from '@/theme';

/** Where the buttons for screens of the next steps (camera, report, milestones, incident, review) lead for now. */
export default function ComingSoon() {
  const s = useSession().strings;
  const { title } = useLocalSearchParams<{ title?: string }>();
  return (
    <Screen footer={<><Button label={s.common.back} onPress={() => router.back()} /><SupportButton /></>}>
      <T variant="title" accessibilityRole="header">{title ?? ''}</T>
      <T colour={colour.textSecondary}>{s.comingSoon.body}</T>
    </Screen>
  );
}
