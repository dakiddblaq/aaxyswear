import { TIKTOK_URL, CONTACT_EMAIL } from "@/lib/products";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="font-display text-3xl font-black tracking-[0.2em]">AXYS</div>
          <div className="flex flex-col gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:items-end">
            <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">TikTok @axys.co</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground normal-case tracking-normal text-xs">{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          © AXYS Wear 2026 — All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
