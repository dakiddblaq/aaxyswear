import { Link } from "@tanstack/react-router";
import { TIKTOK_URL } from "@/lib/products";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="font-display text-xl font-black tracking-[0.2em]">
          AXYS
        </Link>
        <nav className="flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground md:gap-8">
          <a href="/#collection" className="hover:text-muted-foreground">Collection</a>
          <a href="/#about" className="hidden hover:text-muted-foreground sm:inline">About</a>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hover:text-muted-foreground">TikTok</a>
        </nav>
      </div>
    </header>
  );
}
