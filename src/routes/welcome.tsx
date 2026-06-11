import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Dumbbell, Apple, MapPin, Footprints, Heart, Sparkles, Plus, Minus, Check, Flame, Trophy, Smartphone, Target, Zap, Moon, Activity } from "lucide-react";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import avatarMale from "@/assets/avatar-male-athletic-crop.png";
import avatarFemale from "@/assets/avatar-female-athletic-crop.png";
import moduleStrength from "@/assets/module-strength.webp";
import moduleNutrition from "@/assets/module-nutrition.webp";
import moduleStreet from "@/assets/module-street.webp";
import moduleRunning from "@/assets/module-running.webp";
import moduleMindHealth from "@/assets/module-mind-health.webp";
import moduleWomen from "@/assets/module-women.webp";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "GymWRLD. — Twoja cyfrowa wersja siebie" },
      { name: "description", content: "Premium aplikacja: trening, dieta, street workout, biegi, mind health i gra RPG. Jedna apka, którą rozwijasz razem ze swoim awatarem." },
      { property: "og:title", content: "GymWRLD." },
      { property: "og:description", content: "Premium aplikacja treningowa. Trenuj świadomie." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WelcomePage,
});

const FEATURES = [
  { icon: Dumbbell, title: "Trening Siłowy", desc: "Loguj serie, ciężary i powtórzenia. Statystyka Siła rośnie wraz z intensywnością — widzisz realny progres tydzień po tygodniu.", tint: "from-[var(--magenta)]/40 to-[var(--orange)]/20" },
  { icon: Apple, title: "Dieta i Przepisy", desc: "Twoje kcal i makro wyliczone z wagi, wzrostu i celu. Baza przepisów + możliwość dodania własnego — zatwierdzimy go w aplikacji.", tint: "from-[var(--orange)]/40 to-[var(--lime)]/20" },
  { icon: MapPin, title: "Street Workout", desc: "Mapa realnych parków kalistenicznych w Twoim mieście. Klikasz pin — przechodzisz do wizytówki Google z opiniami i nawigacją.", tint: "from-[var(--lime)]/40 to-[var(--violet)]/20" },
  { icon: Footprints, title: "Biegi i Kroki", desc: "Tryb maraton, dzienny licznik kroków, kalorie i historia tras. Bieg na siłowni lub w parku — kondycja rośnie adekwatnie do dystansu.", tint: "from-[var(--violet)]/40 to-[var(--magenta)]/20" },
  { icon: Moon, title: "Sen i Regeneracja", desc: "Tracker snu, strefa reset, oddychanie i mind sesje. Sen wpływa na statystyki — bez regeneracji nie ma progresu.", tint: "from-[var(--violet)]/40 to-[var(--magenta)]/20" },
  { icon: Heart, title: "Mind Health", desc: "Oddech, medytacja, journal, nastrój i reset po ciężkim dniu. Regeneracja wpływa na energię, sen i Twój długofalowy progres.", tint: "from-[var(--magenta)]/40 to-[var(--violet)]/20" },
  { icon: Heart, title: "Dla Kobiet", desc: "Tryb cyklu, plany dopasowane do faz, trening i odżywianie z myślą o kobiecym ciele. Mniej PMS-u, więcej energii.", tint: "from-[var(--magenta)]/40 to-[var(--orange)]/20" },
  { icon: Activity, title: "Statystyki & Medale", desc: "Pięć atrybutów: Siła, Kondycja, Dieta, Sen, Rozwój. Odblokowuj medale za pierwsze sesje, streaki i kamienie milowe.", tint: "from-[var(--lime)]/40 to-[var(--orange)]/20" },
];

const FAQ = [
  { q: "Czy GymWRLD jest darmowy?", a: "Tak. Trening, dieta, mapa, biegi i mind health są w pełni darmowe. Pro i Premium odblokowują plany AI, dodatkowe pokoje sanktuarium i ekskluzywne promocje lokalne." },
  { q: "Czy mogę zainstalować GymWRLD na telefonie?", a: "Tak — działamy jako PWA. Na iPhone otwórz w Safari i wybierz „Dodaj do ekranu początkowego”. Wersje natywne App Store i Google Play są w drodze." },
  { q: "Czy moje dane są bezpieczne?", a: "Tak. Konto i dane treningowe trzymamy w zaszyfrowanej bazie z polityką dostępu RLS. W każdej chwili wyeksportujesz lub usuniesz konto." },
  { q: "Czym różnicie się od typowych trackerów fitness?", a: "Jedna aplikacja zamiast pięciu. Łączymy siłownię, dietę, kalistenikę, bieg i mind health — z gamifikacją i awatarem, który rozwija się razem z Tobą." },
  { q: "Czy potrzebuję sprzętu?", a: "Nie. Mamy plany na masę ciała, gumy, oraz pełną siłownię — dobieramy ćwiczenia pod Twój sprzęt." },
];

