import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ChevronRight } from "lucide-react";
import { WEEKDAYS, WEEKDAY_LABELS, shiftForWeekday } from "@/lib/fitnessUtils";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const meta = { day: ["DAY SHIFT", "Work + training"], night: ["NIGHT SHIFT", "Work + recovery"], rest: ["REST DAY", "Recovery + mobility"] };
export default function Calendar() {
  const { profile, loading } = useProfile();
  const [plans, setPlans] = useState([]);
  useEffect(() => { if (profile) base44.entities.WorkoutPlan.list().then(setPlans); }, [profile]);
  if (loading) return <Splash />;
  if (!profile) return <AppLayout><Empty /></AppLayout>;
  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return <AppLayout>
    <header className="mb-6"><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><CalendarDays className="h-5 w-5" /></div><h1 className="text-2xl font-bold">Your week</h1><p className="text-sm text-muted-foreground">Training and recovery around your shifts.</p></header>
    <div className="space-y-2">{WEEKDAYS.map((d, i) => { const shift = shiftForWeekday(profile, i); const [label, sub] = meta[shift]; const workout = plans.find(p => p.day_index === i); return <div key={d} className={cn("rounded-2xl border p-4", i === today ? "border-primary/50 bg-primary/5" : "border-border bg-card")}><div className="flex items-center gap-3"><div className="w-10 text-center"><div className="text-[10px] uppercase text-muted-foreground">{WEEKDAY_LABELS[i].slice(0,3)}</div><div className="text-lg font-bold">{i + 1}</div></div><div className="h-10 w-px bg-border"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-sm font-bold">{label}</span>{i === today && <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground">TODAY</span>}</div><p className="text-xs text-muted-foreground">{sub}{workout ? ` · ${workout.title}` : ""}</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></div></div>; })}</div>
  </AppLayout>;
}
function Empty(){return <div className="py-24 text-center text-muted-foreground">Complete onboarding to build your calendar.</div>}
function Splash(){return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary"/></div>}
