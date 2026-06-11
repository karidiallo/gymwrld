import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, BellOff, Check } from "lucide-react";
import { readNotifs, markAllRead, clearNotifs, type Notif } from "@/lib/notifications";
import { BrandFooter } from "@/components/BrandLoader";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Powiadomienia — GymWrld" }] }),
  component: NotificationsPage,
});

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "teraz";
  if (s < 3600) return `${Math.floor(s / 60)} min temu`;
  if (s < 86400) return `${Math.floor(s / 3600)} h temu`;
  return new Date(ts).toLocaleDateString("pl-PL");
}

const KIND_BG: Record<Notif["kind"], string> = {
  water: "from-[var(--violet)]/30 to-[var(--lime)]/20",
  achievement: "from-[var(--orange)]/40 to-[var(--magenta)]/20",
  motivation: "from-[var(--magenta)]/30 to-[var(--orange)]/20",
  workout: "from-[var(--lime)]/30 to-[var(--violet)]/20",
  system: "from-white/10 to-white/5",
};

function NotificationsPage() {
  const [list, setList] = useState<Notif[]>([]);
  useEffect(() => {
    const up = () => setList(readNotifs());
    up();
    markAllRead();
    window.addEventListener("gw_notifs_update", up);
    return () => window.removeEventListener("gw_notifs_update", up);
  }, []);

  return (
    <main className="px-5 pt-6 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Aktywność</p>
            <h1 className="mt-1 font-display text-3xl">Powiadomienia</h1>
          </div>
        </div>
        {list.length > 0 && (
          <button
            onClick={() => { clearNotifs(); setList([]); }}
            className="rounded-full glass px-3 py-1.5 text-[11px] font-semibold"
          >
            Wyczyść
          </button>
        )}
      </header>

      {list.length === 0 ? (
        <div className="mt-12 grid place-items-center text-center">
          <BellOff className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">Brak powiadomień.</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">Tu pojawią się gratulacje, przypomnienia o wodzie i motywatory.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {list.map((n) => (
            <li key={n.id} className={`rounded-2xl bg-gradient-to-br ${KIND_BG[n.kind]} p-4 ring-1 ring-white/10`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{n.emoji ?? "🔔"}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">{timeAgo(n.ts)}</p>
                </div>
                <Check className="h-3 w-3 text-muted-foreground/50" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <BrandFooter />
    </main>
  );
}