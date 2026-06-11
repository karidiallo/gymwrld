import { useEffect, useState } from "react";
import { Copy, Share2, Gift, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("referral_code").eq("id", u.user.id).maybeSingle();
      if (data?.referral_code) setCode(data.referral_code);
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", u.user.id);
      setInvited(count ?? 0);
    })();
  }, []);

  if (!code) return null;
  const link = `https://gymwrld.com/?ref=${code}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link skopiowany ✨");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Nie udało się skopiować"); }
  };
  const share = async () => {
    const text = `Trenuj ze mną na GymWRLD 💪 Zgarnij bonus startowy → ${link}`;
    try {
      if (navigator.share) await navigator.share({ title: "GymWRLD", text, url: link });
      else copy();
    } catch {}
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--magenta)]/40 via-[var(--orange)]/30 to-[var(--lime)]/30 p-5 ring-1 ring-white/10">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/40 backdrop-blur">
          <Gift className="h-6 w-6 text-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">Zaproś znajomych</p>
          <p className="text-[12px] text-foreground/80">+500 XP za każdą osobę która zacznie trenować</p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 ring-1 ring-white/10">
        <span className="font-display text-lg tracking-widest">{code}</span>
        <span className="ml-auto text-[11px] text-foreground/70">Zaproszonych: {invited}</span>
      </div>
      <div className="relative mt-3 grid grid-cols-2 gap-2">
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl bg-background/70 px-4 py-3 text-sm font-semibold ring-1 ring-white/10 backdrop-blur hover:bg-background/90">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Kopiuj link
        </button>
        <button onClick={share} className="flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90">
          <Share2 className="h-4 w-4" /> Udostępnij
        </button>
      </div>
    </section>
  );
}