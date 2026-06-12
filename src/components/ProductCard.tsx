import { useState } from "react";
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
  const [added, setAdded] = useState(false);

  const main = images[activeIdx] ?? images[0];

  function selectColor(c: string) {
    setColor(c);
    const matched = colorImages?.[c];
    if (matched) {
      const i = images.findIndex((u) => u === matched);
      if (i >= 0) setActiveIdx(i);
    }
  }

  function addToCart() {
    if (!size) return alert("Please select a size.");
    try {
      const raw = localStorage.getItem("axys:cart");
      const cart = raw ? JSON.parse(raw) : [];
      cart.push({ id: product.id, name: product.name, price: product.price, color, size, qty, addedAt: Date.now() });
      localStorage.setItem("axys:cart", JSON.stringify(cart));
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pill max-h-[95vh] w-[96vw] max-w-[1200px] overflow-y-auto border border-border bg-white p-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.shortDescription}</DialogDescription>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Gallery */}
          <div className="bg-secondary">
            <div className="aspect-square w-full overflow-hidden bg-white">
              {main && <img src={main} alt={product.name} className="h-full w-full object-cover" />}
            </div>
            <div className="grid grid-cols-5 gap-px border-t border-border bg-border">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={addToCart} className="btn-outline pill w-full sm:flex-1">
                {added ? "Added ✓" : "Add To Cart"}
              </button>
              <Link
                to="/checkout"
                search={{ product: product.id, color, size: size ?? "", qty }}
                onClick={(e) => {
                  if (!size) {
                    e.preventDefault();
                    alert("Please select a size.");
                  }
                }}
                className="btn-primary pill w-full sm:flex-1"
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
  );
}
