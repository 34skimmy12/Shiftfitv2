import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/AppLayout";
import ShiftBadge from "@/components/ShiftBadge";
import { weekdayOf, shiftForWeekday, WEEKDAY_LABELS, todayStr } from "@/lib/fitnessUtils";
import { Check, ChevronDown, Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const INTENSITY_LABEL = { low: "Low", moderate: "Moderate", high: "High" };

export default function Workouts() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const today = todayStr();
  const wdIdx = weekdayOf(today);

  useEffect(() => {
    if (!profile) return;
    base44.entities.WorkoutPlan.list().then((p) => {
      const sorted = [...p].sort((a, b) => a.day_index - b.day_index);
      setPlans(sorted);
      setOpenIdx(wdIdx);
    });
    base44.entities.WorkoutLog.filter({ date: today }).then(setLogs);
  }, [profile, today, wdIdx]);

  if (loading) return <Splash />;
  if (!profile) { navigate("/onboarding"); return null; }

  const todaysShift = shiftForWeekday(profile, wdIdx);
  const toggleExercise = async (plan, exName) => {
    const log = logs.find((l) => l.workout_plan_id === plan.id);
    if (!log) return;
    const done = log.completed_exercises || [];
    const next = done.includes(exName) ? done.filter((x) => x !== exName) : [...done, exName];
    const updated = await base44.entities.WorkoutLog.update(log.id, { completed_exercises: next, completed: next.length >= plan.exercises.length });
    setLogs((ls) => ls.map((l) => (l.id === log.id ? updated : l)));
  };
  const startWorkout = async (plan) => {
    const existing = logs.find((l) => l.workout_plan_id === plan.id);
    if (!existing) {
      const created = await base44.entities.WorkoutLog.create({ date: today, workout_plan_id: plan.id, completed: false, completed_exercises: [] });
      setLogs((ls) => [...ls, created]);
      setOpenIdx(plan.day_index);
    }
  };

  return (
    <AppLayout>
      <header className="mb-6"><h1 className="text-2xl font-bold tracking-tight">Training</h1><p className="text-sm text-muted-foreground">Your 7-day plan, adapted to your shifts</p></header>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-3"><Dumbbell className="h-4 w-4 text-primary" /><span className="text-sm">Today is <b>{WEEKDAY_LABELS[wdIdx]}</b></span><ShiftBadge shift={todaysShift} className="ml-auto" /></div>
      <div className="space-y-3">{plans.map((plan) => {
        const isOpen = openIdx === plan.day_index;
        const log = logs.find((l) => l.workout_plan_id === plan.id);
        const done = log?.completed_exercises || [];
        const isToday = plan.day_index === wdIdx;
        return <div key={plan.id} className={cn("overflow-hidden rounded-2xl border bg-card transition-colors", isToday ? "border-primary" : "border-border")}>
          <button onClick={() => setOpenIdx(isOpen ? null : plan.day_index)} className="no-tap-highlight flex w-full items-center gap-3 p-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-bold">{WEEKDAY_LABELS[plan.day_index][0]}</div>
            <div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{plan.title}</span>{isToday && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">TODAY</span>}</div><div className="text-xs text-muted-foreground">{plan.focus} · {plan.duration_min} min · {INTENSITY_LABEL[plan.intensity]}</div></div>
            <ShiftBadge shift={plan.shift_context} /><ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
          </button>
          {isOpen && <div className="border-t border-border px-4 pb-4 pt-3"><div className="space-y-2">{plan.exercises.map((ex) => { const checked = done.includes(ex.name); return <div key={ex.name} className="flex items-center gap-3"><button onClick={() => log && toggleExercise(plan, ex.name)} disabled={!log} className={cn("no-tap-highlight flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors", checked ? "border-primary bg-primary text-primary-foreground" : "border-border", !log && "opacity-40")}>{checked && <Check className="h-3.5 w-3.5" />}</button><div className="flex-1"><div className={cn("text-sm font-medium", checked && "text-muted-foreground line-through")}>{ex.name}</div><div className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps} · {ex.rest_sec}s rest</div></div></div>; })}</div><div className="mt-4 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{done.length}/{plan.exercises.length} done</span>{!log ? <button onClick={() => startWorkout(plan)} className="no-tap-highlight ml-auto rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Start</button> : log.completed ? <span className="ml-auto rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">Complete ✓</span> : <span className="ml-auto rounded-xl bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">In progress</span>}</div></div>}
        </div>;
      })}</div>
    </AppLayout>
  );
}
function Splash() { return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>; }
