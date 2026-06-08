import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Lock, Tag, Copy } from "lucide-react";

export const Route = createFileRoute("/promo")({
  head: () => ({ meta: [{ title: "Promo — GymWrld" }] }),
  component: Promo,
});

type Tab = "darmowe" | "premium";

type Deal = { brand: string; cat: string; code: string; off: string; from: string; to: string };

const free: Deal[] = [
  { brand: "ProteinLab", cat: "Suplementy", code: "GYMWRLD10", off: "-10%", from: "#ff4d8d", to: "#ff9a3c" },
  { brand: "Athleisure", cat: "Odzież", code: "RUN20", off: "-20%", from: "#6a5cff", to: "#22d3ee" },
  { brand: "ForestEats", cat: "Zdrowa żywność", code: "FRESH15", off: "-15%", from: "#16a34a", to: "#bef264" },
  { brand: "FitGear", cat: "Sprzęt", code: "HOME25", off: "-25%", from: "#f59e0b", to: "#ef4444" },
];

const premium: Deal[] = [
  { brand: "WHOOP", cat: "Wearable", code: "PREMIUM-WRLD-40", off: "-40%", from: "#000000", to: "#ff2d2d" },
  { brand: "MyProtein", cat: "Suplementy · ekskluzywne", code: "GW-VIP-35", off: "-35%", from: "#3b82f6", to: "#a855f7" },
  { brand: "Nike Training", cat: "Limitowana kampania", code: "WRLD-PREMIUM", off: "-30%", from: "#fb7185", to: "#facc15" },
];

function Promo() {
  const [tab, setTab] = useState<Tab>("darmowe");
  return (
    <main className="px-5 pt-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Oferty partnerów</p>
        <h1 className="mt-1 font-display text-3xl">Promo</h1>
      </header>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl glass p-5">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--orange)]/25 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[var(--magenta)]/25 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background glow-primary">
            <Tag className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl leading-tight">Oszczędzaj na tym co kochasz</h2>
            <p className="mt-1 text-xs text-muted-foreground">Ekskluzywne rabaty od zaufanych marek</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-5 flex rounded-full bg-white/5 p-1 text-sm">
        <button onClick={() => setTab("darmowe")} className={`flex-1 rounded-full py-2 font-medium ${tab === "darmowe" ? "bg-white text-background" : "text-muted-foreground"}`}>
          Darmowe
        </button>
        <button onClick={() => setTab("premium")} className={`flex-1 rounded-full py-2 inline-flex items-center justify-center gap-1.5 font-medium ${tab === "premium" ? "bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background" : "text-muted-foreground"}`}>
          <Sparkles className="h-3.5 w-3.5" /> Premium
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(tab === "darmowe" ? free : premium).map((d, i) => (
          <Deal key={d.brand} d={d} locked={tab === "premium" && i > 0} premium={tab === "premium"} />
        ))}
      </div>

      {tab === "darmowe" && (
        <div className="mt-6 rounded-3xl glass p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[var(--lime)]" />
            <p className="text-sm font-medium">Odblokuj GymWrld Premium</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Ekskluzywne kody, AI Coach, premium skiny i więcej.</p>
          <button
            onClick={() => toast.success("Twój trial Premium startuje!", { description: "7 dni za darmo — bez zobowiązań." })}
            className="mt-3 w-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] py-2.5 text-sm font-semibold text-background glow-primary"
          >
            Wypróbuj 7 dni za darmo
          </button>
        </div>
      )}
    </main>
  );
}

function Deal({ d, locked, premium }: { d: Deal; locked?: boolean; premium?: boolean }) {
  const bg = `linear-gradient(135deg, ${d.from}, ${d.to})`;
  const initials = d.brand.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const onClick = async () => {
    if (locked) {
      toast("Kod Premium zablokowany 🔒", { description: "Odblokuj GymWrld Premium aby go zobaczyć." });
      return;
    }
    try {
      await navigator.clipboard.writeText(d.code);
      toast.success(`Skopiowano ${d.code}`, { description: `${d.brand} · ${d.off}` });
    } catch {
      toast("Skopiuj ręcznie", { description: d.code });
    }
  };
  return (
    <div className="relative overflow-hidden rounded-2xl glass p-4">
      <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-50" style={{ background: bg }} />
      <div className="relative flex items-center gap-3">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg text-white shadow-lg ring-1 ring-white/20"
          style={{ background: bg, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-display text-base leading-tight">{d.brand}</p>
          <p className="text-xs text-muted-foreground">{d.cat}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none" style={{ background: bg, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{d.off}</p>
          {premium && <p className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--lime)]">VIP</p>}
        </div>
      </div>
      <div className="relative mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
        <code className={`text-xs ${locked ? "blur-sm select-none" : "font-semibold tracking-wider"}`}>{d.code}</code>
        {locked ? (
          <button onClick={onClick} className="inline-flex items-center gap-1 text-xs text-white"><Lock className="h-3 w-3" /> Premium</button>
        ) : (
          <button onClick={onClick} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-background" style={{ background: bg }}><Copy className="h-3 w-3" /> Odbierz</button>
        )}
      </div>
    </div>
  );
}