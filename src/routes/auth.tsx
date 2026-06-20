import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  GENERIC_AUTH_ERROR,
  PASSWORD_RULES,
  passwordStrength,
  signInSchema,
  signUpSchema,
} from "@/lib/auth-helpers";

const searchSchema = z.object({
  redirect: z.string().optional().default("/"),
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign In · AXYS" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect, mode } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">(mode);

  function onAuthSuccess() {
    router.invalidate();
    navigate({ to: redirect || "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="eyebrow">AXYS Members</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase">
            {tab === "signin" ? "Sign In" : "Create Account"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {tab === "signin"
              ? "Welcome back. Sign in to continue."
              : "Join AXYS. One account, every drop."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 border border-border bg-white">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`py-3 text-xs uppercase tracking-[0.18em] ${
              tab === "signin" ? "bg-foreground text-background" : "text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`py-3 text-xs uppercase tracking-[0.18em] ${
              tab === "signup" ? "bg-foreground text-background" : "text-foreground"
            }`}
          >
            Create
          </button>
        </div>

        {tab === "signin" ? <SignInForm onSuccess={onAuthSuccess} /> : <SignUpForm onSuccess={() => setTab("signin")} />}
      </main>
      <Footer />
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = signInSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? GENERIC_AUTH_ERROR);
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (signInError) {
      // Generic to prevent enumeration. Special-case rate limit.
      if (/rate/i.test(signInError.message)) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (/not confirmed/i.test(signInError.message) || /email/i.test(signInError.message) && /confirm/i.test(signInError.message)) {
        setError("Please verify your email before signing in. Check your inbox.");
      } else {
        setError(GENERIC_AUTH_ERROR);
      }
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-axys"
          required
        />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-axys pr-16"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </Field>
      <div className="flex items-center justify-between text-xs">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Remember me</span>
        </label>
        <Link to="/auth/forgot" className="uppercase tracking-[0.14em] hover:underline">
          Forgot?
        </Link>
      </div>
      {error && <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strength = passwordStrength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = signUpSchema.safeParse({ fullName, email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form");
      return;
    }
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/verify` : undefined;
    const { error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (signUpError) {
      // Generic message to prevent account enumeration
      if (/rate/i.test(signUpError.message)) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("We couldn't create your account. Try a different email or stronger password.");
      }
      return;
    }
    setDone(true);
    setTimeout(onSuccess, 4000);
  }

  if (done) {
    return (
      <div className="border border-border bg-white p-6 text-center">
        <div className="eyebrow">Check your inbox</div>
        <h2 className="mt-2 font-display text-2xl font-black uppercase">Verify your email</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We've sent a verification link to <span className="text-foreground">{email}</span>. Click
          it to activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full Name">
        <input
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-axys"
          required
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-axys"
          required
        />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-axys pr-16"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {password && (
          <div className="mt-2 space-y-1.5">
            <div className="h-1 w-full overflow-hidden bg-secondary">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${strength.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Strength</span>
              <span className="text-foreground">{strength.label}</span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(password);
                return (
                  <li
                    key={r.label}
                    className={`text-[10px] ${ok ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {ok ? "✓" : "○"} {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Field>
      <Field label="Confirm Password">
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input-axys"
          required
        />
      </Field>
      {error && <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        By creating an account you agree to AXYS's terms and privacy.
      </p>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow mb-2 block">{label}</label>
      {children}
    </div>
  );
}
