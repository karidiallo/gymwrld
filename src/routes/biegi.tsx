import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Clock, Flame, Plus, Trophy, X, Calendar, Activity, Mountain } from "lucide-react";

export const Route = createFileRoute("/biegi")({
  head: () => ({ meta: [{ title: "Maraton & biegi — GymWrld" }, { name: "description", content: "Loguj swoje biegi, trasy i nadchodzące zawody." }] }),
  component: Biegi,
});

type Run = { id: string; km: number; min: number; pace: string; kcal: number; date: string; route: string };

const UPCOMING = [
  { id: "wmm", title: "Warsaw Marathon", date: "28 września 2026", city: "Warszawa", dist: "42.2 km", color: "from-[#5a0f0f] to-[#1a0202]" },
  { id: "krk", title: "Cracovia Half", date: "12 października 2026", city: "Kraków", dist: "21.1 km", color: "from-[#3b0a0a] to-[#0c0202]" },
  { id: "wro", title: "Wroclaw Night Run", date: "5 listopada 2026", city: "Wrocław", dist: "10 km", color: "from-[#1a0a3b] to-[#03020c]" },
];

function Biegi() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState<number | "">("");
  const [min, setMin] = useState<number | "">("");
  const [route, setRoute] = useState("");

  const save = () => {
    if (!km || !min) { toast.error("Podaj dystans i czas"); return; }
    const kmN = Number(km), minN = Number(min);
    const paceMin = minN / kmN;
    const m = Math.floor(paceMin);
    const s = Math.round((paceMin - m) * 60);
    const r: Run = {
      id: String(Date.now()),
      km: kmN,
      min: minN,
      pace: `${m}:${String(s).padStart(2, "0")} /km`,
      kcal: Math.round(kmN * 65),
      date: new Date().toLocaleDateString("pl"),
      route: route || "Trasa bez nazwy",
    };
    setRuns((p) => [r, ...p]);
    setKm(""); setMin(""); setRoute("");
    setOpen(false);
    toast.success(`Bieg ${kmN} km zapisany`);
  };

  const total = runs.reduce((s, r) => s + r.km, 0);

  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Maraton & biegi</span>
        <div className="h-9 w-9" />
      </header>

      {/* Hero */}
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#3b0a0a] via-[#1a0505] to-black p-5">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--orange)]/20 blur-3xl" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Twój dziennik biegacza</p>
        <h1 className="mt-1 font-display text-3xl text-white">Biegnij <span className="text-[var(--orange)]">dalej</span></h1>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Łącznie" value={`${total.toFixed(1)} km`} />
          <Stat label="Biegi" value={`${runs.length}`} />
          <Stat label="Streak" value="0 dni" />
        </div>
        <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
          <Plus className="h-4 w-4" /> Dodaj bieg
        </button>
      </section>

      {/* Map placeholder */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje trasy</h3>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a14] p-0">
        <div className="relative h-56">
          {/* faux map */}
          <div className="absolute inset-0" style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(74,222,128,0.18), transparent 50%)," +
              "radial-gradient(circle at 70% 60%, rgba(255,140,60,0.18), transparent 50%)," +
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 24px)," +
              "linear-gradient(180deg,#0b1a14,#050a08)",
          }} />
          <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full">
            <path d="M20,180 Q80,40 160,120 T380,60" stroke="url(#g)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ff6a3d" />
                <stop offset="1" stopColor="#bef264" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="180" r="6" fill="#bef264" />
            <circle cx="380" cy="60" r="6" fill="#ff6a3d" />
          </svg>
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white/80">
            <MapPin className="h-3 w-3" /> Park Łazienkowski · 5.2 km
          </div>
        </div>
      </div>

      {/* List */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Historia biegów</h3>
      {runs.length === 0 ? (
        <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">
          Brak biegów · dodaj pierwszy
        </div>
      ) : (
        <div className="space-y-2.5">
          {runs.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl glass p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--orange)]/15 text-[var(--orange)]"><Activity className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.route}</p>
                <p className="text-[11px] text-muted-foreground">{r.km} km · {r.min} min · {r.pace} · {r.kcal} kcal</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{r.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming races */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Nadchodzące zawody</h3>
      <div className="space-y-3">
        {UPCOMING.map((u) => (
          <button key={u.id} onClick={() => toast.success(`Zapisano zainteresowanie · ${u.title}`)} className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${u.color} p-5 text-left transition active:scale-[0.99]`}>
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
              <Trophy className="h-3 w-3" /> Reklama · partner
            </div>
            <p className="mt-1 font-display text-2xl text-white">{u.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/80">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Calendar className="h-3 w-3" /> {u.date}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><MapPin className="h-3 w-3" /> {u.city}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1"><Mountain className="h-3 w-3" /> {u.dist}</span>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bieg</p>
                <h3 className="font-display text-2xl">Dodaj sesję</h3>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumField label="Dystans (km)" value={km} onChange={setKm} step="0.1" placeholder="5.0" />
              <NumField label="Czas (min)" value={min} onChange={setMin} placeholder="28" />
            </div>
            <label className="mt-3 block rounded-2xl bg-white/[0.04] p-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Trasa</span>
              <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Park Łazienkowski" className="mt-1 w-full bg-transparent font-display text-lg outline-none placeholder:text-muted-foreground/40" />
            </label>
            <button onClick={save} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#7a1a1a] via-[var(--orange)] to-[var(--lime)] py-3.5 text-sm font-semibold text-background glow-primary">
              <Flame className="mr-1 inline h-4 w-4" /> Zapisz bieg
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/40 p-3">
      <p className="text-[10px] uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-0.5 font-display text-lg text-white">{value}</p>
    </div>
  );
}

function NumField({ label, value, onChange, placeholder, step }: { label: string; value: number | ""; onChange: (v: number | "") => void; placeholder?: string; step?: string }) {
  return (
    <label className="block rounded-2xl bg-white/[0.04] p-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
        className="mt-1 w-full bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/40"
      />
    </label>
  );
}