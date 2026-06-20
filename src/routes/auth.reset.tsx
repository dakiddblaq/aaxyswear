import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { PASSWORD_RULES, passwordSchema, passwordStrength } from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Set New Password · AXYS" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from URL hash on load.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strength = passwordStrength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Password too weak.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: upErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    // Invalidate all other sessions
    await supabase.auth.signOut({ scope: "others" } as any).catch(() => undefined);
    setDone(true);
    setTimeout(() => navigate({ to: "/auth", search: { mode: "signin", redirect: "/" } }), 2200);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="eyebrow">Set New Password</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase">Reset</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Choose a new password. Existing sessions on other devices will be signed out.
          </p>
        </div>

        {!ready ? (
          <div className="border border-border bg-white p-6 text-center text-sm text-muted-foreground">
            Verifying reset link…
          </div>
        ) : done ? (
          <div className="border border-border bg-white p-6 text-center">
            <p className="text-sm">Password updated. Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="eyebrow mb-2 block">New Password</label>
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
                    <div className="h-full bg-foreground transition-all" style={{ width: `${strength.pct}%` }} />
                  </div>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
                    {PASSWORD_RULES.map((r) => {
                      const ok = r.test(password);
                      return (
                        <li key={r.label} className={`text-[10px] ${ok ? "text-foreground" : "text-muted-foreground"}`}>
                          {ok ? "✓" : "○"} {r.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label className="eyebrow mb-2 block">Confirm Password</label>
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-axys"
                required
              />
            </div>
            {error && <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
