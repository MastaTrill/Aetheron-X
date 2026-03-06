export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-24 sm:px-10 lg:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Aetheron-X
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Build and launch AetherX faster with a clean, focused foundation.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          This is the first landing shell for the project. Use it as the base for
          product messaging, onboarding, and feature rollout.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-foreground dark:border-zinc-700"
          >
            Open Dashboard
          </a>
          <a
            href="/docs"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-foreground dark:border-zinc-700"
          >
            View Docs
          </a>
          <a
            href="/account"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-foreground dark:border-zinc-700"
          >
            Account
          </a>
        </div>

        <section id="next-steps" className="grid gap-4 pt-6 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Define Core Pages</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Add routes for dashboard, docs, and account flows.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Wire Authentication</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Connect sign in and role-aware access controls.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-base font-semibold">Ship API Surface</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Add backend routes for data and automation tasks.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">API Quick Reference</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Core endpoints available for auth, data, and automation.
          </p>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="font-medium">POST /api/auth/login</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {`{ "email": "admin@aetherx.local", "password": "...", "rememberMe": true }`}
              </p>
            </article>

            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="font-medium">GET /api/data</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                Returns task summary metrics for the signed-in user.
              </p>
            </article>

            <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:col-span-2">
              <p className="font-medium">POST /api/automation/run</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {`{ "action": "seed-weekly-plan" }`} or {`{ "action": "clear-completed" }`} (admin role required)
              </p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
