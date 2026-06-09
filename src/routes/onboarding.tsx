import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, ChevronRight, Check, Sparkles, Lock, Eye, EyeOff, Shuffle, MapPin } from "lucide-react";
import logoAsset from "@/assets/gymwrld-logo.png.asset.json";
import { DEFAULT_AVATAR, type AvatarConfig } from "@/components/AvatarSvg";
import { computeNutrition, writeNutrition } from "@/lib/nutrition";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ensureCloudProfile } from "@/lib/auth-flow";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Witaj w GymWrld" }] }),
  component: Onboarding,
});

type Goal = "masa" | "redukcja" | "kondycja" | "zdrowie";
type Level = "poczatkujacy" | "sredni" | "zaawansowany";
type Gender = "m" | "k" | "nb";

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayLogged, setStayLogged] = useState(true);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState<string>("");
  const [floLinked, setFloLinked] = useState<boolean | null>(null);
  const [floPromptOpen, setFloPromptOpen] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [freq, setFreq] = useState(3);

  useEffect(() => {
    if (typeof window === "undefined") return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) ensureCloudProfile(data.user);
    });
  }, []);

  const finish = async () => {
    // 1. Create Supabase account if we have email+password and there's no active session
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session && email && password.length >= 8) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, nickname },
          },
        });
        if (error && !/already/i.test(error.message)) {
          toast.error(error.message);
        }
      }
      // 2. Save profile to database (if logged in)
      const { data: sess2 } = await supabase.auth.getSession();
      if (sess2.session?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: sess2.session.user.id,
          email: email || sess2.session.user.email,
          name, nickname, city, gender, age: Number(age) || null,
          weight: Number(weight) || null, height: Number(height) || null,
          goals, level, freq, flo_linked: !!floLinked,
        });
        if (profileError) throw profileError;
      }
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się zapisać profilu w backendzie");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("gw_onboarded", "1");
      if (stayLogged) localStorage.setItem("gw_session_persist", "1");
      else localStorage.removeItem("gw_session_persist");
      localStorage.setItem("gw_profile", JSON.stringify({ name, nickname, email, goals, level, freq, age, gender, city, floLinked: !!floLinked, lvl: 1, xp: 0, stats: { sila: 0, kondycja: 0, dieta: 0, sen: 0, rozwoj: 0 } }));
      localStorage.setItem("gw_avatar", JSON.stringify(avatar));
      localStorage.setItem("gw_body", JSON.stringify({ weight: Number(weight) || 0, height: Number(height) || 0, chest: 0, waist: 0, hips: 0, biceps: 0, thigh: 0 }));
      const n = computeNutrition({ gender, age: Number(age) || undefined, weight: Number(weight) || undefined, height: Number(height) || undefined, freq, goals });
      writeNutrition(n);
    }
    toast.success("Witaj w GymWrld!", { description: `Twoje dzienne zapotrzebowanie: ~${computeNutrition({ gender, age: Number(age) || undefined, weight: Number(weight) || undefined, height: Number(height) || undefined, freq, goals }).kcal} kcal` });
    navigate({ to: "/" });
  };

  const total = 7;
  const progress = ((step + 1) / total) * 100;

  // First screen: pure black, huge logo only.
  if (step === 0) {
    return (
      <main className="relative flex min-h-screen flex-col items-center bg-black px-5 pt-10 pb-10 text-white">
        <div className="flex flex-1 items-center justify-center w-full">
          <img
            src={logoAsset.url}
            alt="GymWrld"
            className="mx-auto block w-[62%] max-w-[360px]"
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 8px 40px rgba(255,255,255,0.18))" }}
          />
        </div>
        <div className="w-full max-w-[480px]">
          <StepAuth email={email} setEmail={setEmail} password={password} setPassword={setPassword} stayLogged={stayLogged} setStayLogged={setStayLogged} onNext={() => setStep(1)} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pt-10 pb-10">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--magenta)]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[var(--lime)]/15 blur-3xl" />

      <header className="relative flex flex-col items-center">
        <img
          src={logoAsset.url}
          alt="GymWrld"
          className="h-20 w-auto"
          style={{ filter: "brightness(0) invert(1) drop-shadow(0 4px 28px rgba(255,255,255,0.15))" }}
        />
        <span className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{step + 1} / {total}</span>
      </header>

      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="relative mt-8">
        {step === 1 && (
          <StepName name={name} setName={setName} nickname={nickname} setNickname={setNickname} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepPersonal
            age={age} setAge={setAge}
            weight={weight} setWeight={setWeight}
            height={height} setHeight={setHeight}
            gender={gender} setGender={setGender}
            onGenderPick={(g) => {
              setGender(g);
              if (g === "k" && floLinked === null) setFloPromptOpen(true);
            }}
            onNext={() => { setAvatar((a) => ({ ...a, gender: gender ?? a.gender })); setStep(3); }}
          />
        )}
        {step === 3 && (
          <StepCity city={city} setCity={setCity} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <StepMultiChoice
            title="Jaki masz cel?"
            subtitle="Wybierz jeden główny cel — pod niego dopasujemy plan."
            options={[
              { id: "masa", label: "Budowa masy", emoji: "💪" },
              { id: "redukcja", label: "Redukcja tłuszczu", emoji: "🔥" },
              { id: "kondycja", label: "Lepsza kondycja", emoji: "⚡" },
              { id: "zdrowie", label: "Zdrowy styl życia", emoji: "🌿" },
            ]}
            values={goals}
            onToggle={(v) => setGoals([v as Goal])}
            onNext={() => setStep(5)}
            canNext={goals.length > 0}
          />
        )}
        {step === 5 && (
          <StepChoice
            title="Twój poziom"
            subtitle="Zaczynamy od miejsca, w którym jesteś."
            options={[
              { id: "poczatkujacy", label: "Początkujący", emoji: "🌱" },
              { id: "sredni", label: "Średniozaawansowany", emoji: "🚀" },
              { id: "zaawansowany", label: "Zaawansowany", emoji: "👑" },
            ]}
            value={level}
            onChange={(v) => setLevel(v as Level)}
            onNext={() => setStep(6)}
            canNext={!!level}
          />
        )}
        {step === 6 && (
          <StepFreq freq={freq} setFreq={setFreq} onFinish={finish} />
        )}
      </section>
      {floPromptOpen && (
        <FloPrompt
          onSkip={() => { setFloLinked(false); setFloPromptOpen(false); }}
          onLink={() => { setFloLinked(true); setFloPromptOpen(false); toast.success("Połączono z FLO 🌸"); }}
        />
      )}
    </main>
  );
}

