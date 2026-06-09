import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Dumbbell, Apple, MapPin, Footprints, Heart, Check, Smartphone, Plus, Minus, Sparkles } from "lucide-react";
import sanctuary from "@/assets/sanctuary.jpg";
import logoAsset from "@/assets/gymwrld-wordmark.png.asset.json";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "GymWrld — Twoja cyfrowa wersja siebie" },
      { name: "description", content: "Trening, dieta, street workout, biegi i cykl w jednym. Dołącz do GymWrld i zbuduj swoje sanktuarium." },
      { property: "og:title", content: "GymWrld — Twoja cyfrowa wersja siebie" },
      { property: "og:description", content: "Trening, dieta, street workout, biegi i cykl w jednym. Dołącz do GymWrld." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WelcomePage,
});

const FEATURES = [
  { icon: Dumbbell, title: "Trening siłowy", desc: "Plany, AI-dobrane ciężary, timer odpoczynku, log treningowy.", color: "var(--magenta)" },
  { icon: Apple, title: "Dieta i przepisy", desc: "Makra, lista posiłków i ~50 przepisów z możliwością dodawania własnych zdjęć.", color: "var(--orange)" },
  { icon: MapPin, title: "Street Workout", desc: "Mapa realnych parków kalistenicznych w Twoim mieście.", color: "var(--lime)" },
  { icon: Footprints, title: "Biegi & kroki", desc: "Maraton mode, trasy w mieście, dzienne kroki i kalorie.", color: "#60a5fa" },
  { icon: Heart, title: "Cykl & regeneracja", desc: "Tracker cyklu (FLO), wymiary ciała, sen i regeneracja.", color: "#a78bfa" },
  { icon: Sparkles, title: "Awatar & poziomy", desc: "Twoja cyfrowa postać rośnie z każdym treningiem.", color: "#bef264" },
];

const FAQ = [
  { q: "Czy GymWrld jest darmowy?", a: "Tak — wszystkie podstawowe funkcje (trening, dieta, mapa, biegi, cykl) są w pełni darmowe. Premium odblokowuje plany AI, dodatkowe pokoje awatara i ekskluzywne promocje." },
  { q: "Czy mogę zainstalować GymWrld na telefonie?", a: "Tak. GymWrld działa jako PWA — w przeglądarce na telefonie wybierz 'Dodaj do ekranu głównego'. Wersje natywne na App Store i Google Play są w drodze." },
  { q: "Czy moje dane są bezpieczne?", a: "Tak. Konto i dane treningowe trzymamy w zaszyfrowanej bazie. Możesz w każdej chwili wyeksportować lub usunąć konto." },
  { q: "Czym GymWrld różni się od FLO / Strava / MyFitnessPal?", a: "Jedna aplikacja zamiast pięciu. Łączymy siłownię, dietę, kalistenikę, bieg i cykl — z gamifikacją i awatarem, który się rozwija." },
  { q: "Czy potrzebuję sprzętu?", a: "Nie. Masz plany na masę ciała, gumy i pełną siłownię — dobieramy ćwiczenia pod Twój sprzęt." },
];

const PLANS = [
  { name: "Free", price: "0 zł", tag: "Na zawsze", features: ["Trening, dieta, biegi, cykl", "Mapa Street Workout", "Podstawowy awatar", "Statystyki i poziomy"], cta: "Zacznij za darmo", highlight: false },
  { name: "Premium", price: "29 zł", tag: "/ miesiąc", features: ["Wszystko z Free", "Plany AI dopasowane do Ciebie", "Wszystkie pokoje awatara", "Ekskluzywne promocje lokalne", "Priorytetowe wsparcie"], cta: "Wypróbuj 7 dni gratis", highlight: true },
];

function WelcomePage() {
  const logo = logoAsset.url;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* nav */}
      <header className={`fixed inset-x-0 top-0 z-40 transition ${scrolled ? "backdrop-blur-xl bg-background/70 border-b border-white/5" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex items-center gap-2">
            <img src={logo} alt="GymWrld" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-lg tracking-tight">GymWrld</span>
          </a>
          <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Funkcje</a>
            <a href="#pricing" className="hover:text-foreground">Cennik</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href="#download" className="hover:text-foreground">Pobierz</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-block">Zaloguj</Link>
            <Link to="/onboarding" className="rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-medium text-black hover:opacity-90">Zacznij</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="relative overflow-hidden pt-28 pb-20">
        <img src={sanctuary} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-32 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[var(--magenta)]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)]" /> Twoja cyfrowa wersja siebie
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Buduj formę.<br />
            <span className="bg-gradient-to-r from-[var(--lime)] via-[var(--orange)] to-[var(--magenta)] bg-clip-text text-transparent">
              Trenuj świadomie.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Siłownia, dieta, kalistenika, biegi i cykl — w jednej aplikacji. Z gamifikacją i awatarem, który się rozwija razem z Tobą.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-6 py-3 text-sm font-medium text-black hover:opacity-90">
              Zacznij za darmo <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm">
              Mam już konto
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Bez karty · 7 dni Premium gratis</p>
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Funkcje</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Wszystko w jednej apce</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Zamiast pięciu aplikacji — jedno spójne miejsce.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition hover:bg-white/[0.04]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: f.color }} />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${f.color}22`, color: f.color }}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-medium">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-5 py-20">
        <div className="mb-12 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Cennik</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Prosto i uczciwie</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative overflow-hidden rounded-3xl border p-7 ${p.highlight ? "border-[var(--lime)]/40 bg-gradient-to-br from-[var(--lime)]/10 to-transparent" : "border-white/5 bg-white/[0.02]"}`}>
              {p.highlight && <span className="absolute right-5 top-5 rounded-full bg-[var(--lime)] px-2 py-1 text-[10px] font-medium text-black">Polecane</span>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.tag}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lime)]" /> <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${p.highlight ? "bg-[var(--lime)] text-black" : "glass"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">FAQ</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Pytania i odpowiedzi</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <button
                key={i}
                onClick={() => setOpenFaq(open ? null : i)}
                className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] text-left transition hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3 p-5">
                  <span className="font-medium">{item.q}</span>
                  {open ? <Minus className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                </div>
                {open && <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>}
              </button>
            );
          })}
        </div>
      </section>

      {/* download */}
      <section id="download" className="mx-auto max-w-4xl px-5 py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-[var(--magenta)]/15 via-transparent to-[var(--lime)]/10 p-10 text-center">
          <Smartphone className="mx-auto h-10 w-10 text-[var(--lime)]" />
          <h2 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">Pobierz GymWrld</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Dostępne jako PWA na każdym telefonie. Wersje natywne App Store i Google Play wkrótce.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onboarding" className="rounded-full bg-[var(--lime)] px-6 py-3 text-sm font-medium text-black">Otwórz w przeglądarce</Link>
            <button disabled className="cursor-not-allowed rounded-full glass px-6 py-3 text-sm opacity-60">App Store · wkrótce</button>
            <button disabled className="cursor-not-allowed rounded-full glass px-6 py-3 text-sm opacity-60">Google Play · wkrótce</button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Na iPhone: otwórz w Safari → Udostępnij → „Do ekranu początkowego”.</p>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 px-5 py-10 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-5 w-5 rounded" />
            <span>© {new Date().getFullYear()} GymWrld</span>
          </div>
          <div className="flex gap-5">
            <Link to="/auth">Logowanie</Link>
            <a href="mailto:hi@gymwrld.com">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}