const PLANS = [
  { name: "Free", price: "0 zł", tag: "Na zawsze", features: ["Trening, dieta, biegi, mind health", "Mapa Street Workout", "Podstawowy awatar", "Statystyki tygodniowe", "1 pokój sanktuarium"], cta: "Zacznij za darmo", highlight: false, badge: null as string | null },
  { name: "Pro", price: "9,99 zł", tag: "/ miesiąc", features: ["Wszystko z Free", "Plany treningowe premium", "Przepisy premium", "Premium Deals (zniżki marek)", "Zaawansowane statystyki i rekordy", "3 dodatkowe pokoje"], cta: "Wybierz Pro", highlight: true, badge: "Najpopularniejsze" },
  { name: "Premium", price: "24,99 zł", tag: "/ miesiąc", features: ["Wszystko z Pro", "Skanowanie produktów", "AI Coach 24/7", "Indywidualny plan treningowy AI", "Indywidualny plan żywieniowy AI", "Wszystkie pokoje + dekoracje"], cta: "Odblokuj Premium", highlight: false, badge: "VIP" },
];

function WelcomePage() {
  const logo = logoAsset.url;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Landing only available in browser. In installed PWA, send straight to login.
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone === true;
      if (standalone) { navigate({ to: "/auth", replace: true }); return; }
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    const onPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt as any);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeinstallprompt", onPrompt as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const r = await installPrompt.userChoice;
      if (r.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isIos
      ? "Na iPhone: otwórz w Safari → przycisk Udostępnij → Do ekranu początkowego."
      : "Otwórz menu przeglądarki → Zainstaluj aplikację / Dodaj do ekranu głównego.");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground">
      {/* Ambient brand glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--magenta)]/30 blur-[120px]" />
        <div className="absolute top-[40%] -right-32 h-[420px] w-[420px] rounded-full bg-[var(--orange)]/25 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 h-[460px] w-[460px] rounded-full bg-[var(--lime)]/20 blur-[120px]" />
      </div>

      {/* nav */}
      <header className={`fixed inset-x-0 top-0 z-40 transition ${scrolled ? "backdrop-blur-xl bg-background/70 border-b border-white/5" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <img src={logo} alt="GymWRLD" className="h-20 w-auto md:h-24" />
          </a>
          <nav className="hidden gap-8 text-[13px] text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Funkcje</a>
            <a href="#pricing" className="hover:text-foreground">Cennik</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href="#download" className="hover:text-foreground">Pobierz</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden text-[13px] text-muted-foreground hover:text-foreground sm:inline-block">Zaloguj</Link>
            <Link to="/auth" search={{ mode: "signup" } as any} className="rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-2 text-[13px] font-semibold text-background glow-primary">
              Zacznij
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="relative pt-36 pb-24 md:pt-44 md:pb-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] animate-pulse-glow" /> Twoja cyfrowa wersja siebie
            </div>
            <h1 className="mt-8 font-display text-[3rem] leading-[0.95] tracking-tight md:text-[5.5rem]">
              Buduj <span className="text-gradient">swoją</span><br />najlepszą wersję.
            </h1>
            <p className="mt-7 max-w-lg text-base text-muted-foreground md:text-lg">
              Siłownia, dieta, street workout, biegi i mind health — pięć aplikacji w jednej. Każdy trening rozwija Twojego awatara, podbija statystyki i odblokowuje questy. Bez chaosu, z planem.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/auth" search={{ mode: "signup" } as any} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-7 py-4 text-sm font-semibold text-background glow-primary transition active:scale-[0.98]">
                Zacznij za darmo
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 text-sm font-medium text-foreground/85 hover:text-foreground">
                Mam już konto
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={installApp} disabled={installed} className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-xs font-medium text-foreground/85 hover:text-foreground disabled:opacity-50">
                <Smartphone className="h-4 w-4" /> {installed ? "Zainstalowano ✓" : "Dodaj do ekranu głównego"}
              </button>
              <span className="text-[11px] text-muted-foreground">App Store i Google Play · wkrótce</span>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Bez karty · 7 dni Premium gratis · Anuluj kiedy chcesz</p>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2">
                <img src={avatarFemale} alt="" className="h-9 w-9 rounded-full ring-2 ring-background object-cover bg-[var(--surface)]" />
                <img src={avatarMale} alt="" className="h-9 w-9 rounded-full ring-2 ring-background object-cover bg-[var(--surface)]" />
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-[10px] font-bold ring-2 ring-background">+2k</div>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">2 000+</span> osób buduje formę razem z GymWRLD
              </div>
            </div>
          </div>

          {/* Hero phone mockup with avatar + stats */}
          <div className="relative">
            <div aria-hidden className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/20 blur-3xl" />
            {/* floating mini cards around the phone */}
            <div className="pointer-events-none absolute -left-4 top-16 z-20 hidden rounded-2xl border border-white/10 bg-[var(--surface)]/90 p-3 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[var(--lime)]" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Osiągnięcie</p>
                  <p className="text-xs font-semibold">Pierwszy krok · +150 XP</p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 bottom-24 z-20 hidden rounded-2xl border border-[var(--orange)]/30 bg-gradient-to-br from-[var(--magenta)]/20 to-[var(--orange)]/10 p-3 shadow-2xl backdrop-blur md:block">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--orange)]" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Streak</p>
                  <p className="text-xs font-semibold">12 dni z rzędu</p>
                </div>
              </div>
            </div>

            {/* Phone bezel */}
            <div className="relative mx-auto w-full max-w-[300px]">
              <div className="relative rounded-[2.75rem] border border-white/10 bg-[#0b0710] p-2 shadow-[0_30px_80px_-20px_rgba(233,69,96,0.45)] ring-1 ring-white/5">
                <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[var(--surface)] to-background">
                  {/* status bar */}
                  <div className="flex items-center justify-between px-5 pb-1 pt-4 text-[10px] text-muted-foreground">
                    <span>9:41</span>
                    <span>●●● GymWRLD</span>
                  </div>
                  {/* hero avatar */}
                  <div className="relative mx-3 mt-2 overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--magenta)]/25 via-[var(--orange)]/15 to-transparent">
                    <img src={avatarMale} alt="Awatar" className="mx-auto h-44 w-auto object-contain" />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[9px] backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] animate-pulse" /> Lvl 7
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[9px] backdrop-blur">1 440 / 2 000 XP</div>
                  </div>
                  {/* XP bar */}
                  <div className="mx-3 mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" />
                    </div>
                  </div>
                  {/* stats mini */}
                  <div className="mx-3 mt-3 grid grid-cols-3 gap-2">
                    {[
                      { icon: Dumbbell, label: "Siła", v: 68, color: "var(--magenta)" },
                      { icon: Footprints, label: "Kond.", v: 54, color: "var(--orange)" },
                      { icon: Moon, label: "Sen", v: 81, color: "var(--violet)" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-white/10 bg-[var(--surface)]/70 p-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <s.icon className="h-3 w-3" style={{ color: s.color }} />
                          <span className="text-[8px] uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="mt-0.5 font-display text-base leading-none">{s.v}<span className="text-[9px] text-muted-foreground">/100</span></p>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${s.v}%`, background: `linear-gradient(90deg, ${s.color}, var(--lime))` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Quest card */}
                  <div className="mx-3 mt-3 mb-4 rounded-2xl border border-[var(--orange)]/30 bg-gradient-to-br from-[var(--magenta)]/15 via-[var(--orange)]/10 to-transparent p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                        <Target className="h-2.5 w-2.5 text-[var(--lime)]" /> Quest dnia
                      </span>
                      <span className="rounded-full bg-[var(--lime)]/15 px-2 py-0.5 text-[9px] font-semibold text-[var(--lime)]">+180 XP</span>
                    </div>
                    <p className="mt-1 font-display text-sm leading-snug">Push: klatka, barki, triceps</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <Zap className="h-2.5 w-2.5 text-[var(--orange)]" />
                      <span>+5 Siła · +1 Rozwój · streak +1</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-center text-xs text-muted-foreground">Twój awatar rośnie z Tobą</p>
            </div>
          </div>
        </div>
      </section>

      {/* social proof / quick stats */}
      <section className="border-y border-white/5 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {[
            { v: "5w1", l: "Trening · Dieta · Biegi · Mind Health · Gra RPG" },
            { v: "4.9★", l: "Średnia ocena testerów" },
            { v: "AI", l: "Plany dopasowane do Ciebie" },
            { v: "PWA", l: "Instalujesz w 5 sekund" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-3xl text-gradient">{s.v}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="relative">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
          <div className="mb-16 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— Funkcje</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">
              Wszystko w <span className="text-gradient">jednej apce</span>.
            </h2>
            <p className="mt-5 text-base text-muted-foreground">Zamiast pięciu aplikacji — jedno spójne miejsce, w którym Twoja forma rośnie razem ze statystykami i awatarem.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group relative overflow-hidden rounded-3xl glass p-7 transition hover:-translate-y-1">
                <div aria-hidden className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.tint} blur-2xl opacity-70 transition group-hover:opacity-100`} />
                <div className="relative">
                  <div className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/20 ring-1 ring-white/10">
                    <f.icon className="h-5 w-5 text-foreground" strokeWidth={2} />
                  </div>
                  <h3 className="mt-6 font-display text-2xl tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* magazine row */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {src: moduleStrength, t: "Siłownia"},
              {src: moduleNutrition, t: "Dieta i Przepisy"},
              {src: moduleStreet, t: "Street Workout"},
              {src: moduleRunning, t: "Biegi i Kroki"},
              {src: moduleMindHealth, t: "Mind Health"},
              {src: moduleWomen, t: "Dla Kobiet"},
            ].map((c) => (
              <div key={c.t} className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
                <img src={c.src} alt={c.t} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" width={768} height={960} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Moduł</p>
                  <p className="font-display text-2xl">{c.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-28 md:py-36">
          <div className="mb-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— Cennik</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Prosto i <span className="text-gradient">uczciwie</span>.</h2>
            <p className="mt-4 text-sm text-muted-foreground">Bez ukrytych kosztów. Anuluj kiedy chcesz.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-3xl p-10 ${
                  p.highlight
                    ? "border border-[var(--orange)]/40 bg-gradient-to-br from-[var(--magenta)]/15 via-[var(--orange)]/10 to-[var(--lime)]/10 glow-primary"
                    : "glass"
                }`}
              >
                {p.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-background">
                    <Trophy className="mr-1 inline h-3 w-3" /> {p.badge}
                  </span>
                )}
                <h3 className="font-display text-3xl tracking-tight">{p.name}</h3>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className={`font-display text-5xl tracking-tight ${p.highlight ? "text-gradient" : ""}`}>{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.tag}</span>
                </div>
                <ul className="mt-10 space-y-3.5 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--lime)]/20 text-[var(--lime)]"><Check className="h-3 w-3" /></span>
                      <span className="text-foreground/85">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboarding"
                  className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-sm font-semibold transition active:scale-[0.98] ${
                    p.highlight
                      ? "bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] text-background glow-primary"
                      : "glass text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-28 md:py-36">
          <div className="mb-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— FAQ</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Częste Pytania</h2>
          </div>
          <div className="divide-y divide-white/5 rounded-3xl glass px-6">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={i}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="block w-full text-left transition"
                >
                  <div className="flex items-center justify-between gap-6 py-6">
                    <span className="font-display text-lg md:text-xl">{item.q}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5">
                      {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                  {open && <p className="pb-6 pr-10 text-sm leading-relaxed text-muted-foreground">{item.a}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* download */}
      <section id="download" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-28 md:py-36">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[var(--magenta)]/20 via-[var(--orange)]/15 to-[var(--lime)]/15 px-8 py-20 text-center glow-primary">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--magenta)]/30 blur-3xl" />
              <div className="absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--lime)]/25 blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— Pobierz</p>
              <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Zainstaluj <span className="text-gradient">GymWRLD</span>.</h2>
              <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">Działa jako PWA — dodaj do ekranu początkowego i otwieraj jak natywną apkę. Wersje App Store i Google Play wkrótce.</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link to="/onboarding" className="rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-7 py-4 text-sm font-semibold text-background glow-primary">
                  Otwórz w przeglądarce
                </Link>
                <button disabled className="cursor-not-allowed rounded-full glass px-7 py-4 text-sm text-muted-foreground">App Store · wkrótce</button>
                <button disabled className="cursor-not-allowed rounded-full glass px-7 py-4 text-sm text-muted-foreground">Google Play · wkrótce</button>
              </div>
              <p className="mt-8 text-xs text-muted-foreground">Na iPhone: otwórz w Safari → Udostępnij → „Do ekranu początkowego”.</p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="GymWRLD" className="h-24 w-auto md:h-32" />
            </div>
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground">Polityka prywatności</Link>
              <Link to="/auth" className="hover:text-foreground">Logowanie</Link>
              <a href="mailto:hi@gymwrld.com" className="hover:text-foreground">Kontakt</a>
            </nav>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} GymWRLD. Wszelkie prawa zastrzeżone. · gymwrld.com
          </div>
        </div>
      </footer>
    </div>
  );
}