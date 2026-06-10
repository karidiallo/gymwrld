import { useState } from "react";
import { X, Star, Flame, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type TrainingLog, KIND_LABEL, KIND_COLOR, updateLog, removeLog } from "@/lib/training-log";

export function LogDetail({ log, onClose }: { log: TrainingLog; onClose: () => void }) {
  const [rating, setRating] = useState<number>(log.rating ?? 0);
  const [notes, setNotes] = useState<string>(log.notes ?? "");

  const save = () => {
    updateLog(log.id, { rating, notes });
    toast.success("Zapisano ocenę");
    onClose();
  };

  const remove = () => {
    if (!confirm(`Usunąć "${log.title}"?`)) return;
    removeLog(log.id);
    toast.success("Wpis usunięty");
    onClose();
  };

  const date = new Date(log.ts);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[var(--surface)] p-5 pb-28">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {KIND_LABEL[log.kind]} ·{" "}
              {date.toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <h3 className="mt-1 font-display text-2xl leading-tight">{log.title}</h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Czas" value={`${log.minutes} min`} color={KIND_COLOR[log.kind]} />
          <Stat icon={<Flame className="h-3.5 w-3.5" />} label="Kalorie" value={`${log.kcal} kcal`} color={KIND_COLOR[log.kind]} />
        </div>

        {log.meta && Object.keys(log.meta).length > 0 && (
          <div className="mt-3 rounded-2xl bg-white/[0.04] p-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Szczegóły</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(log.meta).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5">
                  <span className="text-muted-foreground capitalize">{labelFor(k)}</span>
                  <span className="font-medium tabular-nums">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-white/[0.04] p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Twoja ocena treningu</p>
          <div className="mt-2 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n === rating ? 0 : n)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 transition active:scale-90"
                aria-label={`Oceń na ${n}`}
              >
                <Star className={`h-5 w-5 ${n <= rating ? "fill-[var(--orange)] text-[var(--orange)]" : "text-white/30"}`} />
              </button>
            ))}
            <span className="ml-2 text-[11px] text-muted-foreground">
              {rating === 0 ? "brak" : ["", "słabo", "ok", "spoko", "świetnie", "ekstra"][rating]}
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notatka — jak się czułaś? co poprawić?"
            className="mt-3 w-full resize-none rounded-xl bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/50"
            rows={2}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={save} className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--magenta)] via-[var(--orange)] to-[var(--lime)] py-3 text-sm font-semibold text-background">
            <Pencil className="mr-1 inline h-4 w-4" /> Zapisz ocenę
          </button>
          <button onClick={remove} className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color }}>
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}

function labelFor(k: string) {
  const map: Record<string, string> = {
    route: "Trasa",
    incline: "Nachylenie",
    speed: "Prędkość",
    sets: "Serie",
    reps: "Powtórzenia",
    weight: "Ciężar",
    pace: "Tempo",
  };
  return map[k] ?? k;
}