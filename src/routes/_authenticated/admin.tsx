import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · AXYS" }] }),
  component: AdminPage,
});

type Order = {
  id: string;
  order_ref: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  total: number;
  shipping_method: string;
  status: string;
  created_at: string;
  customer: { full_name?: string; email?: string; phone?: string } | null;
};

function AdminPage() {
  const [state, setState] = useState<"checking" | "denied" | "ready">("checking");
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setState("denied");
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      if (error || !isAdmin) return setState("denied");
      setState("ready");
      const { data, error: e2 } = await supabase
        .from("orders")
        .select("id, order_ref, product_name, size, color, quantity, total, shipping_method, status, created_at, customer")
        .order("created_at", { ascending: false })
        .limit(200);
      if (e2) setErr(e2.message);
      else setOrders((data as Order[]) ?? []);
    })();
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1200px] px-5 py-20 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground md:px-10">
          Verifying access…
        </main>
        <Footer />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[700px] px-5 py-24 text-center md:px-10">
          <h1 className="font-display text-4xl font-black uppercase tracking-[0.18em]">Access Denied</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">
            This area is reserved for AXYS administrators.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block border border-foreground px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] hover:bg-foreground hover:text-background"
          >
            Back to store
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-5 py-12 md:px-10">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">AXYS · Admin</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[0.16em]">Orders</h1>
        </div>

        {err && (
          <div className="mb-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs uppercase tracking-[0.18em] text-destructive">
            {err}
          </div>
        )}

        {orders.length === 0 ? (
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Shipping</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-mono">{o.order_ref}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer?.full_name ?? "—"}</div>
                      <div className="text-muted-foreground">{o.customer?.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.product_name}</div>
                      <div className="text-muted-foreground">
                        {[o.size, o.color].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3 uppercase tracking-[0.14em]">{o.shipping_method}</td>
                    <td className="px-4 py-3 font-semibold">R{o.total}</td>
                    <td className="px-4 py-3 uppercase tracking-[0.14em]">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
