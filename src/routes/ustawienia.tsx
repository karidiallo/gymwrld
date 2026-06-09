import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, User, Mail, Crown, LogOut, Bell, Lock, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ustawienia")({
  head: () => ({ meta: [{ title: "Ustawienia — GymWrld" }] }),
  component: Ustawienia,
});

type Profile = { name?: string; nickname?: string; email?: string; subscription?: "free" | "pro" | "premium" };

function Ustawienia() {
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("gw_profile");
      if (raw) setP(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next: Profile) => {
    setP(next);
    if (typeof window !== "undefined") {
      const cur = JSON.parse(localStorage.getItem("gw_profile") ?? "{}");
      localStorage.setItem("gw_profile", JSON.stringify({ ...cur, ...next }));
      window.dispatchEvent(new Event("gw_profile_update"));
    }
  };

  const subLabel = p.subscription === "premium" ? "Premium" : p.subscription === "pro" ? "Pro" : "Free";
  const subColor = p.subscription === "premium" ? "from-[#dc2626] to-[#7a1a1a]" : p.subscription === "pro" ? "from-[var(--magenta)] to-[var(--orange)]" : "from-white/10 to-white/5";

  return (
    <main className="px-5 pt-6 pb-32">
      <header className="flex items-center gap-3">
        <Link to="/profil" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Konto</p>
          <h1 className="mt-0.5 font-display text-2xl">Ustawienia</h1>
        </div>
      </header>

      <section className="mt-6 space-y-3">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Profil</h3>
        <Field icon={<User className="h-4 w-4" />} label="Imię" value={p.name ?? ""} onChange={(v) => save({ ...p, name: v })} placeholder="Twoje imię" />
        <Field icon={<Sparkles className="h-4 w-4" />} label="Nick (@)" value={p.nickname ?? ""} onChange={(v) => save({ ...p, nickname: v.replace(/[^a-zA-Z0-9_]/g, "") })} placeholder="np. aleks" />
        <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={p.email ?? ""} onChange={(v) => save({ ...p, email: v })} placeholder="ty@email.com" />
      </section>

      <section className="mt-6">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Subskrypcja</h3>
        <div className={`rounded-3xl bg-gradient-to-br ${subColor} p-[1px]`}>
          <div className="rounded-3xl bg-card/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Crown className="h-4 w-4" /></div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Plan</p>
                  <p className="font-display text-xl">{subLabel}</p>
                </div>
              </div>
              <Link to="/premium" className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
                {p.subscription === "premium" ? "Zarządzaj" : "Upgrade"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Preferencje</h3>
        <div className="space-y-2">
          <Row icon={<Bell className="h-4 w-4" />} title="Powiadomienia" desc="Quest, treningi, motywacja" onClick={() => toast("Wkrótce")} />
          <Row icon={<Lock className="h-4 w-4" />} title="Prywatność" desc="Widoczność profilu, dane" onClick={() => toast("Wkrótce")} />
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Konto</h3>
        <div className="space-y-2">
          <button
            onClick={async () => {
              try { await supabase.auth.signOut(); } catch {}
              if (typeof window !== "undefined") {
                localStorage.removeItem("gw_onboarded");
                localStorage.removeItem("gw_session_persist");
              }
              toast.success("Wylogowano");
              navigate({ to: "/auth" });
            }}
            className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><LogOut className="h-4 w-4" /></div>
            <p className="text-sm font-medium">Wyloguj się</p>
          </button>
          <button
            onClick={() => {
              if (!confirm("Usunąć wszystkie dane lokalne?")) return;
              if (typeof window !== "undefined") {
                ["gw_onboarded","gw_session_persist","gw_profile","gw_avatar","gw_training_log","gw_mind","gw_journal","gw_treadmill","gw_runs","gw_street","gw_body","gw_prs","gw_weight_log","gw_cycle","gw_nutrition"].forEach((k) => localStorage.removeItem(k));
              }
              toast.success("Dane usunięte");
              navigate({ to: "/onboarding" });
            }}
            className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left text-red-300"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10"><Trash2 className="h-4 w-4" /></div>
            <p className="text-sm font-medium">Usuń konto i dane</p>
          </button>
        </div>
      </section>
    </main>
  );
}

function Field({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl glass p-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40"
        />
      </div>
    </label>
  );
}

function Row({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl glass p-3.5 text-left">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}