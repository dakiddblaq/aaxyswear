import { useEffect, useState } from "react";

const TARGET = Date.now() + 1000 * 60 * 60 * 24 * 14;

export function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const items: [string, number][] = [["Days", d], ["Hours", h], ["Mins", m], ["Secs", s]];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {items.map(([label, val]) => (
        <div key={label} className="border border-border bg-white p-4 text-center sm:p-6">
          <div className="font-display text-3xl font-black tabular-nums sm:text-5xl">
            {String(val).padStart(2, "0")}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
