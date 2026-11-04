'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { Select } from '@/components/ui/Select';
import { QueryState, Table } from '@/components/ui/Section';
import { createUser, deactivateUser, getAdminUsers, getOrganisations, getProjectsForPicker, resendInvite, resetPin } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import { NEEDS_DIRECTOR, ROLES_BY_ORG } from '@/lib/org-roles';
import { roleLabel } from '@/lib/roles';
import { formatPhone } from '@/lib/status';
import type { AdminUser, NewUser } from '@/lib/types';

const STATUS: Record<AdminUser['status'], { tone: 'good' | 'info' | 'bad' | 'neutral'; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  invited: { tone: 'info', label: 'Invited' },
  locked: { tone: 'bad', label: 'Locked' },
  deactivated: { tone: 'neutral', label: 'Deactivated' },
};

/** S2 People: everyone with an account, adding people, and fixing access. */
export default function UsersPage() {
  const users = useQuery({ queryKey: ['admin-users'], queryFn: () => getAdminUsers() });
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return (users.data ?? []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.organisation.name.toLowerCase().includes(q) || (digits && u.phone.includes(digits.replace(/^0/, ''))));
  }, [users.data, search]);
  const open = users.data?.find((u) => u.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brand-900">People</h1>
          <p className="text-ink-muted">Everyone with an account. Choose a person to resend their invite, reset their PIN or remove their access.</p>
        </div>
        <Button onClick={() => setAdding(true)}>Add a person</Button>
      </div>

      {notice && <p role="status" className="rounded-md bg-[#e3f1e6] p-4 font-medium text-[#1f5a2b]">{notice}</p>}

      <div className="max-w-md">
        <Field label="Find a person" type="search" placeholder="Name, organisation or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <QueryState loading={users.isPending} error={users.isError} empty={shown.length === 0} emptyText="Nobody matches." />
      {shown.length > 0 && (
        <Table head={['Person', 'Organisation and role', 'Status', 'Last signed in', 'Open tasks']}>
          {shown.map((u) => (
            <tr key={u.id}>
              <td>
                <button type="button" onClick={() => setOpenId(u.id)} className="min-h-11 text-left font-semibold text-brand-900 underline underline-offset-4">{u.name}</button>
                <span className="block text-sm tabular text-ink-muted">{formatPhone(u.phone)}</span>
              </td>
              <td>{u.organisation.name}<span className="block text-sm text-ink-muted">{roleLabel(u.role)}</span></td>
              <td>
                <Pill tone={STATUS[u.status].tone}>{STATUS[u.status].label}</Pill>
                {u.awaitingDirector && <span className="mt-1 block text-sm text-ink-muted">Waiting for the Director</span>}
              </td>
              <td className="tabular whitespace-nowrap">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}</td>
              <td className="tabular">{u.openTasks}</td>
            </tr>
          ))}
        </Table>
      )}

      <AddPerson open={adding} onClose={() => setAdding(false)} onAdded={(u) => { setAdding(false); setNotice(u.awaitingDirector ? `${u.name} is added. The Director confirms the account, then the invite text goes out.` : u.codeChannel === 'email' && u.email ? `${u.name} is added and the invite email has gone to ${u.email}.` : `${u.name} is added and the invite text has gone to ${formatPhone(u.phone)}.`); }} />
      <PersonDrawer user={open} people={users.data ?? []} onClose={() => setOpenId(null)} onDone={(m) => { setOpenId(null); setNotice(m); }} />
    </div>
  );
}

const EMPTY: NewUser = { name: '', phone: '', email: '', codeChannel: 'sms', organisationId: '', role: '', memberships: [] };

