'use client';

import { Wizard } from '@/components/wizard/Wizard';

/** W6.1: a new project starts here; saving creates the draft and moves to /setup/[id]. */
export default function NewProjectPage() {
  return <Wizard draftId={null} step={1} />;
}
