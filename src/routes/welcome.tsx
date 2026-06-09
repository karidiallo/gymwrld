import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Dumbbell, Apple, MapPin, Footprints, Heart, Sparkles, Plus, Minus, Check, Flame, Trophy, Smartphone, Target, Zap, Moon } from "lucide-react";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import avatarMale from "@/assets/avatar-male-athletic-crop.png";
import avatarFemale from "@/assets/avatar-female-athletic-crop.png";
import gymHero from "@/assets/gym-hero.jpg";
import foodHero from "@/assets/food-hero.jpg";
import calisthenicsHero from "@/assets/calisthenics-hero.jpg";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "GYMWRLD. — Twoja cyfrowa wersja siebie" },
      { name: "description", content: "Premium aplikacja: trening, dieta, street workout, biegi i cykl. Jedna apka, którą rozwijasz razem ze swoim awatarem." },
      { property: "og:title", content: "GYMWRLD." },
      { property: "og:description", content: "Premium aplikacja treningowa. Trenuj świadomie." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WelcomePage,
});

const FEATURES = [
  { icon: Dumbbell, title: "Trening siłowy", desc: "Loguj serie, ciężary i powtórzenia. Statystyka Siła rośnie wraz z intensywnością — widzisz realny progres tydzień po tygodniu.", tint: "from-[var(--magenta)]/40 to-[var(--orange)]/20" },
  { icon: Apple, title: "Dieta i przepisy", desc: "Twoje kcal i makro wyliczone z wagi, wzrostu i celu. Baza polskich przepisów + możliwość dodania własnego — zatwierdzimy go w aplikacji.", tint: "from-[var(--orange)]/40 to-[var(--lime)]/20" },
  { icon: MapPin, title: "Street Workout", desc: "Mapa realnych parków kalistenicznych w Twoim mieście. Klikasz pin — przechodzisz do wizytówki Google z opiniami i nawigacją.", tint: "from-[var(--lime)]/40 to-[var(--violet)]/20" },
  { icon: Footprints, title: "Biegi i kroki", desc: "Tryb maraton, dzienny licznik kroków, kalorie i historia tras. Bieg na siłowni lub w parku — kondycja rośnie adekwatnie do dystansu.", tint: "from-[var(--violet)]/40 to-[var(--magenta)]/20" },
  { icon: Heart, title: "Cykl i regeneracja", desc: "Tracker cyklu (połącz z FLO), pomiar snu, wymiary ciała i strefa reset. Plan dopasowuje intensywność do Twojej fazy.", tint: "from-[var(--magenta)]/40 to-[var(--violet)]/20" },
  { icon: Sparkles, title: "Awatar i questy", desc: "Twoja cyfrowa postać rośnie z każdym treningiem. Codzienne questy dają XP, odblokowujesz poziomy, pokoje sanktuarium i lokalne promocje.", tint: "from-[var(--orange)]/40 to-[var(--magenta)]/20" },
];

const FAQ = [
  { q: "Czy GymWrld jest darmowy?", a: "Tak. Trening, dieta, mapa, biegi i cykl są w pełni darmowe. Premium odblokowuje plany AI, dodatkowe pokoje sanktuarium i ekskluzywne promocje lokalne." },
  { q: "Czy mogę zainstalować GymWrld na telefonie?", a: "Tak — działamy jako PWA. Na iPhone otwórz w Safari i wybierz „Dodaj do ekranu początkowego”. Wersje natywne App Store i Google Play są w drodze." },
  { q: "Czy moje dane są bezpieczne?", a: "Tak. Konto i dane treningowe trzymamy w zaszyfrowanej bazie z polityką dostępu RLS. W każdej chwili wyeksportujesz lub usuniesz konto." },
  { q: "Czym różnicie się od FLO, Stravy i MyFitnessPal?", a: "Jedna aplikacja zamiast pięciu. Łączymy siłownię, dietę, kalistenikę, bieg i cykl — z gamifikacją i awatarem, który rozwija się razem z Tobą." },
  { q: "Czy potrzebuję sprzętu?", a: "Nie. Mamy plany na masę ciała, gumy, oraz pełną siłownię — dobieramy ćwiczenia pod Twój sprzęt." },
];

const PLANS = [
  { name: "Free", price: "0 zł", tag: "Na zawsze", features: ["Trening, dieta, biegi, cykl", "Mapa Street Workout", "Podstawowy awatar", "Statystyki i poziomy"], cta: "Zacznij za darmo", highlight: false },
  { name: "Premium", price: "29 zł", tag: "/ miesiąc", features: ["Wszystko z Free", "Plany AI dopasowane do Ciebie", "Wszystkie pokoje sanktuarium", "Ekskluzywne promocje lokalne", "Priorytetowe wsparcie"], cta: "Wypróbuj 7 dni gratis", highlight: true },
];

