import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf6_0%,#fff9e8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ring-1 ring-amber-100">
              Built for fast-moving teams
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-black tracking-tight sm:text-6xl">
                Team Task Manager
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                A clean workspace for projects, task ownership, and progress tracking. Keep every team member aligned without the clutter.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:border-amber-300 hover:bg-amber-50"
              >
                Signup
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Projects", "Plan work with structure"],
                ["Tasks", "Track status in real time"],
                ["Teams", "Assign ownership clearly"]
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-sm font-semibold text-amber-700">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[470px]">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[34px] bg-amber-200/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-amber-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <div className="border-b border-amber-100 bg-[#fff6d6] px-8 py-7">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Quick access</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Jump into your workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use the login flow to continue into your dashboard and manage projects.
                </p>
              </div>

              <div className="space-y-4 px-8 py-7">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Today</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">Design review</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">In progress</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
                  <p className="text-sm font-semibold text-amber-700">Get started</p>
                  <div className="mt-3 flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Sign in now
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-full border border-amber-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-amber-50"
                    >
                      Create an account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
