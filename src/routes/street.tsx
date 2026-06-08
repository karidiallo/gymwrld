import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, MapPin, Plus, X, Activity, Dumbbell, Info } from "lucide-react";
import { addLog, removeLog, updateLog } from "@/lib/training-log";
import { EntryActions } from "@/components/EntryActions";

export const Route = createFileRoute("/street")({
  head: () => ({ meta: [{ title: "Street Workout — GymWrld" }, { name: "description", content: "Mapa lokalnych outdoor siłek, baza ćwiczeń kalistenicznych i logowanie treningów." }] }),
  component: Street,
});

type Log = { id: string; name: string; sets: number; reps: number; ts: number };

const SPOTS = [
  { name: "Park Skaryszewski · Warszawa", dist: "2.1 km", x: 25, y: 60 },
  { name: "Pole Mokotowskie · Warszawa", dist: "4.3 km", x: 55, y: 35 },
  { name: "Park Jordana · Kraków", dist: "—", x: 75, y: 70 },
];

const STREET_EXERCISES = [
  { id: "pu", emoji: "💪", name: "Pull-up (podciąganie)", how: "Chwyt nachwytem na szerokość barków. Podciągnij się aż broda będzie nad drążkiem, opuść kontrolowanie." },
  { id: "di", emoji: "🦾", name: "Dips na poręczach", how: "Zegnij łokcie do 90°, trzymaj korpus lekko pochylony, wypchnij się do pełnego wyprostu." },
  { id: "mu", emoji: "🚀", name: "Muscle-up", how: "Eksplozywne podciągnięcie z pociągnięciem przez drążek do podporu. Zaczynaj od progresji: high pull-up + transitions." },
  { id: "lv", emoji: "🪂", name: "Front lever", how: "Z wisu zwinąć biodra i wyprostować ciało równolegle do ziemi. Trening progresją: tuck → adv. tuck → straddle → full." },
  { id: "hs", emoji: "🤸", name: "Handstand", how: "Stanie na rękach przy ścianie. Ramiona w pełnym wyproście, brzuch i pośladki spięte." },
  { id: "pi", emoji: "🧗", name: "Pistol squat", how: "Przysiad na jednej nodze, druga wyprostowana. Zachowaj proste plecy i piętę na ziemi." },
];

function Street() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState<number | "">(3);
  const [reps, setReps] = useState<number | "">(8);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_street");
      if (raw) setLogs(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    if (!name || !sets || !reps) { toast.error("Uzupełnij dane"); return; }
    const setsN = Number(sets), repsN = Number(reps);
    if (editingId) {
      const next = logs.map((l) => l.id === editingId ? { ...l, name, sets: setsN, reps: repsN } : l);
      setLogs(next);
      if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
      updateLog(editingId, { title: `${name}`, meta: { sets: setsN, reps: repsN } });
      toast.success("Wpis zaktualizowany");
    } else {
      const kcal = Math.round(setsN * repsN * 0.6);
      const log = addLog({ kind: "street", title: name, kcal, minutes: Math.max(5, Math.round(setsN * 1.5)), meta: { sets: setsN, reps: repsN } });
      const next: Log[] = [{ id: log.id, name, sets: setsN, reps: repsN, ts: log.ts }, ...logs];
      setLogs(next);
      if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
      toast.success("Zapisano ćwiczenie");
    }
    setName(""); setSets(3); setReps(8);
    setEditingId(null);
    setOpen(false);
  };

  const startEdit = (l: Log) => {
    setName(l.name); setSets(l.sets); setReps(l.reps);
    setEditingId(l.id);
    setOpen(true);
  };
  const remove = (id: string) => {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    if (typeof window !== "undefined") localStorage.setItem("gw_street", JSON.stringify(next));
    removeLog(id);
    toast.success("Wpis usunięty");
  };

  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/trening" className="grid h-9 w-9 place-items-center rounded-full glass">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Street Workout</span>
        <div className="h-9 w-9" />
      </header>

      <section className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a3b1a] via-[#0f2a14] to-black p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Outdoor calisthenics</p>
        <h1 className="mt-1 font-display text-3xl text-white">Trenuj <span className="text-[var(--lime)]">na zewnątrz</span></h1>
        <p className="mt-1 text-xs text-white/70">Mapa lokalnych siłek, baza ćwiczeń i logowanie progresji.</p>
        <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
          <Plus className="h-4 w-4" /> Dodaj ćwiczenie
        </button>
      </section>

      {/* Map */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Lokalne siłki</h3>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a14]">
        <div className="relative h-56" style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(74,222,128,0.18), transparent 50%)," +
            "radial-gradient(circle at 70% 40%, rgba(190,242,100,0.15), transparent 50%)," +
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 24px)," +
            "linear-gradient(180deg,#0b1a14,#050a08)",
        }}>
          {SPOTS.map((s) => (
            <button key={s.name} onClick={() => toast.success(s.name)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--lime)] text-background shadow-lg">
                <MapPin className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
        <div className="space-y-1 p-3">
          {SPOTS.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-xs">
              <span className="flex items-center gap-2"><MapPin className="h-3 w-3 text-[var(--lime)]" /> {s.name}</span>
              <span className="text-muted-foreground">{s.dist}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise library */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Baza ćwiczeń</h3>
      <div className="space-y-2.5">
        {STREET_EXERCISES.map((e) => (
          <div key={e.id} className="rounded-2xl glass p-3.5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-xl">{e.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="mt-0.5 flex items-start gap-1 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" /> {e.how}
                </p>
              </div>
              <button onClick={() => { setName(e.name); setOpen(true); }} className="rounded-full bg-white/5 px-3 py-1 text-[10px]">Loguj</button>
            </div>
          </div>
        ))}
      </div>

      {/* Logged */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Twoje logi</h3>
      {logs.length === 0 ? (
        <div className="rounded-2xl glass p-5 text-center text-xs text-muted-foreground">Brak wpisów</div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl glass p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-[var(--lime)]"><Dumbbell className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{l.name}</p>
                <p className="text-[11px] text-muted-foreground">{l.sets} × {l.reps}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{new Date(l.ts).toLocaleDateString("pl")}</p>
              <EntryActions onEdit={() => startEdit(l)} onDelete={() => remove(l.id)} />
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Street Workout</p>
                <h3 className="font-display text-2xl">Dodaj ćwiczenie</h3>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-4 block rounded-2xl bg-white/[0.04] p-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Nazwa</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pull-up" className="mt-1 w-full bg-transparent font-display text-lg outline-none placeholder:text-muted-foreground/40" />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block rounded-2xl bg-white/[0.04] p-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Serie</span>
                <input type="number" value={sets} onChange={(e) => setSets(e.target.value === "" ? "" : parseInt(e.target.value))} className="mt-1 w-full bg-transparent font-display text-xl outline-none" />
              </label>
              <label className="block rounded-2xl bg-white/[0.04] p-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Powt.</span>
                <input type="number" value={reps} onChange={(e) => setReps(e.target.value === "" ? "" : parseInt(e.target.value))} className="mt-1 w-full bg-transparent font-display text-xl outline-none" />
              </label>
            </div>
            <button onClick={save} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] via-[var(--orange)] to-[var(--magenta)] py-3.5 text-sm font-semibold text-background glow-primary">
              <Activity className="mr-1 inline h-4 w-4" /> Zapisz
            </button>
          </div>
        </div>
      )}
    </main>
  );
}