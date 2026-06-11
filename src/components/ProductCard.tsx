import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SIZES, type Product } from "@/lib/products";

const COLOR_SWATCH: Record<string, string> = {
  Black: "#111111",
  White: "#ffffff",
  "Dusty Pink": "#d8b4ae",
};

export function ProductCard({ product, image, images, colorImages }: { product: Product; image?: string; images?: string[]; colorImages?: Record<string, string> }) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const gallery = images && images.length > 0 ? images : image ? [image] : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const colorMatched = colorImages?.[color];
  const mainImage = colorMatched ?? gallery[activeIdx] ?? gallery[0];

  return (
    <article className="border border-border bg-white">
      <div className="aspect-square w-full overflow-hidden bg-secondary">
        {mainImage && <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />}
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-px border-t border-border bg-border">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`aspect-square overflow-hidden bg-white ${activeIdx === i && !colorMatched ? "ring-1 ring-inset ring-foreground" : ""}`}
            >
              <img src={src} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">{product.name}</h3>
          <div className="font-display text-lg font-bold">R{product.price}</div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-6">
          <div className="eyebrow mb-3">Color — {color}</div>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); if (colorImages?.[c]) setActiveIdx(gallery.findIndex((g) => g === colorImages[c])); }}
                aria-label={c}
                className={`h-9 w-9 border ${color === c ? "border-foreground ring-1 ring-foreground ring-offset-2" : "border-border"}`}
                style={{ background: COLOR_SWATCH[c] ?? "#ccc" }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="eyebrow mb-3">Size</div>
          <div className="grid grid-cols-6 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`h-10 border text-xs font-medium ${size === s ? "border-foreground bg-foreground text-background" : "border-border bg-white text-foreground hover:border-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="eyebrow mb-3">Quantity</div>
          <div className="inline-flex border border-border">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg hover:bg-secondary">−</button>
            <div className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium tabular-nums">{qty}</div>
            <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} className="h-10 w-10 text-lg hover:bg-secondary">+</button>
          </div>
        </div>

        <Link
          to="/checkout"
          search={{ product: product.id, color, size: size ?? "", qty }}
          className="btn-primary mt-8 w-full"
          onClick={(e) => {
            if (!size) {
              e.preventDefault();
              alert("Please select a size.");
            }
          }}
        >
          Buy Now
        </Link>
      </div>
    </article>
  );
}
