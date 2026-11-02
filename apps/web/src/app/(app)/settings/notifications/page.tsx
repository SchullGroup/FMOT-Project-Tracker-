'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { QueryState, Section } from '@/components/ui/Section';
import { getMyPreferences, saveMyPreferences } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import type { NotificationPreferences } from '@/lib/types';

/*
 * W8.3 My notifications. Texts are the only channel today; app and email
 * messages come later, so they are not offered yet.
 */
export default function NotificationsPage() {
  const qc = useQueryClient();
  const prefs = useQuery({ queryKey: ['my-prefs'], queryFn: getMyPreferences });
  const [form, setForm] = useState<NotificationPreferences | null>(null);
  const [quiet, setQuiet] = useState(false);
  const [state, setState] = useState<'idle' | 'busy' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefs.data && !form) {
      setForm(prefs.data);
      setQuiet(Boolean(prefs.data.quietFrom && prefs.data.quietTo));
    }
  }, [prefs.data, form]);

  async function save() {
    if (!form) return;
    setState('busy');
    setError(null);
    try {
      await saveMyPreferences({ channel: 'sms', weeklyDigest: form.weeklyDigest, quietFrom: quiet ? form.quietFrom ?? '21:00' : null, quietTo: quiet ? form.quietTo ?? '07:00' : null });
      await qc.invalidateQueries({ queryKey: ['my-prefs'] });
      setState('saved');
    } catch (e) {
      setError(messageFor(e));
      setState('idle');
    }
  }

  const set = (patch: Partial<NotificationPreferences>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    setState('idle');
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-8">
      <h1 className="text-3xl font-semibold text-brand-900">Your messages</h1>
      <p className="text-lg">The tracker texts you when something needs you, with a link straight to it. Sign-in codes always come, whatever you choose here.</p>
      <QueryState loading={prefs.isPending} error={prefs.isError} />
      {form && (
        <>
          <Section title="Quiet hours">
            <label className="flex min-h-12 items-center gap-3">
              <input type="checkbox" checked={quiet} onChange={(e) => { setQuiet(e.target.checked); setState('idle'); }} className="size-5 accent-brand-900" />
              Hold texts overnight and send them in the morning
            </label>
            {quiet && (
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex flex-col gap-2">
                  <span className="font-semibold">From</span>
                  <input type="time" value={form.quietFrom ?? '21:00'} onChange={(e) => set({ quietFrom: e.target.value })} className="min-h-12 rounded-md border-2 border-line-strong bg-surface px-3 text-lg tabular" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="font-semibold">Until</span>
                  <input type="time" value={form.quietTo ?? '07:00'} onChange={(e) => set({ quietTo: e.target.value })} className="min-h-12 rounded-md border-2 border-line-strong bg-surface px-3 text-lg tabular" />
                </label>
              </div>
            )}
          </Section>
          {form.digestEligible && (
            <Section title="Monday summary">
              <label className="flex min-h-12 items-center gap-3">
                <input type="checkbox" checked={form.weeklyDigest} onChange={(e) => set({ weeklyDigest: e.target.checked })} className="size-5 accent-brand-900" />
                Text me the week&rsquo;s numbers every Monday at 8:00, with a link to the portfolio
              </label>
            </Section>
          )}
          <div className="flex items-center gap-4">
            <Button busy={state === 'busy'} onClick={save}>Save</Button>
            {state === 'saved' && <span role="status" className="font-medium text-status-operational">Saved</span>}
            {error && <span role="alert" className="text-danger">{error}</span>}
          </div>
        </>
      )}
    </main>
  );
}
