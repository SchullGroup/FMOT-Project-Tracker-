import Link from 'next/link';

/** For routes whose screens come in a later web step. Remove as each is built. */
export function Placeholder({ title, step, children }: { title: string; step: string; children?: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-semibold text-brand-900">{title}</h1>
      <p className="mt-4 text-lg">This screen is built in {step}.</p>
      {children}
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center font-semibold text-brand-900 underline underline-offset-4">
        Back to the map
      </Link>
    </main>
  );
}
