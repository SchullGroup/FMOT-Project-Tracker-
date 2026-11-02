import type { ReactNode } from 'react';
import { ProjectFrame } from '@/components/project/ProjectFrame';

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <ProjectFrame>{children}</ProjectFrame>;
}
