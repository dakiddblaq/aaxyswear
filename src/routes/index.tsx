import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Countdown } from "@/components/Countdown";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";
import heroAsset from "@/assets/axys-hero.jpg.asset.json";
import signatureTee from "@/assets/signature-tee.jpg";
import barcodeBlack1 from "@/assets/barcode-black-1.png.asset.json";
import barcodeBlack2 from "@/assets/barcode-black-2.png.asset.json";
import barcodeWhite from "@/assets/barcode-white.png.asset.json";
import barcodePink from "@/assets/barcode-pink.png.asset.json";
import barcodeLabel from "@/assets/barcode-label.png.asset.json";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXYS Wear — Built For The Ambitious" },
      { name: "description", content: "Exclusivity. Ambition. Prestige. Shop the inaugural AXYS drop: Signature Tee and Barcode Tee." },
      { property: "og:image", content: heroAsset.url },
    ],
  }),
  component: HomePage,
});

const BARCODE_IMAGES = [barcodeBlack1.url, barcodeWhite.url, barcodePink.url, barcodeBlack2.url, barcodeLabel.url];
const BARCODE_COLOR_IMAGES: Record<string, string> = {
  Black: barcodeBlack1.url,
  White: barcodeWhite.url,
  "Dusty Pink": barcodePink.url,
};

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Drop />
      <Collection />
      <Philosophy />
      <InnerCircle />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black text-white">
      <img src={heroAsset.url} alt="AXYS Wear campaign" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
        <div className="eyebrow text-white/60">The Inaugural Drop · AXYS®</div>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-7xl md:text-8xl">
          Built For The<br />Ambitious.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
          Exclusivity. Ambition. Prestige. Every piece is crafted for those who refuse to settle.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#collection" className="btn-primary border border-white bg-white text-black hover:opacity-90">Shop Collection</a>
          <a href="#inner-circle" className="btn-secondary">Join The Inner Circle</a>
        </div>
      </div>
    </section>
  );
}

function Drop() {
  return (
    <section className="border-b border-border bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1100px] text-center">
        <div className="eyebrow">Limited · Exclusive · 2026</div>
        <h2 className="mt-4 font-display text-4xl font-black uppercase md:text-6xl">Limited First Drop</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
          The inaugural AXYS release. Available while stock lasts.
        </p>
        <div className="mx-auto mt-12 max-w-2xl">
          <Countdown />
        </div>
      </div>
    </section>
  );
}

function Collection() {
  return (
    <section id="collection" className="border-b border-border bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="eyebrow">The Collection</div>
            <h2 className="mt-3 font-display text-4xl font-black uppercase md:text-5xl">Two Pieces. One Standard.</h2>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {PRODUCTS.map((p) =>
            p.id === "barcode-tee" ? (
              <ProductCard key={p.id} product={p} images={BARCODE_IMAGES} colorImages={BARCODE_COLOR_IMAGES} />
            ) : (
              <ProductCard key={p.id} product={p} image={signatureTee} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section id="about" className="border-b border-border bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div>
          <div className="eyebrow">Our Philosophy</div>
          <h2 className="mt-4 font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
            The AXYS Standard
          </h2>
        </div>
        <div className="space-y-6 text-base leading-relaxed text-foreground/80">
          <p>
            AXYS is built on the principles of <strong className="text-foreground">Exclusivity, Ambition, and Prestige</strong>. Every piece is designed for individuals who pursue more, expect more, and settle for nothing less than excellence.
          </p>
          <p>
            In collaboration with <strong className="text-foreground">Panda World Apparel</strong>, AXYS combines refined design, premium craftsmanship, and a commitment to quality to deliver a distinguished experience from creation to delivery. This partnership allows AXYS to focus on creating timeless essentials while ensuring every order is supported by trusted operational excellence.
          </p>
        </div>
      </div>
    </section>
  );
}

function InnerCircle() {
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!first.trim()) return setErr("Please enter your first name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Please enter a valid email address.");
    setSubmitted(true);
  }

  return (
    <section id="inner-circle" className="bg-foreground px-5 py-20 text-background md:px-10 md:py-28">
      <div className="mx-auto max-w-[900px] text-center">
        <div className="eyebrow text-white/50">Members Only</div>
        <h2 className="mt-4 font-display text-4xl font-black uppercase md:text-6xl">Join The Inner Circle</h2>
        <p className="mx-auto mt-5 max-w-lg text-sm text-white/70 md:text-base">
          Get early access to future drops, limited releases, and exclusive AXYS updates.
        </p>
        {submitted ? (
          <div className="mx-auto mt-10 max-w-md border border-white/20 p-8 text-sm uppercase tracking-[0.18em]">
            Welcome to the inner circle.
          </div>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <input
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="First Name"
              className="h-12 border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="h-12 border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            <button type="submit" className="h-12 border border-white bg-white px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground hover:opacity-90">
              Join Now
            </button>
            {err && <div className="text-xs text-red-300 sm:col-span-3">{err}</div>}
          </form>
        )}
      </div>
    </section>
  );
}
