import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-900">This page does not exist</h1>
      <p className="mt-4 text-lg">The link may be old, or the project may not be visible to you.</p>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center font-semibold text-brand-900 underline underline-offset-4">
        Go to the map
      </Link>
    </main>
  );
}
