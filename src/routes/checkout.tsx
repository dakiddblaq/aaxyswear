import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PRODUCTS, DELIVERY_FEE, PAYSTACK_URL } from "@/lib/products";

const searchSchema = z.object({
  product: z.string().default(""),
  color: z.string().default(""),
  size: z.string().default(""),
  qty: z.number().min(1).max(10).default(1),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Checkout — AXYS Wear" }] }),
  component: CheckoutPage,
});

type FormState = {
  firstName: string; lastName: string; email: string; phone: string;
  country: string; province: string; city: string; street: string;
  postal: string; apartment: string; notes: string;
};

const initial: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  country: "South Africa", province: "", city: "", street: "",
  postal: "", apartment: "", notes: "",
};

function CheckoutPage() {
  const { product: productId, color, size, qty } = Route.useSearch();
  const navigate = useNavigate();
  const product = useMemo(() => PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0], [productId]);
  const [form, setForm] = useState<FormState>(initial);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const subtotal = product.price * qty;
  const total = subtotal + DELIVERY_FEE;

  function set<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[\d+\-\s()]{7,}$/.test(form.phone)) e.phone = "Valid phone required";
    if (!form.country.trim()) e.country = "Required";
    if (!form.province.trim()) e.province = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.postal.trim()) e.postal = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    if (!confirmed) {
      setErrors((p) => ({ ...p, confirm: "Please confirm your order details before proceeding." }));
      return;
    }
    setLoading(true);
    const orderId = "AXYS-" + Date.now().toString(36).toUpperCase();
    try {
      localStorage.setItem(
        "axys:lastOrder",
        JSON.stringify({
          orderId, status: "Awaiting Payment",
          product: product.name, color, size, qty, subtotal, deliveryFee: DELIVERY_FEE, total,
          customer: form, createdAt: new Date().toISOString(),
        }),
      );
    } catch {}
    await new Promise((r) => setTimeout(r, 3000));
    const url = `${PAYSTACK_URL}?reference=${encodeURIComponent(orderId)}&amount=${total}`;
    window.open(url, "_blank", "noopener,noreferrer");
    navigate({ to: "/success", search: { order: orderId } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-5 py-12 md:px-10 md:py-20">
        <div className="mb-10">
          <Link to="/" className="eyebrow hover:text-foreground">← Back</Link>
          <h1 className="mt-3 font-display text-4xl font-black uppercase md:text-5xl">Delivery Information</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Please complete your delivery details before payment to process your order.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <Section title="Customer Information">
              <Grid>
                <Field label="First Name" error={errors.firstName}>
                  <Input value={form.firstName} onChange={(v) => set("firstName", v)} />
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <Input value={form.lastName} onChange={(v) => set("lastName", v)} />
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <Input type="email" value={form.email} onChange={(v) => set("email", v)} />
                </Field>
                <Field label="Phone Number" error={errors.phone}>
                  <Input type="tel" value={form.phone} onChange={(v) => set("phone", v)} />
                </Field>
              </Grid>
            </Section>

            <Section title="Delivery Details">
              <Grid>
                <Field label="Country" error={errors.country}>
                  <Input value={form.country} onChange={(v) => set("country", v)} />
                </Field>
                <Field label="Province / State" error={errors.province}>
                  <Input value={form.province} onChange={(v) => set("province", v)} />
                </Field>
                <Field label="City / Town" error={errors.city}>
                  <Input value={form.city} onChange={(v) => set("city", v)} />
                </Field>
                <Field label="Postal Code" error={errors.postal}>
                  <Input value={form.postal} onChange={(v) => set("postal", v)} />
                </Field>
                <Field label="Street Address" error={errors.street} full>
                  <Input value={form.street} onChange={(v) => set("street", v)} />
                </Field>
                <Field label="Apartment / Unit (Optional)" full>
                  <Input value={form.apartment} onChange={(v) => set("apartment", v)} />
                </Field>
                <Field label="Delivery Notes (Optional)" full>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Gate code, landmarks, preferred delivery instructions"
                    rows={3}
                    className="w-full border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                  />
                </Field>
              </Grid>
            </Section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-white p-6">
              <div className="eyebrow mb-4">Order Review</div>
              <div className="space-y-1 text-sm">
                <Row k="Product" v={product.name} />
                <Row k="Color" v={color || "—"} />
                <Row k="Size" v={size || "—"} />
                <Row k="Quantity" v={String(qty)} />
                <Row k="Unit Price" v={`R${product.price}`} />
              </div>
              <div className="mt-5 space-y-1 border-t border-border pt-5 text-sm">
                <Row k="Subtotal" v={`R${subtotal}`} />
                <Row k="Delivery Fee" v={`R${DELIVERY_FEE}`} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs uppercase tracking-[0.18em]">Total</span>
                <span className="font-display text-2xl font-black">R{total}</span>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 border border-border bg-white p-4 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => { setConfirmed(e.target.checked); if (e.target.checked) setErrors(({ confirm, ...rest }) => rest); }}
                className="mt-0.5 h-4 w-4 accent-black"
              />
              <span>I confirm my size, color, quantity and delivery details are correct.</span>
            </label>
            {errors.confirm && <div className="text-xs text-destructive">{errors.confirm}</div>}

            <button type="submit" disabled={!confirmed || loading} className="btn-primary w-full">
              {loading ? "Processing…" : "Proceed To Secure Payment"}
            </button>
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Secured via Paystack
            </p>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="eyebrow mb-2 block">{label}</label>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full border border-border bg-white px-4 text-sm focus:border-foreground focus:outline-none"
    />
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
