import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ChevronLeft, Dumbbell, Salad, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — GymWRLD" },
      { name: "description", content: "AI Trener i AI Dietetyk — Twoje osobiste wsparcie 24/7." },
    ],
  }),
  component: CoachPage,
});

type Agent = "trener" | "dietetyk";
type Thread = { id: string; agent: Agent; title: string; updated_at: string };

function rowsToUIMessages(rows: Array<{ id: string; role: string; content: string }>): UIMessage[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      parts: [{ type: "text", text: r.content }],
    }));
}

function CoachPage() {
  const [agent, setAgent] = useState<Agent>("trener");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initial, setInitial] = useState<UIMessage[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [premium, setPremium] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth + premium gate
  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      setToken(s.session?.access_token ?? null);
      if (!s.session) { setPremium(false); return; }
      const { data: p } = await supabase
        .from("profiles").select("subscription").eq("id", s.session.user.id).maybeSingle();
      const sub = (p?.subscription || "free").toLowerCase();
      setPremium(sub !== "free");
    })();
  }, []);

  // Load threads (last 30 days)
  const reloadThreads = async () => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data } = await supabase
      .from("ai_chat_threads").select("id,agent,title,updated_at")
      .gte("updated_at", since).order("updated_at", { ascending: false });
    setThreads((data as Thread[]) ?? []);
  };
  useEffect(() => { reloadThreads(); }, []);

  // Load messages for active thread
  useEffect(() => {
    (async () => {
      if (!activeId) { setInitial([]); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from("ai_chat_messages").select("id,role,content")
        .eq("thread_id", activeId).order("created_at", { ascending: true });
      setInitial(rowsToUIMessages(data ?? []));
      setLoading(false);
    })();
  }, [activeId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/coach",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { agent, threadId: activeId },
      }),
    [token, agent, activeId],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: activeId ?? `new-${agent}`,
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "Błąd AI"),
    onFinish: async () => {
      // After first reply, pick up newly created thread + refresh list
      if (!activeId) {
        const { data } = await supabase
          .from("ai_chat_threads").select("id,agent,title,updated_at")
          .eq("agent", agent).order("updated_at", { ascending: false }).limit(1);
        if (data?.[0]) setActiveId(data[0].id);
      }
      reloadThreads();
    },
  });

  useEffect(() => { setMessages(initial); }, [initial, setMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId, agent]);

  const isLoading = status === "submitted" || status === "streaming";

  const send = async () => {
    const t = input.trim();
    if (!t || isLoading) return;
    setInput("");
    await sendMessage({ text: t });
  };

  const newThread = () => { setActiveId(null); setInitial([]); setMessages([]); };

  const deleteThread = async (id: string) => {
    await supabase.from("ai_chat_threads").delete().eq("id", id);
    if (activeId === id) newThread();
    reloadThreads();
  };

  if (premium === null) {
    return <main className="min-h-screen grid place-items-center"><Sparkles className="h-6 w-6 animate-pulse" /></main>;
  }

  if (!premium) {
    return (
      <main className="min-h-screen px-5 pt-8 pb-32">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Wróć</Link>
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-[var(--magenta)]/40 via-[var(--orange)]/30 to-[var(--lime)]/30 p-6 ring-1 ring-white/10 text-center">
          <Sparkles className="mx-auto h-10 w-10" />
          <h1 className="mt-3 font-display text-2xl">AI Coach to funkcja Premium</h1>
          <p className="mt-2 text-sm text-foreground/80">
            Odblokuj AI Trenera i AI Dietetyka 24/7. Historia rozmów przechowywana przez 30 dni.
          </p>
          <Link to="/premium" className="mt-5 inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background">
            Odblokuj Premium
          </Link>
        </section>
      </main>
    );
  }

  const filteredThreads = threads.filter((t) => t.agent === agent);

  return (
    <main className="min-h-screen px-4 pt-5 pb-32">
      <header className="flex items-center justify-between">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full glass"><ChevronLeft className="h-4 w-4" /></Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">AI Coach</span>
        <button onClick={newThread} className="grid h-9 w-9 place-items-center rounded-full glass" aria-label="Nowa rozmowa"><Plus className="h-4 w-4" /></button>
      </header>

      {/* Agent switcher */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {([
          { id: "trener" as const, label: "AI Trener", Icon: Dumbbell, tint: "from-[var(--magenta)] to-[var(--orange)]" },
          { id: "dietetyk" as const, label: "AI Dietetyk", Icon: Salad, tint: "from-[var(--lime)] to-[var(--violet)]" },
        ]).map(({ id, label, Icon, tint }) => (
          <button
            key={id}
            onClick={() => { setAgent(id); newThread(); }}
            className={`relative overflow-hidden rounded-2xl p-3 text-left ring-1 ${agent === id ? "ring-white/40" : "ring-white/10 opacity-70"}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tint} ${agent === id ? "opacity-100" : "opacity-40"}`} />
            <div className="relative flex items-center gap-2 text-background">
              <Icon className="h-4 w-4" />
              <span className="font-display text-sm">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Thread list */}
      {filteredThreads.length > 0 && (
        <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {filteredThreads.map((t) => (
            <div key={t.id} className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ring-1 ${activeId === t.id ? "bg-foreground text-background ring-foreground" : "bg-background/50 ring-white/10"}`}>
              <button onClick={() => setActiveId(t.id)} className="max-w-[160px] truncate">{t.title}</button>
              <button onClick={() => deleteThread(t.id)} aria-label="Usuń"><Trash2 className="h-3 w-3 opacity-60" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <section className="mt-4 space-y-3">
        {loading && <p className="text-center text-xs text-muted-foreground">Ładowanie…</p>}
        {!loading && messages.length === 0 && (
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="font-display text-lg">Cześć! 👋</p>
            <p className="mt-1 text-sm text-foreground/80">
              {agent === "trener"
                ? "Jestem Twoim AI Trenerem. Spytaj o plan, technikę, progresję — co tylko chcesz."
                : "Jestem Twoim AI Dietetykiem. Pomogę z makro, posiłkami, suplementacją."}
            </p>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ring-1 ${isUser ? "bg-foreground text-background ring-foreground" : "bg-white/5 ring-white/10"}`}>
                {text}
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "120ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "240ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {/* Composer */}
      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-[480px] px-4">
        <div className="flex items-end gap-2 rounded-2xl bg-background/95 p-2 ring-1 ring-white/10 backdrop-blur">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={agent === "trener" ? "Spytaj o trening…" : "Spytaj o dietę…"}
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background disabled:opacity-40"
            aria-label="Wyślij"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}