import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Agent = "trener" | "dietetyk";

const SYSTEM_PROMPTS: Record<Agent, string> = {
  trener:
    "Jesteś AI Trenerem GymWRLD. Odpowiadasz wyłącznie po polsku, krótko i konkretnie. Specjalizujesz się w treningu siłowym, calisthenics, mobilności, hipertrofii i progresji. Gdy ktoś pyta o dietę — przekieruj do AI Dietetyka. Używaj emoji oszczędnie 💪.",
  dietetyk:
    "Jesteś AI Dietetykiem GymWRLD. Odpowiadasz wyłącznie po polsku, krótko i konkretnie. Specjalizujesz się w makro, kaloryczności, planach posiłków, suplementacji. Gdy ktoś pyta o trening — przekieruj do AI Trenera. Używaj emoji oszczędnie 🥗.",
};

export const Route = createFileRoute("/api/coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          agent?: Agent;
          threadId?: string;
        };

        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supaUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const supaKey =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!supaUrl || !supaKey) return new Response("Misconfigured", { status: 500 });

        const supabase = createClient(supaUrl, supaKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return new Response("Unauthorized", { status: 401 });
        const userId = u.user.id;

        const agent: Agent = body.agent === "dietetyk" ? "dietetyk" : "trener";
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) return new Response("No messages", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Ensure thread exists & belongs to user (or create one)
        let threadId = body.threadId;
        if (!threadId) {
          const last = messages[messages.length - 1];
          const firstText =
            last?.parts
              ?.map((p) => (p.type === "text" ? p.text : ""))
              .join(" ")
              .slice(0, 60) ?? "Nowa rozmowa";
          const { data: t, error } = await supabase
            .from("ai_chat_threads")
            .insert({ user_id: userId, agent, title: firstText || "Nowa rozmowa" })
            .select("id")
            .single();
          if (error || !t) return new Response("Thread create failed", { status: 500 });
          threadId = t.id;
        } else {
          const { data: t } = await supabase
            .from("ai_chat_threads")
            .select("id,user_id,agent")
            .eq("id", threadId)
            .maybeSingle();
          if (!t || t.user_id !== userId) return new Response("Forbidden", { status: 403 });
        }

        // Persist the latest user message
        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const content =
            last.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
          if (content)
            await supabase
              .from("ai_chat_messages")
              .insert({ thread_id: threadId, user_id: userId, role: "user", content });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPTS[agent],
          messages: await convertToModelMessages(messages),
          onFinish: async ({ text }) => {
            if (text)
              await supabase
                .from("ai_chat_messages")
                .insert({ thread_id: threadId, user_id: userId, role: "assistant", content: text });
          },
        });

        return result.toUIMessageStreamResponse({
          headers: { "x-thread-id": threadId },
        });
      },
    },
  },
});