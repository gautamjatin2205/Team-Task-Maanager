import { AuthForm } from "@frontend/components/auth-form";

export default function SignupPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fffdf6_0%,#fff9e8_100%)] px-4 py-12 text-slate-900">
      <div className="pointer-events-none absolute -top-24 left-0 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-100/70 blur-3xl" />
      <AuthForm mode="signup" />
    </main>
  );
}
