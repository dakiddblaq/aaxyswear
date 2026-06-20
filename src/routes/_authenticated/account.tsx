import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { PASSWORD_RULES, passwordSchema, passwordStrength } from "@/lib/auth-helpers";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account · AXYS" }] }),
  component: AccountPage,
});

type Event = {
  id: string;
  event_type: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        setEmail(u.user.email ?? "");
        setEmailVerified(!!u.user.email_confirmed_at);
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle();
        setFullName(p?.full_name ?? "");
      }
      const { data: ev } = await supabase
        .from("security_events")
        .select("id,event_type,ip,user_agent,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setEvents((ev as Event[]) ?? []);
    })();
  }, []);

  async function signOutAll() {
    setBusy("global");
    await supabase.auth.signOut({ scope: "global" } as any);
    navigate({ to: "/auth", search: { mode: "signin", redirect: "/" }, replace: true });
  }
  async function signOut() {
    setBusy("local");
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <div className="mb-10">
          <div className="eyebrow">Account</div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase">Security Settings</h1>
        </div>

        <section className="mb-10 border border-border bg-white p-6">
          <h2 className="font-display text-lg font-bold uppercase">Profile</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Name" v={fullName || "—"} />
            <Row k="Email" v={email} />
            <Row k="Email Verified" v={emailVerified ? "Yes" : "No"} />
          </dl>
        </section>

        <section className="mb-10 border border-border bg-white p-6">
          <h2 className="font-display text-lg font-bold uppercase">Change Password</h2>
          <ChangePasswordForm onDone={(m) => setMsg(m)} />
          {msg && <p className="mt-3 text-xs text-muted-foreground">{msg}</p>}
        </section>

        <section className="mb-10 border border-border bg-white p-6">
          <h2 className="font-display text-lg font-bold uppercase">Active Sessions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign out from this device, or sign out everywhere if you suspect unauthorized access.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={signOut} disabled={busy !== null} className="btn-outline">
              {busy === "local" ? "…" : "Sign Out"}
            </button>
            <button onClick={signOutAll} disabled={busy !== null} className="btn-primary">
              {busy === "global" ? "…" : "Sign Out All Devices"}
            </button>
          </div>
        </section>

        <section className="border border-border bg-white p-6">
          <h2 className="font-display text-lg font-bold uppercase">Recent Activity</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between gap-4 py-2">
                  <div>
                    <div className="font-medium uppercase tracking-wide">{e.event_type.replace(/_/g, " ")}</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    {e.ip ?? ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ChangePasswordForm({ onDone }: { onDone: (msg: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = passwordStrength(pwd);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse(pwd);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Password too weak.");
      return;
    }
    if (pwd !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: upErr } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setPwd("");
    setConfirm("");
    onDone("Password updated. Other sessions will be signed out automatically.");
    supabase.auth.signOut({ scope: "others" } as any).catch(() => undefined);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div>
        <label className="eyebrow mb-2 block">New Password</label>
        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="input-axys" autoComplete="new-password" />
        {pwd && (
          <div className="mt-2 space-y-1">
            <div className="h-1 w-full overflow-hidden bg-secondary">
              <div className="h-full bg-foreground transition-all" style={{ width: `${s.pct}%` }} />
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(pwd);
                return <li key={r.label} className={`text-[10px] ${ok ? "text-foreground" : "text-muted-foreground"}`}>{ok ? "✓" : "○"} {r.label}</li>;
              })}
            </ul>
          </div>
        )}
      </div>
      <div>
        <label className="eyebrow mb-2 block">Confirm Password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-axys" autoComplete="new-password" />
      </div>
      {error && <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
