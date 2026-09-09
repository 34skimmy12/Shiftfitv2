import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ChevronRight } from "lucide-react";
import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/fitnessUtils";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const meta = { day: ["DAY SHIFT", "Work + training"], night: ["NIGHT SHIFT", "Work + recovery"], rest: ["REST DAY", "Recovery + mobility"] };
const DAY_MS = 24 * 60 * 60 * 1000;

function localDateString(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function dateDiffDays(startDate, date) {
  const start = new Date(`${startDate}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  return Math.floor((target - start) / DAY_MS);
}

function shiftForDate(profile, date) {
  const workDays = profile.work_days || [];
  const startDate = profile.shift_start_date;
  const shiftType = profile.shift_type;
  if (startDate && date < startDate) return "rest";

  if (shiftType === "2_days_2_nights") {
    const cycleDay = ((dateDiffDays(startDate, date) % 8) + 8) % 8;
    if (cycleDay < 2) return "day";
    if (cycleDay < 4) return "night";
    return "rest";
  }

  if (shiftType === "4_on_4_off") {
    const cycleDay = ((dateDiffDays(startDate, date) % 8) + 8) % 8;
    return cycleDay < 4 ? "day" : "rest";
  }

  const weekday = new Date(`${date}T00:00:00`).getDay();
  const day = WEEKDAYS[weekday];
  if (!workDays.includes(day)) return "rest";
  if (profile.shift_pattern === "fixed_night") return "night";
  return "day";
}

function startOfWeek(date) {
  const d = new Date(date);
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Calendar() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [plans, setPlans] = useState([]);
  useEffect(() => { if (profile) base44.entities.WorkoutPlan.list().then(setPlans); }, [profile]);
  if (loading) return <Splash />;
  if (!profile) return <AppLayout><Empty /></AppLayout>;

  const todayDate = localDateString(new Date());
  const weekStart = startOfWeek(new Date());

  return <AppLayout>
    <header className="mb-6"><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><CalendarDays className="h-5 w-5" /></div><h1 className="text-2xl font-bold">Your week</h1><p className="text-sm text-muted-foreground">Training and recovery around your shifts.</p></header>
    <div className="space-y-2">{Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = localDateString(date);
      const weekday = date.getDay();
      const shift = shiftForDate(profile, dateStr);
      const [label, sub] = meta[shift];
      const workout = plans.find(p => p.day_index === weekday);
      return <button key={dateStr} type="button" onClick={() => navigate(`/train?day=${weekday}`)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-secondary/40", dateStr === todayDate ? "border-primary/50 bg-primary/5" : "border-border bg-card")} aria-label={`Open training for ${WEEKDAY_LABELS[weekday]}`}>
        <div className="w-12 shrink-0 text-center"><div className="text-[10px] uppercase text-muted-foreground">{WEEKDAY_LABELS[weekday].slice(0,3)}</div><div className="text-lg font-bold">{date.getDate()}</div></div><div className="h-10 w-px bg-border"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-sm font-bold">{label}</span>{dateStr === todayDate && <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground">TODAY</span>}</div><p className="text-xs text-muted-foreground">{sub}{workout ? ` · ${workout.title}` : ""}</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>;
    })}</div>
  </AppLayout>;
}
function Empty(){return <div className="py-24 text-center text-muted-foreground">Complete onboarding to build your calendar.</div>}
function Splash(){return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary"/></div>}
