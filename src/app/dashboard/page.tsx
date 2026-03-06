import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import TasksManager from '../../components/TasksManager';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Dashboard
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Signed in as <span className="font-medium">{session.email}</span> (
          {session.role}).
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Docs
          </Link>
          <Link
            href="/account"
            className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Account
          </Link>
        </div>

        <TasksManager />

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
