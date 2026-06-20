import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify Email · AXYS" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const [status, setStatus] = useState<"checking" | "verified" | "pending">("checking");
  const [email, setEmail] = useState<string>("");
  const [resendState, setResendState] = useState<{ loading: boolean; sent: boolean; error: string | null }>(
    { loading: false, sent: false, error: null },
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) {
        setStatus("pending");
        return;
      }
      setEmail(u.email ?? "");
      setStatus(u.email_confirmed_at ? "verified" : "pending");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user;
      if (u?.email_confirmed_at) setStatus("verified");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function resend() {
    if (!email) return;
    setResendState({ loading: true, sent: false, error: null });
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/verify` : undefined;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error && !/rate/i.test(error.message)) {
      setResendState({ loading: false, sent: false, error: "Could not resend. Try again later." });
      return;
    }
    setResendState({ loading: false, sent: true, error: null });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="eyebrow">Email Verification</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase">
            {status === "verified" ? "Verified" : "Verify Email"}
          </h1>
        </div>

        <div className="border border-border bg-white p-6 text-center">
          {status === "checking" && <p className="text-sm text-muted-foreground">Checking your link…</p>}
          {status === "verified" && (
            <>
              <p className="text-sm">Your email is verified. You're ready to shop.</p>
              <Link to="/" className="btn-primary mt-6 inline-block">
                Continue
              </Link>
            </>
          )}
          {status === "pending" && (
            <>
              <p className="text-sm text-muted-foreground">
                {email
                  ? <>We sent a verification link to <span className="text-foreground">{email}</span>. Click it to activate your account.</>
                  : "Open the verification link from your inbox to activate your account."}
              </p>
              {email && (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resendState.loading || resendState.sent}
                  className="btn-secondary mt-6 w-full"
                >
                  {resendState.sent ? "Sent — check your inbox" : resendState.loading ? "Sending…" : "Resend Email"}
                </button>
              )}
              {resendState.error && (
                <div className="mt-3 text-xs text-destructive">{resendState.error}</div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
