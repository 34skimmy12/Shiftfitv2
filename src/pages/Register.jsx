import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); if (!email.trim()) return; setBusy(true); await base44.auth.register({ email: email.trim(), full_name: name.trim() }); setBusy(false); navigate("/onboarding"); };
  return <div className="min-h-screen bg-background px-5 py-10"><div className="mx-auto max-w-md"><div className="mb-10 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Zap className="h-5 w-5 fill-current"/></div><span className="text-xl font-extrabold tracking-tight">SHIFT FIT</span></div><div className="rounded-3xl border border-border bg-card p-6"><h1 className="text-2xl font-bold">Create your ShiftFit</h1><p className="mt-1 text-sm text-muted-foreground">Build a plan around the shifts you actually work.</p><form onSubmit={submit} className="mt-6 space-y-4"><div><label className="mb-2 block text-sm font-medium">Name</label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div><div><label className="mb-2 block text-sm font-medium">Email</label><Input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div><Button disabled={busy} className="w-full">{busy ? "Creating…" : "Continue"}</Button></form></div></div></div>;
}
