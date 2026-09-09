import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/hooks/useProfile";
import { getCoachContext, formatCoachContext } from "@/lib/coachContext";
import AppLayout from "@/components/AppLayout";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How should I eat on a night shift?",
  "Best workout after a 12-hour shift?",
  "How do I protect my sleep on rotating shifts?",
  "Quick high-protein snack ideas",
];

export default function Coach() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [coachContext, setCoachContext] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.entities.ChatMessage.list("-created_date", 50).then((m) => setMessages(m.reverse()));
  }, []);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setContextLoading(true);
    getCoachContext(profile)
      .then((context) => { if (!cancelled) setCoachContext(formatCoachContext(context)); })
      .catch(() => { if (!cancelled) setCoachContext(""); })
      .finally(() => { if (!cancelled) setContextLoading(false); });
    return () => { cancelled = true; };
  }, [profile]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  if (loading) return <Splash />;
  if (!profile) { navigate("/onboarding"); return null; }

  const buildContext = () => `You are ShiftFit, an AI fitness & nutrition coach specialised in helping SHIFT WORKERS (day shifts, night shifts, rotating schedules and rest days). Be practical, concise, motivating and specific. Tailor meal timing, caffeine, training and recovery to the user's real shift schedule. Use only the ShiftFit data provided below; never invent missing data.

${coachContext || `USER PROFILE\n${JSON.stringify(profile)}`}`;

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    const userMsg = await base44.entities.ChatMessage.create({ role: "user", content });
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const history = [...messages, userMsg]
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }))
        .filter((m) => m.role === "user" || m.role === "assistant");

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: buildContext(),
          history,
          message: content,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Coach request failed");

      const reply = typeof data.reply === "string" ? data.reply : "I couldn't generate a response just now.";
      const aiMsg = await base44.entities.ChatMessage.create({ role: "assistant", content: reply });
      setMessages((m) => [...m, aiMsg]);
    } catch (error) {
      console.error("Coach request failed", error);
      const detail = error?.message || "Unknown error";
      const aiMsg = await base44.entities.ChatMessage.create({ role: "assistant", content: `AI Coach connection error: ${detail}` });
      setMessages((m) => [...m, aiMsg]);
    } finally { setSending(false); }
  };

  return (
    <AppLayout>
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">AI Coach</h1><p className="text-xs text-muted-foreground">Tuned to your shifts & goals</p></div>
        </div>
      </header>
      <div className="mb-4 space-y-3">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Hey {profile.full_name}! Ask me anything about training, nutrition or recovery around your shifts.</p>
            {contextLoading && <p className="mt-2 text-[10px] text-muted-foreground">Loading your ShiftFit plan…</p>}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>
              {m.role === "assistant" ? <CoachMessage content={m.content} /> : <span className="whitespace-pre-wrap">{m.content}</span>}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="no-tap-highlight rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors active:bg-secondary">{s}</button>)}
        </div>
      )}
      <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask your coach…" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button onClick={() => send()} disabled={sending || !input.trim()} className="no-tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function CoachMessage({ content }) {
  const lines = String(content ?? "").split(/\r?\n/);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;

        if (/^#{1,3}\s+/.test(trimmed)) {
          return <p key={index} className="pt-1 font-semibold">{renderInlineMarkdown(trimmed.replace(/^#{1,3}\s+/, ""))}</p>;
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return <div key={index} className="flex gap-2 pl-1"><span aria-hidden="true">•</span><span>{renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}</span></div>;
        }

        return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function Splash() {
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>;
}
