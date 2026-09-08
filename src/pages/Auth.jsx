import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(location.pathname === "/login" ? "login" : "signup");
  }, [location.pathname]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/onboarding", { replace: true });
    });
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Authentication is not configured yet. Please redeploy ShiftFit after adding the Supabase environment variables.");
      return;
    }
    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 6) return setError("Your password must be at least 6 characters.");
    if (mode === "signup" && password !== confirmPassword) return setError("Your passwords do not match.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate("/onboarding", { replace: true });
        } else {
          setMessage("Account created. Check your email to confirm your account, then come back and log in.");
          setMode("login");
          setConfirmPassword("");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        if (data.session) navigate("/onboarding", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    setError("");
    setMessage("");
    setMode(nextMode);
    navigate(nextMode === "login" ? "/login" : "/register", { replace: true });
  };

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">S</div>
          <span className="text-xl font-semibold tracking-tight">ShiftFit</span>
        </div>

        <div className="mb-7">
          <p className="text-sm font-medium text-primary">SHIFT SMART. TRAIN SMART.</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {mode === "signup" ? "Create your ShiftFit account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Your account keeps your personalised plans, progress and preferences together."
              : "Log in to pick up exactly where you left off."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-secondary p-1">
          {["signup", "login"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition", mode === value ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {value === "signup" ? "Create account" : "Log in"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter it again" />
            </div>
          )}

          {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {message && <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">{message}</div>}

          <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create my account" : "Log in to ShiftFit"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "New to ShiftFit? "}
          <button type="button" className="font-semibold text-foreground underline underline-offset-4" onClick={() => switchMode(mode === "signup" ? "login" : "signup")}>
            {mode === "signup" ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </main>
  );
}
