import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import { readLogs, KIND_LABEL, KIND_COLOR, type TrainingLog } from "@/lib/training-log";
import { LogDetail } from "@/components/LogDetail";
import { BrandFooter } from "@/components/BrandLoader";

export const Route = createFileRoute("/historia")({
  head: () => ({ meta: [{ title: "Historia treningów — GymWrld" }] }),
  component: Historia,
});

function Historia() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [open, setOpen] = useState<TrainingLog | null>(null);

  useEffect(() => {
    const load = () => setLogs(readLogs());
    load();
    window.addEventListener("gw_training_log_update", load);
    return () => window.removeEventListener("gw_training_log_update", load);
  }, []);

  const groups = useMemo(() => {
    const g = new Map<string, TrainingLog[]>();
    for (const l of logs) {
      const d = new Date(l.ts);
      const key = d.toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(l);
    }
    return [...g.entries()];
  }, [logs]);

  return (
    <main className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dziennik</p>
          <h1 className="mt-1 font-display text-3xl">Historia</h1>
        </div>
      </header>

      <div className="mt-5 rounded-2xl glass p-4 text-xs text-muted-foreground">
        <NotebookPen className="mr-1 inline h-3.5 w-3.5" /> {logs.length} sesji · {logs.reduce((s,l)=>s+(l.minutes||0),0)} min · {logs.reduce((s,l)=>s+(l.kcal||0),0)} kcal
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Brak wpisów. Zacznij od pierwszego treningu.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map(([day, items]) => (
            <section key={day}>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{day}</p>
              <div className="space-y-2">
                {items.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setOpen(l)}
                    className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left transition active:scale-[0.99]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${KIND_COLOR[l.kind]}20`, color: KIND_COLOR[l.kind] }}>●</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{l.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {KIND_LABEL[l.kind]} · {l.minutes} min · {l.kcal} kcal
                        {l.rating ? ` · ${"★".repeat(l.rating)}` : ""}
                      </p>
                      {l.notes && <p className="mt-1 line-clamp-1 text-[11px] italic text-muted-foreground/80">„{l.notes}"</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(l.ts).toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BrandFooter />
      {open && <LogDetail log={open} onClose={() => setOpen(null)} />}
    </main>
  );
}