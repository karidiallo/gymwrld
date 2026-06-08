import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Lock, Tag, Copy } from "lucide-react";

export const Route = createFileRoute("/promo")({
  head: () => ({ meta: [{ title: "Promo — GymWrld" }] }),
  component: Promo,
});

type Tab = "darmowe" | "premium";

const free = [
  { brand: "ProteinLab", cat: "Suplementy", code: "GYMWRLD10", off: "-10%" },
  { brand: "Athleisure", cat: "Odzież", code: "RUN20", off: "-20%" },
  { brand: "ForestEats", cat: "Zdrowa żywność", code: "FRESH15", off: "-15%" },
  { brand: "FitGear", cat: "Sprzęt", code: "HOME25", off: "-25%" },
];

const premium = [
  { brand: "WHOOP", cat: "Wearable", code: "PREMIUM-WRLD-40", off: "-40%" },
  { brand: "MyProtein", cat: "Suplementy · ekskluzywne", code: "GW-VIP-35", off: "-35%" },
  { brand: "Nike Training", cat: "Limitowana kampania", code: "WRLD-PREMIUM", off: "-30%" },
];

function Promo() {
  const [tab, setTab] = useState<Tab>("darmowe");
  return (
    <main className="px-5 pt-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Oferty partnerów</p>
        <h1 className="mt-1 text-2xl font-semibold">Promo</h1>
      </header>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl glass p-5">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-secondary/25 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground glow-primary">
            <Tag className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold leading-tight">Oszczędzaj na tym co kochasz</h2>
            <p className="mt-1 text-xs text-muted-foreground">Ekskluzywne rabaty od zaufanych marek</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-5 flex rounded-full bg-white/5 p-1 text-sm">
        <button onClick={() => setTab("darmowe")} className={`flex-1 rounded-full py-2 ${tab === "darmowe" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Darmowe
        </button>
        <button onClick={() => setTab("premium")} className={`flex-1 rounded-full py-2 inline-flex items-center justify-center gap-1.5 ${tab === "premium" ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "text-muted-foreground"}`}>
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
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Odblokuj GymWrld Premium</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Ekskluzywne kody, AI Coach, premium skiny i więcej.</p>
          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-primary-foreground glow-primary">
            Wypróbuj 7 dni za darmo
          </button>
        </div>
      )}
    </main>
  );
}

function Deal({ d, locked, premium }: { d: { brand: string; cat: string; code: string; off: string }; locked?: boolean; premium?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl glass p-4 ${premium ? "ring-1 ring-primary/30" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-xl text-base font-semibold ${premium ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground" : "bg-white/8"}`}>
          {d.brand[0]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{d.brand}</p>
          <p className="text-xs text-muted-foreground">{d.cat}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gradient">{d.off}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
        <code className={`text-xs ${locked ? "blur-sm select-none" : "font-medium"}`}>{d.code}</code>
        {locked ? (
          <span className="inline-flex items-center gap-1 text-xs text-primary"><Lock className="h-3 w-3" /> Premium</span>
        ) : (
          <button className="inline-flex items-center gap-1 text-xs font-medium text-primary"><Copy className="h-3 w-3" /> Odbierz</button>
        )}
      </div>
    </div>
  );
}