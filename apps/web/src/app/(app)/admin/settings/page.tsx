'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { QueryState, Section } from '@/components/ui/Section';
import { getReminderRules, getSettings, updateReminderRule, updateSetting } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';

/** S7 and settings: the numbers the system works by. Several still need the ministry's decision. */
export default function SettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const rules = useQuery({ queryKey: ['reminder-rules'], queryFn: getReminderRules });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-semibold text-brand-900">Settings and reminders</h1>
      <Section title="Limits and checks">
        <QueryState loading={settings.isPending} error={settings.isError} />
        <ul className="flex flex-col divide-y divide-line">
          {settings.data?.map((s) => (
            <NumberRow
              key={s.key}
              label={s.label}
              unit={s.unit}
              value={s.value}
              badge={s.confirmedByMinistry ? null : <Pill tone="warn">Waiting for the ministry&rsquo;s decision</Pill>}
              onSave={async (v) => { await updateSetting(s.key, v); await qc.invalidateQueries({ queryKey: ['settings'] }); }}
            />
          ))}
        </ul>
      </Section>
      <Section title="Reminders">
        <QueryState loading={rules.isPending} error={rules.isError} />
        <ul className="flex flex-col divide-y divide-line">
          {rules.data?.map((r) => (
            <NumberRow key={r.key} label={r.label} unit={r.unit} value={String(r.value)} onSave={async (v) => { await updateReminderRule(r.key, Number(v)); await qc.invalidateQueries({ queryKey: ['reminder-rules'] }); }} />
          ))}
        </ul>
      </Section>
    </div>
  );
}

function NumberRow({ label, unit, value, badge, onSave }: { label: string; unit: string | null; value: string; badge?: React.ReactNode; onSave: (v: string) => Promise<void> }) {
  const [v, setV] = useState(value);
  const [state, setState] = useState<'idle' | 'busy' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const shown = unit === 'naira' ? Number(v).toLocaleString('en-NG') : v;
  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="min-w-64 flex-1">
        <p className="font-medium">{label}</p>
        {badge}
      </div>
      <label className="flex items-center gap-2">
        <span className="sr-only">{label}</span>
        {unit === 'naira' && <span aria-hidden>₦</span>}
        <input inputMode="numeric" value={unit === 'naira' ? shown : v} onChange={(e) => { setV(e.target.value.replace(/\D/g, '')); setState('idle'); }} className="tabular min-h-12 w-40 rounded-md border-2 border-line-strong bg-surface px-3 text-right text-lg" />
        {unit && unit !== 'naira' && <span className="text-ink-muted">{unit}</span>}
      </label>
      <Button variant="secondary" busy={state === 'busy'} disabled={v === value || !v} onClick={async () => { setState('busy'); setError(null); try { await onSave(v); setState('saved'); } catch (e) { setError(messageFor(e)); setState('idle'); } }}>
        Save
      </Button>
      {state === 'saved' && <span role="status" className="font-medium text-status-operational">Saved</span>}
      {error && <p role="alert" className="w-full text-danger">{error}</p>}
    </li>
  );
}
