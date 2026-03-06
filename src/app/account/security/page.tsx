import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export default async function AccountSecurityPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Account Security</p>
        <h1 className="text-4xl font-semibold tracking-tight">Security Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Signed in as <span className="font-medium">{session.email}</span>. Use remember-me in sign in to control session duration.
        </p>

        <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Session</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Active role: <span className="font-medium capitalize">{session.role}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Expires: {new Date(session.exp * 1000).toLocaleString()}
          </p>
        </article>

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Sign out of this session
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Link href="/account" className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700">
            Back to Account
          </Link>
          <Link href="/dashboard" className="rounded-full border border-zinc-300 px-5 py-2 text-sm dark:border-zinc-700">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
