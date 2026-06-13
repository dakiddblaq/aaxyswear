import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SIZES, SIZE_CHART, FIT_NOTES, SHIPPING_INFO, type Product } from "@/lib/products";

const COLOR_SWATCH: Record<string, string> = {
  Black: "#111111",
  White: "#ffffff",
  "Dusty Pink": "#d8b4ae",
};

type Props = {
  product: Product;
  images: string[];
  colorImages?: Record<string, string>;
};

export function ProductCard({ product, images, colorImages }: Props) {
  const [open, setOpen] = useState(false);
  const cover = colorImages?.[product.colors[0]] ?? images[0];

  return (
    <>
      <article className="group border border-border bg-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full aspect-square overflow-hidden bg-secondary"
        >
          {cover && (
            <img
              src={cover}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
        </button>
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wide">{product.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.tagline}</p>
            </div>
            <div className="font-display text-lg font-bold">R{product.price}</div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-primary pill mt-6 w-full"
          >
            View Product
          </button>
        </div>
      </article>

      <ProductDetailDialog
        product={product}
        images={images}
        colorImages={colorImages}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function ProductDetailDialog({
  product,
  images,
  colorImages,
  open,
  onOpenChange,
}: Props & { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const scrollRaf = useRef<number | null>(null);

  const main = images[activeIdx] ?? images[0];
  const imageKey = images.join("|");

  useEffect(() => {
    if (!open && !lightbox) return;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => undefined);
    });
  }, [open, lightbox, imageKey]);

  useEffect(() => {
    if (!lightbox) return;
    const frame = requestAnimationFrame(() => {
      lightboxRef.current?.scrollTo({ left: activeIdx * lightboxRef.current.clientWidth, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [lightbox]);

  function handleLightboxScroll() {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const el = lightboxRef.current;
      if (!el) return;
      const nextIdx = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      if (nextIdx !== activeIdx && nextIdx >= 0 && nextIdx < images.length) setActiveIdx(nextIdx);
    });
  }

  function selectColor(c: string) {
    setColor(c);
    const matched = colorImages?.[c];
    if (matched) {
      const i = images.findIndex((u) => u === matched);
      if (i >= 0) setActiveIdx(i);
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pill max-h-[95vh] w-[96vw] max-w-[1200px] overflow-y-auto border border-border bg-white p-0">

        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.shortDescription}</DialogDescription>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Gallery */}
          <div className="bg-secondary">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="Zoom image"
              className="group relative block aspect-square w-full overflow-hidden bg-white"
            >
              {main && <img src={main} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
              <span className="pill pointer-events-none absolute bottom-3 right-3 bg-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white" style={{ borderRadius: 999 }}>Tap to zoom</span>
            </button>
            <div className="grid grid-cols-5 gap-px border-t border-border bg-border">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => { setActiveIdx(i); setLightbox(true); }}
                  className={`aspect-square overflow-hidden bg-white ${activeIdx === i ? "ring-2 ring-inset ring-foreground" : ""}`}
                >
                  <img src={src} alt={`${product.name} view ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-10">
            <div className="eyebrow">{product.tagline}</div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-tight md:text-4xl">{product.name}</h2>
            <div className="mt-3 font-display text-2xl font-bold">R{product.price}</div>

            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {product.longDescription}
            </p>

            <div className="mt-8">
              <div className="eyebrow mb-3">Color — {color}</div>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => selectColor(c)}
                    aria-label={c}
                    className={`pill h-9 w-9 border ${color === c ? "border-foreground ring-1 ring-foreground ring-offset-2" : "border-border"}`}
                    style={{ background: COLOR_SWATCH[c] ?? "#ccc", borderRadius: 999 }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="eyebrow mb-3">Size</div>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`pill h-11 border text-xs font-semibold uppercase tracking-[0.15em] ${size === s ? "border-foreground bg-foreground text-background" : "border-border bg-white text-foreground hover:border-foreground"}`}
                    style={{ borderRadius: 999 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="eyebrow mb-3">Quantity</div>
              <div className="pill inline-flex border border-border" style={{ borderRadius: 999 }}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg hover:bg-secondary">−</button>
                <div className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold tabular-nums">{qty}</div>
                <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} className="h-10 w-10 text-lg hover:bg-secondary">+</button>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/checkout"
                search={{ product: product.id, color, size: size ?? "", qty }}
                onClick={(e) => {
                  if (!size) {
                    e.preventDefault();
                    alert("Please select a size.");
                  }
                }}
                className="btn-primary pill w-full"
              >
                Checkout
              </Link>
            </div>

            <Accordion type="multiple" className="mt-10">
              <AccordionItem value="size">
                <AccordionTrigger className="eyebrow !text-foreground">Size Guide — Find Your Fit</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Our tees feature a relaxed premium fit designed for everyday comfort and effortless styling. Built from heavyweight cotton with a structured silhouette.
                  </p>
                  <table className="mt-4 w-full border border-border text-sm">
                    <thead className="bg-secondary text-left text-xs uppercase tracking-[0.15em]">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Chest (cm)</th>
                        <th className="p-3">Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((r) => (
                        <tr key={r.size} className="border-t border-border">
                          <td className="p-3 font-semibold">{r.size}</td>
                          <td className="p-3">{r.chest}</td>
                          <td className="p-3">{r.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <div className="eyebrow mb-2">Fit Notes</div>
                    <ul className="space-y-1 text-sm text-foreground/80">
                      {FIT_NOTES.map((n) => <li key={n}>• {n}</li>)}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features">
                <AccordionTrigger className="eyebrow !text-foreground">Product Features</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-foreground/80">
                    {product.features.map((f) => <li key={f}>• {f}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="eyebrow !text-foreground">Shipping Information</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm font-medium">South Africa Nationwide Delivery</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
                    {SHIPPING_INFO.map((s) => <li key={s}>• {s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {lightbox && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
        onClick={() => setLightbox(false)}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
          aria-label="Close"
          className="pill absolute right-4 top-4 h-10 w-10 border border-white/30 text-white hover:bg-white hover:text-black"
          style={{ borderRadius: 999 }}
        >✕</button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous"
          className="pill absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 border border-white/30 text-white hover:bg-white hover:text-black"
          style={{ borderRadius: 999 }}
        >‹</button>
        <img
          src={main}
          alt={product.name}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] max-w-[92vw] object-contain"
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next"
          className="pill absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 border border-white/30 text-white hover:bg-white hover:text-black"
          style={{ borderRadius: 999 }}
        >›</button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/70">
          {activeIdx + 1} / {images.length}
        </div>
      </div>
    )}
    </>
  );
}
