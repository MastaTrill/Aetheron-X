import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Account
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Your Account</h1>

        <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium">{session.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Role</dt>
              <dd className="font-medium capitalize">{session.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Session Expires</dt>
              <dd className="font-medium">
                {new Date(session.exp * 1000).toLocaleString()}
              </dd>
            </div>
          </dl>
        </article>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/account/security"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
          >
            Security
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
          >
            Dashboard
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700"
          >
            Docs
          </Link>
        </div>
      </section>
    </main>
  );
}
