import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/hooks/useProfile";
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
  const scrollRef = useRef(null);

  useEffect(() => { base44.entities.ChatMessage.list("-created_date", 50).then((m) => setMessages(m.reverse())); }, []);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  if (loading) return <Splash />;
  if (!profile) { navigate("/onboarding"); return null; }

  const buildContext = () => `You are ShiftFit, an AI fitness & nutrition coach specialised in helping SHIFT WORKERS. User profile: ${JSON.stringify(profile)}`;
  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    const userMsg = await base44.entities.ChatMessage.create({ role: "user", content });
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const history = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `${buildContext()}\n\nConversation so far:\n${history}\n\nUser: ${content}\n\nCoach:` });
      const reply = typeof res === "string" ? res : res?.text || res?.response || JSON.stringify(res);
      const aiMsg = await base44.entities.ChatMessage.create({ role: "assistant", content: reply });
      setMessages((m) => [...m, aiMsg]);
    } catch {
      const aiMsg = await base44.entities.ChatMessage.create({ role: "assistant", content: "I had trouble responding just now — please try again." });
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
        {messages.length === 0 && <div className="rounded-2xl border border-border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">Hey {profile.full_name}! Ask me anything…</p></div>}
        {messages.map((m) => <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>{m.content}</div></div>)}
        {sending && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3"><span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"/><span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"/><span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"/></div></div>}
        <div ref={scrollRef} />
      </div>
      {messages.length === 0 && <div className="mb-4 flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="no-tap-highlight rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground active:bg-secondary">{s}</button>)}</div>}
      <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-5"><div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask your coach…" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"/><button onClick={() => send()} disabled={sending || !input.trim()} className="no-tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4"/></button></div></div>
    </AppLayout>
  );
}
function Splash() { return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>; }
