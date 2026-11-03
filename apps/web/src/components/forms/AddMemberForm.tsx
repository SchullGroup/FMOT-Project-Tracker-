'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { addProjectMember, findUsers } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import { roleLabel } from '@/lib/roles';
import type { RoleCode } from '@fmot/shared';
import type { Lot } from '@/lib/types';

const PROJECT_ROLES: RoleCode[] = ['nrc_project_engineer', 'procurement_officer', 'legal_officer', 'finance_officer'];
const LOT_ROLES: RoleCode[] = ['consultant_resident_engineer', 'contractor_site_manager', 'contractor_commercial_manager'];

/*
 * Put a person who already has an account on this project (or one lot). New
 * people are created by the IT administrator first. People from outside the
 * ministry wait for the Director's confirmation.
 */
export function AddMemberForm({ projectId, lots, open, onClose, onDone }: { projectId: string; lots: Lot[]; open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const qc = useQueryClient();
  const [role, setRole] = useState<RoleCode | ''>('');
  const [userId, setUserId] = useState('');
  const [lotId, setLotId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const people = useQuery({ queryKey: ['users', role], queryFn: () => findUsers(role as RoleCode), enabled: open && Boolean(role) });
  const lotLevel = role !== '' && LOT_ROLES.includes(role);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (role === '' || !userId || (lotLevel && !lotId)) return setError(lotLevel ? 'Choose the role, the person and the lot.' : 'Choose the role and the person.');
    setBusy(true);
    setError(null);
    try {
      const added = await addProjectMember(projectId, { userId, role, lotId: lotLevel ? lotId : null });
      await qc.invalidateQueries({ queryKey: ['people', projectId] });
      const name = people.data?.find((p) => p.id === userId)?.name ?? 'The person';
      setRole('');
      setUserId('');
      setLotId('');
      const where = lotLevel ? lots.find((l) => l.id === lotId)?.name ?? 'the lot' : 'the project';
      onDone(added?.requiresDirectorConfirmation ? `${name} is added to ${where}. They are from outside the ministry, so the Director confirms them first.` : `${name} is added to ${where}.`);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="Add a member" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="add-member" busy={busy}>Add to the project</Button></>}>
      <form id="add-member" onSubmit={submit} className="flex flex-col gap-5">
        <Select label="Role on this project" value={role} onChange={(e) => { setRole(e.target.value as RoleCode | ''); setUserId(''); }}>
          <option value="">Choose a role</option>
          <optgroup label="Whole project">{PROJECT_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}</optgroup>
          <optgroup label="One lot">{LOT_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}</optgroup>
        </Select>
        <Select label="Person" hint="Only people who already have an account. The IT administrator adds new people." disabled={!role} value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">{role ? 'Choose a person' : 'Choose the role first'}</option>
          {people.data?.map((p) => <option key={p.id} value={p.id}>{p.name}, {p.organisation}</option>)}
        </Select>
        {lotLevel && (
          <Select label="Lot" value={lotId} onChange={(e) => setLotId(e.target.value)}>
            <option value="">{lots.length ? 'Choose a lot' : 'No lots yet'}</option>
            {lots.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
        {error && <p role="alert" className="text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}
