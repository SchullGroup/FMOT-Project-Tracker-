/**
 * The picture for an item from site that has no photo: a daily report (its answers), or an incident sent as a voice note.
 * An icon and a line in the space a photo would take, so a card never shows an empty box.
 */
export function NoPhotoTile({ kind, line, className = '' }: { kind: 'daily_report' | 'incident' | 'photo' | 'milestone_claim'; line?: string | null; className?: string }) {
  const report = kind === 'daily_report';
  return (
    <div role="img" aria-label={report ? `Daily report${line ? `: ${line}` : ''}` : 'Sent as a voice note'} className={`grid aspect-[4/3] w-full place-items-center rounded-md bg-brand-50 p-3 text-center text-brand-900 ${className}`}>
      <span className="flex flex-col items-center gap-1.5">
        {report ? (
          // A clipboard: the day's report.
          <svg aria-hidden viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4.5h6V3H9z" />
            <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
          </svg>
        ) : (
          // A microphone: sent as a voice note.
          <svg aria-hidden viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
          </svg>
        )}
        <span className="text-sm font-semibold">{report ? 'Daily report' : 'Voice note'}</span>
        {line && <span className="line-clamp-2 text-xs text-ink-muted">{line}</span>}
      </span>
    </div>
  );
}
