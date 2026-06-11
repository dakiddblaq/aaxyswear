import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/success")({
  validateSearch: (s) => z.object({ order: z.string().default("") }).parse(s),
  head: () => ({ meta: [{ title: "Payment Successful — AXYS Wear" }] }),
  component: SuccessPage,
});

type Order = {
  orderId: string; status: string; product: string; color: string; size: string;
  qty: number; subtotal: number; deliveryFee: number; total: number;
  customer: { firstName: string; lastName: string; street: string; apartment: string; city: string; province: string; postal: string; country: string };
};

function SuccessPage() {
  const { order } = Route.useSearch();
  const [data, setData] = useState<Order | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("axys:lastOrder");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const addr = data?.customer;
  const address = addr ? [addr.street, addr.apartment, addr.city, addr.province, addr.postal, addr.country].filter(Boolean).join(", ") : "—";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[900px] px-5 py-16 md:px-10 md:py-24">
        <div className="eyebrow">Order Confirmed</div>
        <h1 className="mt-3 font-display text-5xl font-black uppercase md:text-6xl">Payment Successful</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Thank you for shopping with AXYS Wear. Your order has been received and is being prepared.
        </p>

        <div className="mt-10 border border-border bg-white p-6 md:p-8">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <Detail k="Order Number" v={order || data?.orderId || "—"} />
            <Detail k="Payment Status" v={data?.status ?? "Awaiting Payment"} />
            <Detail k="Product" v={data?.product ?? "—"} />
            <Detail k="Color" v={data?.color ?? "—"} />
            <Detail k="Size" v={data?.size ?? "—"} />
            <Detail k="Quantity" v={data ? String(data.qty) : "—"} />
            <Detail k="Delivery Address" v={address} full />
            {data && <Detail k="Total" v={`R${data.total}`} full />}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#" className="btn-primary">Track Order</a>
          <Link to="/" className="btn-outline">Continue Shopping</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Detail({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="eyebrow mb-1">{k}</div>
      <div className="text-foreground">{v}</div>
    </div>
  );
}
