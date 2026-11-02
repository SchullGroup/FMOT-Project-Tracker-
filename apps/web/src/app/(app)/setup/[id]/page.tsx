'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Wizard } from '@/components/wizard/Wizard';

function Setup() {
  const { id } = useParams<{ id: string }>();
  const step = Math.min(6, Math.max(1, Number(useSearchParams().get('step') ?? 1)));
  return <Wizard draftId={id} step={step} />;
}

/** W6 steps 1 to 6 for an existing draft. */
export default function SetupPage() {
  return (
    <Suspense>
      <Setup />
    </Suspense>
  );
}
