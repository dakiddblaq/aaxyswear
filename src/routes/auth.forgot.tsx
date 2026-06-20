import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { emailSchema } from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Reset Password · AXYS" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Enter a valid email.");
      return;
    }
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/reset` : undefined;
    await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo });
    // Always show the same generic success message to prevent enumeration.
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="eyebrow">Account Recovery</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase">Forgot Password</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your email — we'll send a reset link if an account exists.
          </p>
        </div>
        {done ? (
          <div className="border border-border bg-white p-6 text-center">
            <p className="text-sm">
              If an account exists for that email, a reset link is on the way. Check your inbox.
            </p>
            <Link to="/auth" search={{ mode: "signin", redirect: "/" }} className="btn-primary mt-6 inline-block">
              Back To Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="eyebrow mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-axys"
                required
                autoComplete="email"
              />
            </div>
            {error && <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <Link to="/auth" search={{ mode: "signin", redirect: "/" }} className="block text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
              ← Back to sign in
            </Link>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
