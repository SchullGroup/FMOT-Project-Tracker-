import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Field, Notice, Screen, SupportButton, T } from '@/components/ui';
import { PinPad } from '@/components/PinPad';
import { errorText } from '@/i18n';
import type { CodeChannel, InvitePreview } from '@/lib/api';
import { inviteToken } from '@/lib/format';
import { api, useSession } from '@/session/session';
import { colour } from '@/theme';

/*
 * M1 with an invite: the short code from the invite text message (or the pasted link), then the same steps as the M1 board:
 * "Welcome, <name>", the code by text or email (the person picks when both are on file), a 4-digit PIN set twice. Deep links from the message come in a later step, because
 * they are unreliable in Expo Go.
 */
export default function Invite() {
  const { strings: s, opened } = useSession();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  // Where the code went; null until one is asked for.
  const [sentBy, setSentBy] = useState<{ channel: CodeChannel; sentTo: string } | null>(null);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = inviteToken(text);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(errorText(s, e));
      setPin('');
      setFirstPin(null);
    } finally {
      setBusy(false);
    }
  }

  const finish = (value: string) => {
    if (!firstPin) {
      setFirstPin(value);
      setPin('');
      return;
    }
    if (value !== firstPin) {
      setError(s.signIn.pinMismatch);
      setFirstPin(null);
      setPin('');
      return;
    }
    void run(async () => {
      await api.acceptInvite(token, code, value, sentBy?.channel);
      await opened(true);
    });
  };

  if (!preview) {
    return (
      <Screen footer={<><Button label={s.invite.check} busy={busy} disabled={token.length < 9} onPress={() => void run(async () => setPreview(await api.invitePreview(token)))} /><SupportButton /></>}>
        <T variant="title" accessibilityRole="header">{s.invite.title}</T>
        {error && <Notice tone="error">{error}</Notice>}
        <Field label={s.invite.pasteLabel} hint={s.invite.pasteHint} value={text} onChangeText={setText} autoCapitalize="characters" autoCorrect={false} autoComplete="off" />
        <Button kind="quiet" label={s.common.back} onPress={() => router.back()} />
      </Screen>
    );
  }

  // Older APIs send no list: the one channel the invite names.
  const channels = preview.channels ?? [{ channel: preview.codeChannel ?? 'sms', sentTo: preview.codeSentTo ?? preview.phoneMasked }];
  const where: Partial<Record<CodeChannel, string>> = Object.fromEntries(channels.map((c) => [c.channel, c.sentTo]));

  return (
    <Screen footer={<SupportButton />}>
      <T variant="title" accessibilityRole="header">{s.invite.welcome(preview.name.split(' ')[0] ?? preview.name)}</T>
      <T colour={colour.textSecondary}>{[preview.role, preview.organisation].join(' · ')}</T>
      {error && <Notice tone="error">{error}</Notice>}
      {!sentBy ? (
        <>
          {where.sms && where.email && <T>{s.invite.chooseHow(where.sms, where.email)}</T>}
          {channels.map((c, i) => (
            <Button
              key={c.channel}
              kind={i === 0 ? 'primary' : 'secondary'}
              label={c.channel === 'email' ? s.invite.emailCode : s.invite.sendCode}
              hint={s.invite.codeSentTo(c.sentTo)}
              busy={busy}
              onPress={() => void run(async () => { await api.inviteCode(token, c.channel); setSentBy(c); })}
            />
          ))}
        </>
      ) : (
        <>
          <Field label={s.signIn.codeLabel} hint={s.invite.codeSentTo(sentBy.sentTo)} value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={6} />
          {__DEV__ && <Notice tone="info">{s.signIn.codeOnTestServer}</Notice>}
          {/^\d{6}$/.test(code) && <PinPad label={firstPin ? s.signIn.pinAgain : s.signIn.pinSet} value={pin} onChange={setPin} onComplete={finish} disabled={busy} />}
          {channels.length > 1 && <Button kind="quiet" label={s.invite.otherWay} onPress={() => { setSentBy(null); setCode(''); setError(null); }} />}
        </>
      )}
    </Screen>
  );
}
