import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async (userId: string | undefined) => {
      if (!userId) return setIsAdmin(false);
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      setIsAdmin(!!data);
    };
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      check(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      check(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="font-display text-xl font-black tracking-[0.2em]">
          AXYS
        </Link>
        <nav className="flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground md:gap-8">
          <a href="/#about" className="hover:text-muted-foreground">About</a>
          {authed ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hover:text-muted-foreground">Admin</Link>
              )}
              <Link to="/account" className="hover:text-muted-foreground">Account</Link>
              <button onClick={signOut} className="hover:text-muted-foreground">Sign Out</button>
            </>
          ) : (
            <Link to="/auth" search={{ mode: "signin", redirect: "/" }} className="hover:text-muted-foreground">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