function StepName({
  name, setName, nickname, setNickname, onNext,
}: {
  name: string; setName: (v: string) => void;
  nickname: string; setNickname: (v: string) => void;
  onNext: () => void;
}) {
  const cleanNick = nickname.replace(/[^a-z0-9_\.]/gi, "").toLowerCase();
  const canNext = name.trim().length >= 2 && cleanNick.length >= 2;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">Jak mamy <span className="text-gradient">Cię nazwać?</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Twoje imię i nick widoczny w profilu.</p>
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Imię</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Anna"
          className="w-full rounded-2xl glass px-4 py-3.5 font-display text-xl outline-none placeholder:text-muted-foreground/40"
        />
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Nick (publiczny)</p>
        <div className="flex items-center gap-2 rounded-2xl glass px-4 py-3.5">
          <span className="text-muted-foreground">@</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_\.]/g, "").toLowerCase())}
            placeholder="twoj_nick"
            className="flex-1 bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/40"
            maxLength={20}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">2–20 znaków · litery, cyfry, _ i .</p>
      </div>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
      >
        Dalej <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}


function StepPersonal({
  age, setAge, weight, setWeight, height, setHeight, gender, setGender, onNext, onGenderPick,
}: {
  age: number | ""; setAge: (v: number | "") => void;
  weight: number | ""; setWeight: (v: number | "") => void;
  height: number | ""; setHeight: (v: number | "") => void;
  gender: Gender | null; setGender: (g: Gender) => void;
  onNext: () => void;
  onGenderPick: (g: Gender) => void;
}) {
  const genders: { id: Gender; label: string; emoji: string }[] = [
    { id: "m", label: "Mężczyzna", emoji: "♂" },
    { id: "k", label: "Kobieta", emoji: "♀" },
    { id: "nb", label: "Non-binary", emoji: "⚧" },
  ];
  const canNext = !!age && Number(age) >= 13 && Number(age) <= 99 && !!gender
    && !!weight && Number(weight) >= 30 && Number(weight) <= 250
    && !!height && Number(height) >= 120 && Number(height) <= 230;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">Trochę o <span className="text-gradient">Tobie</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Obliczymy Twoje dzienne zapotrzebowanie kalorii i makro.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumField label="Wiek" unit="lat" value={age} onChange={setAge} min={13} max={99} placeholder="24" />
        <NumField label="Wzrost" unit="cm" value={height} onChange={setHeight} min={120} max={230} placeholder="175" />
        <NumField label="Waga" unit="kg" value={weight} onChange={setWeight} min={30} max={250} placeholder="70" step="0.1" />
      </div>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Płeć</p>
        <div className="grid grid-cols-3 gap-2">
          {genders.map((g) => {
            const active = gender === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onGenderPick(g.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3.5 transition ${
                  active
                    ? "bg-gradient-to-br from-[var(--magenta)]/30 to-[var(--lime)]/15 ring-1 ring-[var(--magenta)]/60"
                    : "glass"
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-medium">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
      >
        Dalej <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function NumField({ label, unit, value, onChange, min, max, placeholder, step }: { label: string; unit: string; value: number | ""; onChange: (v: number | "") => void; min: number; max: number; placeholder: string; step?: string }) {
  return (
    <label className="rounded-2xl glass p-3">
      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">{label} · {unit}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : "")}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-center font-display text-2xl outline-none placeholder:text-muted-foreground/40"
      />
    </label>
  );
}

function FloPrompt({ onSkip, onLink }: { onSkip: () => void; onLink: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--magenta)] to-[var(--orange)] text-2xl">🌸</div>
          <h3 className="mt-3 font-display text-2xl">Połącz z aplikacją FLO?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Synchronizuj cykl miesiączkowy, by GymWrld dopasował trening i regenerację do Twojej fazy.</p>
        </div>
        <div className="mt-5 space-y-2">
          <button onClick={onLink} className="w-full rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary">
            Połącz z FLO
          </button>
          <button onClick={onSkip} className="w-full rounded-2xl bg-white/5 px-5 py-3 text-sm text-muted-foreground">
            Może później
          </button>
        </div>
      </div>
    </div>
  );
}

function StepMultiChoice({
  title, subtitle, options, values, onToggle, onNext, canNext,
}: {
  title: string; subtitle: string;
  options: { id: string; label: string; emoji: string }[];
  values: string[]; onToggle: (v: string) => void;
  onNext: () => void; canNext: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2.5">
        {options.map((o) => {
          const active = values.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => onToggle(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${
                active
                  ? "bg-gradient-to-r from-[var(--magenta)]/20 via-[var(--orange)]/15 to-[var(--lime)]/15 ring-1 ring-[var(--orange)]/50"
                  : "glass"
              }`}
            >
              <span className="text-2xl">{o.emoji}</span>
              <span className="flex-1 text-sm font-medium">{o.label}</span>
              {active && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--lime)] text-background">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
      >
        Dalej <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

const PL_CITIES = [
  { id: "warszawa", name: "Warszawa", lat: 52.2297, lon: 21.0122 },
  { id: "krakow", name: "Kraków", lat: 50.0647, lon: 19.945 },
  { id: "poznan", name: "Poznań", lat: 52.4064, lon: 16.9252 },
  { id: "gdansk", name: "Gdańsk", lat: 54.352, lon: 18.6466 },
  { id: "gdynia", name: "Gdynia", lat: 54.5189, lon: 18.5305 },
  { id: "wroclaw", name: "Wrocław", lat: 51.1079, lon: 17.0385 },
  { id: "torun", name: "Toruń", lat: 53.0138, lon: 18.5984 },
  { id: "bydgoszcz", name: "Bydgoszcz", lat: 53.1235, lon: 18.0084 },
  { id: "lodz", name: "Łódź", lat: 51.7592, lon: 19.4559 },
  { id: "szczecin", name: "Szczecin", lat: 53.4285, lon: 14.5528 },
  { id: "katowice", name: "Katowice", lat: 50.2649, lon: 19.0238 },
  { id: "lublin", name: "Lublin", lat: 51.2465, lon: 22.5684 },
  { id: "bialystok", name: "Białystok", lat: 53.1325, lon: 23.1688 },
  { id: "rzeszow", name: "Rzeszów", lat: 50.0413, lon: 21.999 },
];

function StepCity({ city, setCity, onNext }: { city: string; setCity: (v: string) => void; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">Skąd <span className="text-gradient">jesteś?</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Dobierzemy lokalne wydarzenia, trasy i zawody w Twoim mieście.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {PL_CITIES.map((c) => {
          const active = city === c.id;
          return (
            <button key={c.id} onClick={() => setCity(c.id)} className={`flex items-center gap-2 rounded-2xl p-3.5 text-left transition ${active ? "bg-gradient-to-br from-[var(--magenta)]/25 to-[var(--lime)]/15 ring-1 ring-[var(--magenta)]/60" : "glass"}`}>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{c.name}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={!city}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
      >
        Dalej <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function StepAuth({ email, setEmail, password, setPassword, stayLogged, setStayLogged, onNext }: { email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void; stayLogged: boolean; setStayLogged: (v: boolean) => void; onNext: () => void }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const generate = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
    let p = "";
    for (let i = 0; i < 14; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p);
    setShow(true);
    toast.success("Wygenerowano silne hasło — zapisz je!");
  };
  const google = async () => {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) toast.error("Google: " + r.error.message);
      else if (!r.redirected) onNext();
    } finally { setBusy(false); }
  };
  const resetPwd = async () => {
    if (!email.includes("@")) return toast.error("Podaj e-mail powyżej");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?recovery=1` });
    if (error) toast.error(error.message);
    else toast.success(`Link do resetu wysłany na ${email}`);
  };
  const canNext = email.includes("@") && password.length >= 8;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl leading-tight">
          Zbuduj swoją <span className="text-gradient">najlepszą wersję</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Zaloguj się i zacznij rozwijać swoją postać.</p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={google}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition active:scale-[0.98]"
        >
          <GoogleIcon /> Kontynuuj z Google
        </button>
        <button
          onClick={() => toast("Apple sign-in wkrótce")}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-3.5 text-sm font-semibold text-white ring-1 ring-white/15 transition active:scale-[0.98]"
        >
          <AppleIcon /> Kontynuuj z Apple
        </button>
      </div>

      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-white/10" /> lub email <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 rounded-2xl glass px-4 py-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl glass px-4 py-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="hasło (min. 8 znaków)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button type="button" onClick={generate} title="Wygeneruj hasło" className="text-muted-foreground">
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <label className="inline-flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" checked={stayLogged} onChange={(e) => setStayLogged(e.target.checked)} className="accent-[var(--magenta)]" />
            Pozostań zalogowany
          </label>
          <button type="button" onClick={resetPwd} className="text-[var(--magenta)] hover:underline">
            Zapomniałem hasła
          </button>
        </div>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
        >
          Dalej <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Kontynuując akceptujesz Regulamin i Politykę prywatności.
      </p>
    </div>
  );
}

export { PL_CITIES };

function StepChoice({
  title, subtitle, options, value, onChange, onNext, canNext,
}: {
  title: string; subtitle: string;
  options: { id: string; label: string; emoji: string }[];
  value: string | null; onChange: (v: string) => void;
  onNext: () => void; canNext: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2.5">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${
                active
                  ? "bg-gradient-to-r from-[var(--magenta)]/20 via-[var(--orange)]/15 to-[var(--lime)]/15 ring-1 ring-[var(--orange)]/50"
                  : "glass"
              }`}
            >
              <span className="text-2xl">{o.emoji}</span>
              <span className="flex-1 text-sm font-medium">{o.label}</span>
              {active && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--lime)] text-background">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary transition disabled:opacity-40"
      >
        Dalej <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function StepFreq({ freq, setFreq, onFinish }: { freq: number; setFreq: (n: number) => void; onFinish: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">Ile treningów <span className="text-gradient">tygodniowo?</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Realnie — zaczynamy w Twoim tempie.</p>
      </div>

      <div className="rounded-3xl glass p-6 text-center">
        <p className="font-display text-7xl text-gradient">{freq}</p>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">treningów / tydzień</p>
        <input
          type="range"
          min={1}
          max={7}
          value={freq}
          onChange={(e) => setFreq(parseInt(e.target.value))}
          className="mt-6 w-full accent-[var(--orange)]"
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {[1,2,3,4,5,6,7].map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>

      <button
        onClick={onFinish}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] px-5 py-3.5 text-sm font-semibold text-background glow-primary"
      >
        <Sparkles className="h-4 w-4" /> Stwórz moją postać
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.49-.12-1.06.396-2.2 1.085-2.99.737-.84 1.99-1.5 3.079-1.58zM21.5 17.21c-.578 1.34-.857 1.94-1.6 3.13-1.038 1.66-2.5 3.72-4.31 3.74-1.61.02-2.02-1.05-4.2-1.04-2.18.01-2.63 1.06-4.24 1.04-1.81-.02-3.2-1.88-4.24-3.54C.022 16.91-.314 12.32 1.46 9.62c1.26-1.92 3.25-3.05 5.12-3.05 1.9 0 3.1 1.05 4.67 1.05 1.52 0 2.45-1.05 4.65-1.05 1.67 0 3.43.91 4.69 2.49-4.12 2.26-3.45 8.15.91 8.15z"/></svg>
  );
}