import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Zap, ChevronLeft, Lock } from "lucide-react";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Premium — GymWrld" }, { name: "description", content: "Odblokuj pełen potencjał GymWrld." }] }),
  component: Premium,
});

type Cycle = "monthly" | "yearly";

function Premium() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const plans = [
    {
      id: "free",
      name: "Free",
      tag: "Start",
      tone: "from-white/10 to-white/[0.02]",
      ring: "ring-white/10",
      price: { monthly: 0, yearly: 0 },
      perks: ["Podstawowy avatar", "Logowanie treningu i diety", "Statystyki tygodniowe", "1 pokój startowy"],
      cta: "Twój plan",
      badge: null as string | null,
    },
    {
      id: "pro",
      name: "Pro",
      tag: "Najpopularniejsze",
      tone: "from-[#7a1a1a]/40 via-[#3b0a0a]/30 to-transparent",
      ring: "ring-[#a52a2a]/40",
      price: { monthly: 9.99, yearly: 79.99 },
      perks: [
        "Wszystko z Free",
        "AI Coach 24/7",
        "Plany treningowe premium",
        "Zaawansowane statystyki & rekordy",
        "3 dodatkowe pokoje",
      ],
      cta: "Wybierz Pro",
      badge: "Najlepszy wybór",
    },
    {
      id: "premium",
      name: "Premium",
      tag: "Elite",
      tone: "from-[#b91c1c]/40 via-[#7a1a1a]/30 to-black/40",
      ring: "ring-[#dc2626]/50",
      price: { monthly: 24.99, yearly: 199.99 },
      perks: [
        "Wszystko z Pro",
        "Ekskluzywne skiny postaci",
        "Premium Deals (zniżki marek)",
        "Wszystkie pomieszczenia + dekoracje",
        "Indywidualny plan żywieniowy AI",
        "Wsparcie priorytetowe",
      ],
      cta: "Odblokuj Premium",
      badge: "VIP",
    },
  ];

  const yearlyDiscount = 33;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0303] px-5 pt-6 pb-32 text-white">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#7a1a1a]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#dc2626]/15 blur-3xl" />

      <header className="relative flex items-center justify-between">
        <Link to="/profil" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Subskrypcja</span>
        <div className="h-9 w-9" />
      </header>

      <section className="relative mt-6 text-center">
        <img
          src={logoAsset.url}
          alt="GymWrld"
          className="mx-auto h-16 w-auto"
          style={{ filter: "brightness(0) invert(1) drop-shadow(0 8px 30px rgba(255,255,255,0.2))" }}
        />
        <h1 className="mt-5 font-display text-4xl leading-tight">
          Wejdź na <span className="bg-gradient-to-r from-[#dc2626] via-[#f59e0b] to-white bg-clip-text text-transparent">wyższy poziom</span>
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          AI Coach, ekskluzywne skiny, plany premium i pełne pomieszczenia.
        </p>
      </section>

      {/* Cycle toggle */}
      <div className="relative mx-auto mt-6 inline-flex w-full max-w-[280px] items-center justify-center rounded-full bg-white/5 p-1 text-xs">
        <button
          onClick={() => setCycle("monthly")}
          className={`flex-1 rounded-full px-4 py-2 font-medium transition ${cycle === "monthly" ? "bg-[#7a1a1a] text-white" : "text-muted-foreground"}`}
        >
          Miesięcznie
        </button>
        <button
          onClick={() => setCycle("yearly")}
          className={`flex-1 rounded-full px-4 py-2 font-medium transition ${cycle === "yearly" ? "bg-[#7a1a1a] text-white" : "text-muted-foreground"}`}
        >
          Rocznie <span className="ml-1 rounded-full bg-[#dc2626]/25 px-1.5 py-0.5 text-[9px] text-[#fca5a5]">-{yearlyDiscount}%</span>
        </button>
      </div>

      {/* Plans */}
      <section className="relative mt-6 space-y-4">
        {plans.map((p) => {
          const price = p.price[cycle];
          return (
            <div key={p.id} className={`relative overflow-hidden rounded-3xl p-[1px] ring-1 ${p.ring} bg-gradient-to-br ${p.tone}`}>
                <div className="rounded-[calc(1.5rem-1px)] bg-black/60 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-2xl">{p.name}</h3>
                      {p.badge && (
                       <span className="rounded-full bg-gradient-to-r from-[#dc2626] to-[#7a1a1a] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.tag}</p>
                  </div>
                  <div className="text-right">
                    {price === 0 ? (
                      <p className="font-display text-2xl">Darmowy</p>
                    ) : (
                      <>
                        <p className="font-display text-3xl leading-none">
                          {price.toFixed(2)} <span className="text-xs text-muted-foreground">PLN</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">/ {cycle === "monthly" ? "mies." : "rok"}</p>
                      </>
                    )}
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#dc2626]/25 text-[#fca5a5]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => toast.success(`${p.name} · ${cycle === "monthly" ? "miesięcznie" : "rocznie"} wybrane (demo)`)}
                  disabled={p.id === "free"}
                  className={`mt-5 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    p.id === "free"
                      ? "bg-white/5 text-muted-foreground"
                      : p.id === "premium"
                      ? "bg-gradient-to-r from-[#dc2626] via-[#7a1a1a] to-black text-white shadow-[0_10px_40px_-10px_rgba(220,38,38,0.6)]"
                      : "bg-gradient-to-r from-[#7a1a1a] to-[#3b0a0a] text-white shadow-[0_10px_40px_-10px_rgba(122,26,26,0.6)]"
                  }`}
                >
                  {p.id === "premium" && <Zap className="mr-1 inline h-4 w-4" />}
                  {p.cta}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <p className="relative mt-6 text-center text-[10px] text-muted-foreground">
        <Lock className="inline h-3 w-3" /> Anuluj w dowolnej chwili. Bezpieczne płatności.
      </p>
    </main>
  );
}