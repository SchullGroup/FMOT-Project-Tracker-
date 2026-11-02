'use client';

import { useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getDocumentUrl, getDocuments, getObligations } from '@/lib/endpoints';
import { formatDate, lowerFirst } from '@/lib/format';

/*
 * W5.8 Documents, grouped by gate. The API only returns documents the person
 * may see (by sensitivity), so nothing is hidden here.
 */
export default function DocumentsPage() {
  const id = useProjectId();
  const groups = useQuery({ queryKey: ['documents', id], queryFn: () => getDocuments(id) });
  const obligations = useQuery({ queryKey: ['obligations', id], queryFn: () => getObligations(id), retry: false });

  async function open(documentId: string) {
    const { url } = await getDocumentUrl(documentId);
    if (url && url !== '#') window.open(url, '_blank', 'noopener');
  }

  return (
    <div className="flex flex-col gap-5">
      {obligations.data && obligations.data.length > 0 && (
        <Section title="Bonds, guarantees and conditions that expire">
          <Table head={['What', 'Expires', 'Left', 'Looked after by']}>
            {[...obligations.data].sort((a, b) => a.expiresOn.localeCompare(b.expiresOn)).map((o) => {
              const days = Math.ceil((new Date(o.expiresOn).getTime() - Date.now()) / 86_400_000);
              const tone = days < 0 ? 'text-status-stalled font-semibold' : days <= 7 ? 'text-status-stalled font-semibold' : days <= 30 ? 'text-status-construction font-semibold' : '';
              return (
                <tr key={o.id}>
                  <td>{o.title}{o.documentCode && <span className="block text-sm text-ink-muted">Document {o.documentCode}</span>}</td>
                  <td className="tabular whitespace-nowrap">{formatDate(o.expiresOn)}</td>
                  <td className={`tabular whitespace-nowrap ${tone}`}>{days < 0 ? `Expired ${-days} days ago` : `${days} days`}</td>
                  <td>{o.owner}</td>
                </tr>
              );
            })}
          </Table>
          <p className="mt-2 text-sm text-ink-muted">The owner gets a text 30 days and 7 days before each expiry.</p>
        </Section>
      )}
      <QueryState loading={groups.isPending} error={groups.isError} empty={groups.data?.length === 0} emptyText="No documents yet." />
      {groups.data?.map((g) => (
        <Section key={g.gateNo ?? g.gateName} title={g.gateNo ? `Gate ${g.gateNo}, ${lowerFirst(g.gateName)}` : g.gateName}>
          <Table head={['Code', 'Document', 'Version', 'Uploaded by', 'Date', '']}>
            {g.documents.map((d) => (
              <tr key={d.id}>
                <td className="tabular font-semibold">{d.code}</td>
                <td>{d.title}</td>
                <td className="tabular">{d.version}</td>
                <td>{d.uploadedBy}</td>
                <td className="tabular whitespace-nowrap">{formatDate(d.uploadedAt)}</td>
                <td>
                  <button type="button" onClick={() => open(d.id)} className="min-h-11 rounded-md px-3 font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      ))}
    </div>
  );
}
