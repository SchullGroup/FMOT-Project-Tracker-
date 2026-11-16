'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { QueryState, Section } from '@/components/ui/Section';
import Link from 'next/link';
import { EXPERIMENTAL_LABEL } from '@/components/flags/WhereToLook';
import { getReminderRules, getSatelliteUsage, getSettings, updateReminderRule, updateSetting, updateSwitchSetting } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';

/** S7 and settings: the numbers the system works by. Several still need the ministry's decision. */
export default function SettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const rules = useQuery({ queryKey: ['reminder-rules'], queryFn: getReminderRules });
  const satellite = useQuery({ queryKey: ['satellite-usage'], queryFn: getSatelliteUsage });
  const usage = satellite.data;
  // Experimental switches (true/false) have their own section; the rest are numbers.
  const isSwitch = (key: string) => key.startsWith('experimental.');
  const flagsSwitch = settings.data?.find((s) => s.key === 'experimental.change_flags');

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-semibold text-brand-900">Settings and reminders</h1>
      <Section title="Limits and checks">
        <QueryState loading={settings.isPending} error={settings.isError} />
        <ul className="flex flex-col divide-y divide-line">
          {settings.data?.filter((s) => !isSwitch(s.key)).map((s) => (
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
      <div id="satellite">
        <Section title="Satellite pictures">
          <QueryState loading={satellite.isPending} error={satellite.isError} />
          {usage && !usage.configured && <p>No Copernicus account is set up, so no new pictures are looked for or drawn (docs/operations.md).</p>}
          {usage?.configured && (
            <div className="flex flex-col gap-3">
              {usage.paused && <p role="status" className="rounded-md bg-[#fff4e0] p-3 font-semibold text-[#7a4a00]">New pictures paused until next month</p>}
              <p>
                This month: <strong className="tabular">{usage.processingUnits.toLocaleString('en-GB')}</strong> of {usage.limit.toLocaleString('en-GB')} processing units used drawing {usage.tilesDrawn.toLocaleString('en-GB')} picture tiles ({usage.requests.toLocaleString('en-GB')} requests to Copernicus).
              </p>
              <div aria-hidden className="h-2 overflow-hidden rounded-full bg-line"><div className={`h-full ${usage.paused ? 'bg-status-stalled' : 'bg-brand-900'}`} style={{ width: `${Math.min(100, (100 * usage.processingUnits) / Math.max(1, usage.limit))}%` }} /></div>
              <p className="text-sm text-ink-muted">Tiles already drawn are kept and always show. Above the limit no new tiles are drawn until the 1st of next month. The limit is SATELLITE_PU_MONTHLY_LIMIT on the server; the free Copernicus plan on this account allows 30,000 a month.</p>
            </div>
          )}
        </Section>
      </div>
      {flagsSwitch && (
        <div id="experimental" className="scroll-mt-4">
          <Section title="Experimental" aside={<span className="rounded bg-[#fff4e0] px-2 py-0.5 text-sm font-semibold text-[#7a4a00]">{EXPERIMENTAL_LABEL}</span>}>
            <ExperimentalSwitch
              on={flagsSwitch.value === 'true'}
              label="Where to look: satellite change flags"
              help={
                <>
                  Automatic flags from free 10 m pictures, per 500 m of line, for you only (not the Director, project managers or resident engineers) on <Link href="/admin/experimental" className="font-semibold underline underline-offset-4">Experimental</Link>. While on, the nightly run works them out after new pictures arrive (about two Copernicus requests per 500 m of line each time).
                </>
              }
              onChange={async (v) => { await updateSwitchSetting(flagsSwitch.key, v); await qc.invalidateQueries({ queryKey: ['settings'] }); await qc.invalidateQueries({ queryKey: ['change-flag-projects'] }); }}
            />
          </Section>
        </div>
      )}
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

function ExperimentalSwitch({ on, label, help, onChange }: { on: boolean; label: string; help: React.ReactNode; onChange: (v: boolean) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={busy}
        onClick={async () => { setBusy(true); setError(null); try { await onChange(!on); } catch (e) { setError(messageFor(e)); } finally { setBusy(false); } }}
        className="flex min-h-12 items-center gap-3 self-start rounded px-1 text-left font-medium hover:bg-brand-50 disabled:opacity-60"
      >
        <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-900' : 'bg-line-strong'}`}>
          <span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
        </span>
        {label}: {on ? 'on' : 'off'}
      </button>
      <p className="max-w-2xl text-sm text-ink-muted">{help}</p>
      {error && <p role="alert" className="text-danger">{error}</p>}
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