function WelcomePage() {
  const logo = logoAsset.url;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
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
            <img src={logo} alt="GYMWRLD" className="h-9 w-auto" />
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
              Siłownia, dieta, street workout, biegi i cykl — pięć aplikacji w jednej. Każdy trening rozwija Twojego awatara, podbija statystyki i odblokowuje questy. Bez chaosu, z planem.
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
                <span className="text-foreground font-semibold">2 000+</span> osób buduje formę razem z GymWrld
              </div>
            </div>
          </div>

          {/* Hero stats / quest panel */}
          <div className="relative">
            <div aria-hidden className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[var(--magenta)]/30 via-[var(--orange)]/20 to-[var(--lime)]/20 blur-3xl" />
            <div className="relative mx-auto w-full max-w-[420px] space-y-3">
              {/* Level card */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--surface)] to-background p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-background font-display text-lg">7</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Twój poziom</p>
                      <p className="font-display text-lg">Średniozaawansowany</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px]"><Flame className="h-3 w-3 text-[var(--orange)]" /> 12 dni z rzędu</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">1 440 / 2 000 XP do Lvl 8</span>
                  <span className="font-semibold text-foreground">72%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)]" />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Dumbbell, label: "Siła", v: 68, color: "var(--magenta)" },
                  { icon: Footprints, label: "Kondycja", v: 54, color: "var(--orange)" },
                  { icon: Moon, label: "Sen", v: 81, color: "var(--violet)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-[var(--surface)]/70 p-3.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                      <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="mt-2 font-display text-2xl">{s.v}<span className="text-xs text-muted-foreground">/100</span></p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${s.v}%`, background: `linear-gradient(90deg, ${s.color}, var(--lime))` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Active quest */}
              <div className="rounded-3xl border border-[var(--orange)]/30 bg-gradient-to-br from-[var(--magenta)]/15 via-[var(--orange)]/10 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <Target className="h-3 w-3 text-[var(--lime)]" /> Quest dnia
                  </span>
                  <span className="rounded-full bg-[var(--lime)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--lime)]">+180 XP</span>
                </div>
                <p className="mt-2 font-display text-lg leading-snug">Push: klatka, barki, triceps</p>
                <p className="mt-1 text-xs text-muted-foreground">8 ćwiczeń · ~45 min · siłownia lub dom z gumami</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-[var(--orange)]" />
                  <span>+5 Siła · +1 Rozwój · streak +1</span>
                </div>
              </div>

              {/* avatars peek */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--surface)]/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <img src={avatarFemale} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-background bg-[var(--surface)]" />
                    <img src={avatarMale} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-background bg-[var(--surface)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Twój awatar rośnie z Tobą</p>
                    <p className="text-[10px] text-muted-foreground">Kobieta · mężczyzna · non-binary</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* social proof / quick stats */}
      <section className="border-y border-white/5 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {[
            { v: "5w1", l: "Trening · dieta · biegi · cykl · awatar" },
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
            {[{src: gymHero, t: "Siłownia"}, {src: foodHero, t: "Dieta"}, {src: calisthenicsHero, t: "Street"}].map((c) => (
              <div key={c.t} className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
                <img src={c.src} alt={c.t} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
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
          <div className="grid gap-6 md:grid-cols-2">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-3xl p-10 ${
                  p.highlight
                    ? "border border-[var(--orange)]/40 bg-gradient-to-br from-[var(--magenta)]/15 via-[var(--orange)]/10 to-[var(--lime)]/10 glow-primary"
                    : "glass"
                }`}
              >
                {p.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-background">
                    <Trophy className="mr-1 inline h-3 w-3" /> Polecane
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
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Często pytane.</h2>
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
              <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Zainstaluj <span className="text-gradient">GymWrld</span>.</h2>
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
              <img src={logo} alt="GYMWRLD" className="h-10 w-auto" />
              <span className="font-display text-xl tracking-tight">GymWrld<span className="text-gradient">.</span></span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground">Polityka prywatności</Link>
              <Link to="/auth" className="hover:text-foreground">Logowanie</Link>
              <a href="mailto:hi@gymwrld.com" className="hover:text-foreground">Kontakt</a>
            </nav>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} GymWrld. Wszelkie prawa zastrzeżone. · gymwrld.com
          </div>
        </div>
      </footer>
    </div>
  );
}