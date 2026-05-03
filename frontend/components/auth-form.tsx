"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const isSignup = mode === "signup";

  const passwordChecks = {
    minLength: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    numeric: /\d/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue)
  };
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      role: String(form.get("role") ?? "MEMBER"),
      password: String(form.get("password") ?? "")
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Authentication failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto w-full max-w-[410px] overflow-hidden rounded-[32px] border border-amber-100 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
      <div className="border-b border-amber-100 bg-[#fff8db] px-8 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-900">Team Task Manager</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-black">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-800">
          {isSignup ? "Set up your workspace in a minute." : "Sign in to manage projects and tasks."}
        </p>
      </div>

      <div className="px-8 py-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {isSignup && (
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="firstName"
                placeholder="First name"
                minLength={2}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white"
              />
              <input
                name="lastName"
                placeholder="Last name"
                minLength={2}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white"
              />
            </div>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{isSignup ? "Sign up as" : "Login as"}</label>
            <select
              id="authRole"
              name="role"
              defaultValue="MEMBER"
              aria-label={isSignup ? "Sign up as role" : "Login as role"}
              title={isSignup ? "Sign up as role" : "Login as role"}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition focus:border-amber-300 focus:bg-white"
            >
              <option value="MEMBER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={8}
            required
            onChange={(event) => setPasswordValue(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white"
          />

          {isSignup && (
            <div className="grid gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-xs">
              <p className={passwordChecks.minLength ? "text-emerald-700" : "text-rose-600"}>• At least 8 characters</p>
              <p className={passwordChecks.uppercase ? "text-emerald-700" : "text-rose-600"}>• At least 1 uppercase letter</p>
              <p className={passwordChecks.numeric ? "text-emerald-700" : "text-rose-600"}>• At least 1 number</p>
              <p className={passwordChecks.special ? "text-emerald-700" : "text-rose-600"}>• At least 1 special symbol</p>
            </div>
          )}

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

          <button
            type="submit"
            disabled={loading || (isSignup && !isPasswordStrong)}
            className="w-full rounded-full bg-amber-400 px-4 py-3 text-[16px] font-semibold text-slate-950 shadow-[0_12px_28px_rgba(245,158,11,0.2)] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Working..." : isSignup ? "Sign up" : "Sign in"}
          </button>

          {!isSignup ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <a href="#" className="font-medium text-amber-700 hover:underline">
                Forgot Password
              </a>
              <Link href="/signup" className="font-medium text-slate-600 hover:text-slate-900">
                New here? Sign up
              </Link>
            </div>
          ) : (
            <p className="text-center text-sm leading-6 text-slate-600">
              By creating an account, you agree to our{" "}
              <a href="#" className="font-medium text-amber-700 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="font-medium text-amber-700 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </form>
      </div>

    </section>
  );
}
