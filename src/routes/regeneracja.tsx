import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Ring } from "@/components/Ring";
import { Moon, Brain, Wind, Heart, Plus, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/regeneracja")({
  head: () => ({ meta: [{ title: "Regeneracja — GymWrld" }, { name: "description", content: "Sen, medytacja i mind health." }] }),
  component: Regeneracja,
});

type SleepEntry = { date: string; hours: number; quality: number };
type MindEntry = { id: string; type: "medytacja" | "oddech" | "journal"; minutes: number; note?: string };

function Regeneracja() {
  const [sleep, setSleep] = useState<SleepEntry[]>([
    { date: "Dziś", hours: 7.4, quality: 82 },
    { date: "Wczoraj", hours: 6.8, quality: 70 },
    { date: "2 dni temu", hours: 8.1, quality: 90 },
  ]);
  const [mind, setMind] = useState<MindEntry[]>([
    { id: "1", type: "medytacja", minutes: 10, note: "Poranek, focus" },
  ]);
  const [openSleep, setOpenSleep] = useState(false);
  const [openMind, setOpenMind] = useState(false);

  const todaySleep = sleep[0];
  const sleepGoal = 8;

  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój reset</p>
          <h1 className="mt-1 font-display text-3xl">Regeneracja</h1>
        </div>
      </header>

      {/* Hero card */}
      <section className="relative mt-5 overflow-hidden rounded-3xl glass p-5">
        <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[var(--violet)]/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[var(--magenta)]/20 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <Ring value={todaySleep.hours} max={sleepGoal} size={132} stroke={12} color="var(--violet)">
            <span className="text-2xl font-semibold">{todaySleep.hours}h</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">snu</span>
          </Ring>
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Jakość</span><span className="font-medium">{todaySleep.quality}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cel</span><span className="font-medium">{sleepGoal}h</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Średnia tyg.</span><span className="font-medium">7.4h</span></div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => setOpenSleep(true)} className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[var(--violet)]/30 to-[var(--magenta)]/15 p-4 ring-1 ring-white/10 text-left">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Moon className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-semibold">Zaloguj sen</p>
            <p className="text-[11px] text-muted-foreground">Godziny + jakość</p>
          </div>
        </button>
        <button onClick={() => setOpenMind(true)} className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[var(--lime)]/25 to-[var(--violet)]/15 p-4 ring-1 ring-white/10 text-left">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Brain className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-semibold">Mind session</p>
            <p className="text-[11px] text-muted-foreground">Medytacja, oddech</p>
          </div>
        </button>
      </div>

      {/* Sleep history */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Historia snu</h3>
      <div className="space-y-2.5">
        {sleep.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl glass p-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--violet)]/15 text-[var(--violet)]"><Moon className="h-4 w-4" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium">{s.date}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--magenta)]" style={{ width: `${(s.hours / sleepGoal) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{s.hours}h</p>
              <p className="text-[10px] text-muted-foreground">jakość {s.quality}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mind sessions */}
      <h3 className="mb-3 mt-7 text-lg font-semibold">Mind health</h3>
      <div className="grid grid-cols-3 gap-2">
        <SessionPill icon={<Brain className="h-4 w-4" />} label="Medytacja" min={10} onClick={() => addQuick(setMind, "medytacja", 10)} />
        <SessionPill icon={<Wind className="h-4 w-4" />} label="Oddech 4-7-8" min={5} onClick={() => addQuick(setMind, "oddech", 5)} />
        <SessionPill icon={<Sparkles className="h-4 w-4" />} label="Journal" min={5} onClick={() => addQuick(setMind, "journal", 5)} />
      </div>

      <div className="mt-4 space-y-2.5">
        {mind.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl glass p-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--lime)]/15 text-[var(--lime)]">
              {m.type === "medytacja" ? <Brain className="h-4 w-4" /> : m.type === "oddech" ? <Wind className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{m.type}</p>
              <p className="text-[11px] text-muted-foreground">{m.note ?? "Sesja"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{m.minutes} min</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-7 text-lg font-semibold">Nastrój</h3>
      <div className="flex justify-between rounded-2xl glass p-4">
        {["😞","😕","😐","🙂","😄"].map((e, i) => (
          <button
            key={i}
            onClick={() => toast.success(`Nastrój zapisany ${e}`)}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl transition hover:scale-110 hover:bg-white/10"
          >
            {e}
          </button>
        ))}
      </div>
      <div className="h-24" />

      {openSleep && <SleepSheet onClose={() => setOpenSleep(false)} onSave={(h, q) => {
        setSleep((prev) => [{ date: "Dziś", hours: h, quality: q }, ...prev.slice(1)]);
        toast.success(`Zapisano sen: ${h}h · jakość ${q}%`);
        setOpenSleep(false);
      }} />}
      {openMind && <MindSheet onClose={() => setOpenMind(false)} onSave={(t, m, note) => {
        setMind((prev) => [{ id: String(Date.now()), type: t, minutes: m, note }, ...prev]);
        toast.success(`Sesja zapisana · +30 XP`);
        setOpenMind(false);
      }} />}
    </main>
  );
}

function addQuick(setMind: React.Dispatch<React.SetStateAction<MindEntry[]>>, type: MindEntry["type"], min: number) {
  setMind((prev) => [{ id: String(Date.now()), type, minutes: min, note: "Szybka sesja" }, ...prev]);
  toast.success(`+${min} min ${type} · +20 XP`);
}

function SessionPill({ icon, label, min, onClick }: { icon: React.ReactNode; label: string; min: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 rounded-2xl glass p-3 text-center">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5">{icon}</div>
      <p className="text-[11px] font-medium">{label}</p>
      <p className="text-[10px] text-muted-foreground">{min} min</p>
    </button>
  );
}

function SleepSheet({ onClose, onSave }: { onClose: () => void; onSave: (h: number, q: number) => void }) {
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState(80);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Zaloguj sen</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 text-center">
          <p className="font-display text-6xl text-gradient">{hours.toFixed(1)}h</p>
          <input type="range" min={3} max={12} step={0.1} value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} className="mt-4 w-full accent-[var(--violet)]" />
        </div>
        <div className="mt-6">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Jakość snu · {quality}%</p>
          <input type="range" min={0} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-full accent-[var(--magenta)]" />
        </div>
        <button onClick={() => onSave(Math.round(hours * 10) / 10, quality)} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[var(--violet)] via-[var(--magenta)] to-[var(--orange)] py-3.5 text-sm font-semibold text-background glow-primary">
          Zapisz sen
        </button>
      </div>
    </div>
  );
}

function MindSheet({ onClose, onSave }: { onClose: () => void; onSave: (t: MindEntry["type"], m: number, note?: string) => void }) {
  const [type, setType] = useState<MindEntry["type"]>("medytacja");
  const [minutes, setMinutes] = useState(10);
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Mind session</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["medytacja","oddech","journal"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={`rounded-2xl p-3 text-xs font-medium capitalize ${type === t ? "bg-gradient-to-r from-[var(--magenta)] to-[var(--orange)] text-white" : "bg-white/5 text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Czas · {minutes} min</p>
          <input type="range" min={1} max={60} value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value))} className="w-full accent-[var(--lime)]" />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notatka (opcjonalnie)" className="mt-4 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
        <button onClick={() => onSave(type, minutes, note || undefined)} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[var(--lime)] via-[var(--magenta)] to-[var(--violet)] py-3.5 text-sm font-semibold text-background glow-primary">
          <Plus className="inline h-4 w-4" /> Dodaj sesję
        </button>
      </div>
    </div>
  );
}