function AddPerson({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (u: AdminUser) => void }) {
  const qc = useQueryClient();
  const orgs = useQuery({ queryKey: ['organisations'], queryFn: getOrganisations, enabled: open });
  const projects = useQuery({ queryKey: ['admin-projects'], queryFn: getProjectsForPicker, enabled: open });
  const [form, setForm] = useState<NewUser>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const org = orgs.data?.find((o) => o.id === form.organisationId);
  const roles = org ? ROLES_BY_ORG[org.type] : [];
  const isMember = (projectId: string, lotId: string | null) => form.memberships.some((m) => m.projectId === projectId && m.lotId === lotId);
  const toggle = (projectId: string, lotId: string | null) =>
    setForm((f) => ({ ...f, memberships: isMember(projectId, lotId) ? f.memberships.filter((m) => !(m.projectId === projectId && m.lotId === lotId)) : [...f.memberships, { projectId, lotId }] }));
  const lotLevel = form.role === 'contractor_site_manager' || form.role === 'contractor_commercial_manager' || form.role === 'consultant_resident_engineer';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.organisationId || !form.role) return setError('Fill in the name, phone, organisation and role.');
    if (form.codeChannel === 'email' && !form.email.trim()) return setError('To send codes by email, enter the email address.');
    setBusy(true);
    setError(null);
    try {
      const u = await createUser({ ...form, name: form.name.trim(), phone: form.phone.trim() });
      await qc.invalidateQueries({ queryKey: ['admin-users'] });
      setForm(EMPTY);
      onAdded(u);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="Add a person" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="add-person" busy={busy}>Send invite</Button></>}>
      <form id="add-person" onSubmit={submit} className="flex flex-col gap-5">
        <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        <Field label="Mobile number" type="tel" inputMode="tel" placeholder="0803 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Field label="Email address (optional)" type="email" autoComplete="off" placeholder="name@example.com" hint="They can sign in with it instead of the phone number." value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <fieldset>
          <legend className="mb-2 font-semibold">Send the invite and codes by</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(['sms', 'email'] as const).map((c) => (
              <label key={c} className="flex min-h-11 items-center gap-3">
                <input type="radio" name="codeChannel" value={c} checked={form.codeChannel === c} onChange={() => setForm({ ...form, codeChannel: c })} className="size-5 accent-brand-900" />
                {c === 'sms' ? 'Text message (SMS)' : 'Email'}
              </label>
            ))}
          </div>
          <p className="mt-1 text-sm text-ink-muted">When they sign in, the code goes to whatever they type: the number or the email address.</p>
        </fieldset>
        <Select label="Organisation" value={form.organisationId} onChange={(e) => setForm({ ...form, organisationId: e.target.value, role: '', memberships: [] })}>
          <option value="">Choose an organisation</option>
          {orgs.data?.filter((o) => o.active).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <Select label="Role" hint="Only the roles open to this kind of organisation are listed." disabled={!org} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="">{org ? 'Choose a role' : 'Choose the organisation first'}</option>
          {roles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </Select>
        {form.role && (
          <fieldset>
            <legend className="mb-2 font-semibold">{lotLevel ? 'Lots this person works on' : 'Projects (optional)'}</legend>
            <div className="flex flex-col gap-3">
              {projects.data?.map((p) => (
                <div key={p.id}>
                  {!lotLevel || p.lots.length === 0 ? (
                    <label className="flex min-h-11 items-center gap-3">
                      <input type="checkbox" checked={isMember(p.id, null)} onChange={() => toggle(p.id, null)} className="size-5 accent-brand-900" disabled={lotLevel && p.lots.length === 0} />
                      {p.name}{lotLevel && p.lots.length === 0 ? <span className="text-sm text-ink-muted">(no lots yet)</span> : null}
                    </label>
                  ) : (
                    <>
                      <p className="font-medium">{p.name}</p>
                      <div className="ml-2 flex flex-wrap gap-x-5">
                        {p.lots.map((l) => (
                          <label key={l.id} className="flex min-h-11 items-center gap-2">
                            <input type="checkbox" checked={isMember(p.id, l.id)} onChange={() => toggle(p.id, l.id)} className="size-5 accent-brand-900" />
                            {l.name}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        )}
        {org && NEEDS_DIRECTOR.includes(org.type) && (
          <p className="rounded-md bg-brand-50 p-4">People from outside the ministry need the Director&rsquo;s confirmation. The invite text goes out once the Director confirms.</p>
        )}
        {error && <p role="alert" className="font-medium text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}

function PersonDrawer({ user, people, onClose, onDone }: { user: AdminUser | null; people: AdminUser[]; onClose: () => void; onDone: (message: string) => void }) {
  const qc = useQueryClient();
  const [replacement, setReplacement] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const sameOrg = people.filter((p) => p.id !== user.id && p.organisation.id === user.organisation.id && p.status === 'active');

  async function run(action: () => Promise<void>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await qc.invalidateQueries({ queryKey: ['admin-users'] });
      setConfirming(false);
      setReplacement('');
      onDone(message);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open title={user.name} onClose={() => { setConfirming(false); onClose(); }}>
      <div className="flex flex-col gap-6">
        <dl className="grid grid-cols-[9rem_1fr] gap-y-2">
          <dt className="text-ink-muted">Phone</dt><dd className="tabular">{formatPhone(user.phone)}</dd>
          {user.email && <><dt className="text-ink-muted">Email</dt><dd>{user.email}{user.codeChannel === 'email' ? ' (codes by email)' : ''}</dd></>}
          <dt className="text-ink-muted">Organisation</dt><dd>{user.organisation.name}</dd>
          <dt className="text-ink-muted">Role</dt><dd>{roleLabel(user.role)}</dd>
          <dt className="text-ink-muted">Status</dt><dd>{STATUS[user.status].label}</dd>
          <dt className="text-ink-muted">Last signed in</dt><dd className="tabular">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</dd>
          {user.role === 'contractor_site_manager' && (<><dt className="text-ink-muted">Last photo sent</dt><dd className="tabular">{user.lastUploadAt ? formatDate(user.lastUploadAt) : 'Never'}</dd></>)}
          <dt className="text-ink-muted">Works on</dt>
          <dd>{user.memberships.length ? user.memberships.map((m) => `${m.project}${m.lot ? `, ${m.lot}` : ''}`).join('; ') : 'No project yet'}</dd>
        </dl>

        {user.status !== 'deactivated' && (
          <div className="flex flex-col gap-3">
            {user.status === 'invited' && (
              <Button variant="secondary" busy={busy} onClick={() => run(() => resendInvite(user.id), `A new invite has gone to ${user.name}. The old link no longer works.`)}>Resend the invite</Button>
            )}
            {(user.status === 'active' || user.status === 'locked') && (
              <>
                {user.status === 'locked' && <p className="rounded-md bg-[#fbe3e6] p-3">Locked after too many wrong PINs. Resetting the PIN unlocks the account; they will get a code by text and choose a new PIN.</p>}
                <Button variant="secondary" busy={busy} onClick={() => run(() => resetPin(user.id), `${user.name}'s PIN is reset. They will choose a new one at their next sign-in.`)}>Reset the PIN</Button>
              </>
            )}
            {!confirming ? (
              <Button variant="quiet" onClick={() => setConfirming(true)}>Remove this person&rsquo;s access</Button>
            ) : (
              <div className="flex flex-col gap-3 rounded-md border-2 border-danger p-4">
                <p className="font-semibold">Remove {user.name}&rsquo;s access?</p>
                <p>They are signed out everywhere. Their history stays. {user.openTasks > 0 ? `Their ${user.openTasks} open tasks move to the person you choose.` : ''}</p>
                <Select label="Hand their work to" value={replacement} onChange={(e) => setReplacement(e.target.value)}>
                  <option value="">{user.openTasks > 0 ? 'Choose a person' : 'Nobody (no open tasks)'}</option>
                  {sameOrg.map((p) => <option key={p.id} value={p.id}>{p.name}, {roleLabel(p.role)}</option>)}
                </Select>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setConfirming(false)}>Keep access</Button>
                  <Button variant="danger" busy={busy} disabled={user.openTasks > 0 && !replacement} onClick={() => run(() => deactivateUser(user.id, replacement || null), `${user.name} no longer has access.`)}>Remove access</Button>
                </div>
              </div>
            )}
          </div>
        )}
        {error && <p role="alert" className="font-medium text-danger">{error}</p>}
      </div>
    </Drawer>
  );
}
