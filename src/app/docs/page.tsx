import Link from 'next/link';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken, hasRole } from '@/lib/auth';

export default async function DocsPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const isAdmin = hasRole(session, 'admin');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Docs</p>
        <h1 className="text-4xl font-semibold tracking-tight">Aetheron-X Documentation</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Product docs for dashboard usage, account flow, and API endpoints.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">Core Pages</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
              <li>
                <Link href="/dashboard" className="underline underline-offset-4">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account" className="underline underline-offset-4">
                  Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="underline underline-offset-4">
                  Sign In
                </Link>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">API Surface</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
              <li>/api/tasks</li>
              <li>/api/data</li>
              <li>/api/automation/run {isAdmin ? '(admin available)' : '(admin required)'}</li>
            </ul>
          </article>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700">
            Home
          </Link>
          <Link href="/dashboard" className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700">
            Dashboard
          </Link>
          <Link href="/account" className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700">
            Account
          </Link>
        </div>
      </section>
    </main>
  );
}
