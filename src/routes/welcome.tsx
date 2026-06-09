import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Dumbbell, Apple, MapPin, Footprints, Heart, Sparkles, Plus, Minus, Check } from "lucide-react";
import logoAsset from "@/assets/gymwrld-wordmark.png.asset.json";

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
  { icon: Dumbbell, title: "Trening siłowy", desc: "Plany dobrane przez AI, log ciężarów, timer odpoczynku i analiza progresji." },
  { icon: Apple, title: "Dieta i przepisy", desc: "Makra, lista posiłków i baza przepisów z możliwością dodawania własnych." },
  { icon: MapPin, title: "Street Workout", desc: "Interaktywna mapa realnych parków kalistenicznych w Twoim mieście." },
  { icon: Footprints, title: "Biegi & kroki", desc: "Maraton mode, dzienne kroki, kalorie i trasy wokół Ciebie." },
  { icon: Heart, title: "Cykl & regeneracja", desc: "Pełen tracker cyklu, sen, wymiary ciała i strefa regeneracji." },
  { icon: Sparkles, title: "Awatar & poziomy", desc: "Twoja cyfrowa postać rośnie z każdym treningiem. Odblokuj pokoje sanktuarium." },
];

const FAQ = [
  { q: "Czy GymWrld jest darmowy?", a: "Tak. Trening, dieta, mapa, biegi i cykl są w pełni darmowe. Premium odblokowuje plany AI, dodatkowe pokoje sanktuarium i ekskluzywne promocje lokalne." },
  { q: "Czy mogę zainstalować GymWrld na telefonie?", a: "Tak — działamy jako PWA. Na iPhone otwórz w Safari i wybierz „Dodaj do ekranu początkowego". Wersje natywne App Store i Google Play są w drodze." },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* nav */}
      <header className={`fixed inset-x-0 top-0 z-40 transition ${scrolled ? "backdrop-blur-xl bg-black/70 border-b border-white/5" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center">
            <img src={logo} alt="GYMWRLD" className="h-6" />
          </a>
          <nav className="hidden gap-8 text-[13px] text-white/55 md:flex">
            <a href="#features" className="hover:text-white">Funkcje</a>
            <a href="#pricing" className="hover:text-white">Cennik</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <a href="#download" className="hover:text-white">Pobierz</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden text-[13px] text-white/55 hover:text-white sm:inline-block">Zaloguj</Link>
            <Link to="/onboarding" className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-black hover:bg-white/90">
              Zacznij
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="relative overflow-hidden pt-40 pb-32">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute left-1/2 top-1/4 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <span className="h-1 w-1 rounded-full bg-white" /> Twoja cyfrowa wersja siebie
          </div>

          <h1 className="mx-auto mt-10 max-w-4xl font-display text-[3.5rem] leading-[0.95] tracking-tight md:text-[6.5rem]">
            Buduj formę.<br />
            <span className="text-white/40">Trenuj świadomie.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-base text-white/55 md:text-lg">
            Siłownia, dieta, kalistenika, biegi i cykl — w jednej apce. Z gamifikacją i awatarem, który rośnie razem z Tobą.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onboarding" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/90">
              Zacznij za darmo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-7 py-3.5 text-sm text-white/80 transition hover:bg-white/[0.05]">
              Mam już konto
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/35">Bez karty · 7 dni Premium gratis</p>
        </div>

        {/* large wordmark backdrop */}
        <div aria-hidden className="relative mt-24 px-6">
          <img src={logo} alt="" className="mx-auto block w-[88%] max-w-5xl opacity-[0.06]" />
        </div>
      </section>

      {/* features */}
      <section id="features" className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <div className="mb-20 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">— Funkcje</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">
              Wszystko w jednej apce.
            </h2>
            <p className="mt-5 text-base text-white/55">Zamiast pięciu aplikacji — jedno spójne miejsce, w którym Twoja forma rośnie razem ze statystykami i awatarem.</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/[0.06] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group relative bg-black p-8 transition hover:bg-white/[0.02]">
                <f.icon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                <h3 className="mt-8 font-display text-2xl tracking-tight">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="mb-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">— Cennik</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Prosto i uczciwie.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-3xl border p-10 ${
                  p.highlight
                    ? "border-white/20 bg-gradient-to-b from-white/[0.06] to-transparent"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                {p.highlight && (
                  <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-black px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                    Polecane
                  </span>
                )}
                <h3 className="font-display text-3xl tracking-tight">{p.name}</h3>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl tracking-tight">{p.price}</span>
                  <span className="text-sm text-white/40">{p.tag}</span>
                </div>
                <ul className="mt-10 space-y-3.5 text-sm text-white/75">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboarding"
                  className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium transition ${
                    p.highlight ? "bg-white text-black hover:bg-white/90" : "border border-white/10 text-white hover:bg-white/[0.04]"
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
        <div className="mx-auto max-w-3xl px-6 py-32">
          <div className="mb-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">— FAQ</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Pytania.</h2>
          </div>
          <div className="divide-y divide-white/5 border-y border-white/5">
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
                    {open ? <Minus className="h-4 w-4 shrink-0 text-white/50" /> : <Plus className="h-4 w-4 shrink-0 text-white/50" />}
                  </div>
                  {open && <p className="pb-6 pr-10 text-sm leading-relaxed text-white/55">{item.a}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* download */}
      <section id="download" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-8 py-20 text-center">
            <img src={logo} alt="" aria-hidden className="absolute left-1/2 top-1/2 w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.04]" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">— Pobierz</p>
              <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">Zainstaluj GymWrld.</h2>
              <p className="mx-auto mt-5 max-w-md text-sm text-white/55">Dostępne jako PWA na każdym telefonie. Wersje natywne App Store i Google Play wkrótce.</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link to="/onboarding" className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black hover:bg-white/90">
                  Otwórz w przeglądarce
                </Link>
                <button disabled className="cursor-not-allowed rounded-full border border-white/10 px-7 py-3.5 text-sm text-white/40">App Store · wkrótce</button>
                <button disabled className="cursor-not-allowed rounded-full border border-white/10 px-7 py-3.5 text-sm text-white/40">Google Play · wkrótce</button>
              </div>
              <p className="mt-8 text-xs text-white/35">Na iPhone: otwórz w Safari → Udostępnij → „Do ekranu początkowego".</p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
            <img src={logo} alt="GYMWRLD" className="h-7" />
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-white/55">
              <Link to="/privacy" className="hover:text-white">Polityka prywatności</Link>
              <Link to="/auth" className="hover:text-white">Logowanie</Link>
              <a href="mailto:hi@gymwrld.com" className="hover:text-white">Kontakt</a>
            </nav>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 text-xs text-white/35">
            © {new Date().getFullYear()} GymWrld. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}