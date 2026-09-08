import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Moon, Sun, Coffee, Dumbbell, Home, Clock3, CalendarDays } from "lucide-react";
import { computeTargets, generateWorkoutPlans, generateMealPlans, generateShoppingList } from "@/lib/fitnessUtils";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose", label: "Lose fat", desc: "Calorie deficit + high protein" },
  { value: "gain", label: "Build muscle", desc: "Small surplus + progressive training" },
  { value: "strength", label: "Get stronger", desc: "Performance-focused training" },
  { value: "maintain", label: "Maintain", desc: "Stay strong and consistent" },
];
const ACTIVITY = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly active" },
  { value: "moderate", label: "Moderately active" },
  { value: "active", label: "Very active" },
];
const SHIFTS = [
  { value: "2_days_2_nights", label: "2 Days / 2 Nights", desc: "Day shifts followed by night shifts", icon: Sun, pattern: "rotating" },
  { value: "4_on_4_off", label: "4 On / 4 Off", desc: "Four work days, then four days off", icon: Clock3, pattern: "rotating" },
  { value: "monday_friday", label: "Monday – Friday", desc: "Regular weekday schedule", icon: Sun, pattern: "fixed_day" },
  { value: "custom", label: "Other / Custom", desc: "Build your own shift pattern", icon: Coffee, pattern: "rotating" },
];
const TRAINING_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to structured training" },
  { value: "intermediate", label: "Intermediate", desc: "Training consistently" },
  { value: "advanced", label: "Advanced", desc: "Experienced and performance focused" },
];
const TRAINING_LOCATIONS = [
  { value: "gym", label: "Gym", icon: Dumbbell },
  { value: "home", label: "Home", icon: Home },
];
const TRAINING_TIMES = ["Morning", "Afternoon", "Evening", "After shift"];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", age: "", sex: "male", height_cm: "", weight_kg: "",
    goal: "lose", activity_level: "moderate",
    shift_type: "monday_friday", shift_pattern: "fixed_day", work_days: ["mon", "tue", "wed", "thu", "fri"], custom_shift: "",
    shift_start_date: getLocalDateString(),
    training_level: "beginner", training_days_per_week: 3, training_time: "Evening", training_location: "gym",
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const selectedShift = SHIFTS.find((s) => s.value === form.shift_type) || SHIFTS[2];
  const toggleDay = (day) => set("work_days", form.work_days.includes(day) ? form.work_days.filter((d) => d !== day) : [...form.work_days, day]);

  const steps = ["About you", "Goal", "Shifts", "Training", "Your plan"];
  const canNext = () => {
    if (step === 0) return Boolean(form.full_name && form.age && form.height_cm && form.weight_kg);
    if (step === 2) return Boolean(form.shift_start_date && form.work_days.length > 0 && (form.shift_type !== "custom" || form.custom_shift.trim()));
    return true;
  };

  const finish = async () => {
    setSaving(true);
    try {
      const baseProfile = {
        ...form,
        age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg),
        training_days_per_week: Number(form.training_days_per_week),
        shift_pattern: selectedShift.pattern,
        onboarding_complete: true,
      };
      const goalForEngine = form.goal === "strength" ? "maintain" : form.goal;
      const profileData = {
        ...baseProfile,
        goal: goalForEngine,
        ...computeTargets({ ...baseProfile, goal: goalForEngine }),
      };
      await base44.entities.UserProfile.create(profileData);
      const workouts = generateWorkoutPlans(profileData);
      await base44.entities.WorkoutPlan.bulkCreate(workouts);
      const meals = generateMealPlans(profileData, profileData);
      await base44.entities.MealPlan.bulkCreate(meals);
      await base44.entities.ShoppingListItem.bulkCreate(generateShoppingList(meals));
      const today = getLocalDateString();
      await base44.entities.WaterLog.create({ date: today, amount_ml: 0 });
      await base44.entities.StepLog.create({ date: today, steps: 0 });
      await base44.entities.BodyMetric.create({ date: today, weight_kg: Number(form.weight_kg) });
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 pb-10 pt-8">
      <div className="mx-auto max-w-md">
        <header className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold">S</div>
            <div><div className="text-lg font-bold tracking-tight">SHIFT FIT</div><div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Shift smart. Train smart.</div></div>
          </div>
          <div className="mt-7 flex items-center gap-1.5">
            {steps.map((label, index) => <div key={label} className="flex flex-1 flex-col gap-1.5"><div className={cn("h-1.5 rounded-full transition-colors", index <= step ? "bg-primary" : "bg-secondary")} /><span className={cn("text-[9px] font-medium", index === step ? "text-foreground" : "text-muted-foreground")}>{label}</span></div>)}
          </div>
        </header>

        {step === 0 && <Section title="About you" subtitle="Tell us a little about yourself so ShiftFit can build your starting plan.">
          <Field label="What should we call you?" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="Your name" />
          <Field label="Age" value={form.age} onChange={(v) => set("age", v)} type="number" placeholder="Your age" />
          <ChoiceLabel label="Sex" />
          <div className="grid grid-cols-3 gap-2">{["male", "female", "other"].map((value) => <Choice key={value} active={form.sex === value} onClick={() => set("sex", value)}>{value[0].toUpperCase() + value.slice(1)}</Choice>)}</div>
          <div className="grid grid-cols-2 gap-3"><Field label="Height (cm)" value={form.height_cm} onChange={(v) => set("height_cm", v)} type="number" placeholder="e.g. 173" /><Field label="Weight (kg)" value={form.weight_kg} onChange={(v) => set("weight_kg", v)} type="number" placeholder="e.g. 84" /></div>
        </Section>}

        {step === 1 && <Section title="What's your goal?" subtitle="Your nutrition targets and training direction will adapt around this.">
          <div className="space-y-2">{GOALS.map((goal) => <button type="button" key={goal.value} onClick={() => set("goal", goal.value)} className={cn("w-full rounded-2xl border p-4 text-left transition-all", form.goal === goal.value ? "border-primary bg-primary/10" : "border-border bg-card")}><div className="font-semibold">{goal.label}</div><div className="mt-1 text-xs text-muted-foreground">{goal.desc}</div></button>)}</div>
          <div><ChoiceLabel label="Current activity level" /><div className="grid grid-cols-2 gap-2">{ACTIVITY.map((item) => <Choice key={item.value} active={form.activity_level === item.value} onClick={() => set("activity_level", item.value)}>{item.label}</Choice>)}</div></div>
        </Section>}

        {step === 2 && <Section title="How do you work?" subtitle="This is the important ShiftFit bit — we'll use your shift pattern and start date to build your calendar around work, recovery and training.">
          <div className="space-y-2">{SHIFTS.map((shift) => { const Icon = shift.icon; return <button type="button" key={shift.value} onClick={() => { set("shift_type", shift.value); set("shift_pattern", shift.pattern); }} className={cn("flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all", form.shift_type === shift.value ? "border-primary bg-primary/10" : "border-border bg-card")}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"><Icon className="h-5 w-5 text-primary" /></div><div className="min-w-0 flex-1"><div className="font-semibold">{shift.label}</div><div className="text-xs text-muted-foreground">{shift.desc}</div></div><div className={cn("h-4 w-4 rounded-full border", form.shift_type === shift.value ? "border-primary bg-primary" : "border-muted-foreground")} /></button>; })}</div>
          {form.shift_type === "custom" && <Field label="Describe your shift pattern" value={form.custom_shift} onChange={(v) => set("custom_shift", v)} placeholder="e.g. 3 days, 3 nights, 4 off" />}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><CalendarDays className="h-5 w-5 text-primary" /></div><div><div className="text-sm font-semibold">When does this shift pattern start?</div><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Choose the date your selected work pattern starts. ShiftFit will use this as the anchor for the Calendar and current-day schedule.</p></div></div>
            <div className="mt-4 space-y-2"><Label>Shift start date</Label><Input type="date" value={form.shift_start_date} onChange={(e) => set("shift_start_date", e.target.value)} /></div>
          </div>
          <div><ChoiceLabel label="Which days are normally work days?" /><div className="grid grid-cols-7 gap-1.5">{DAYS.map((day, i) => <button type="button" key={day} onClick={() => toggleDay(day)} className={cn("rounded-xl py-2 text-[11px] font-bold", form.work_days.includes(day) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{DAY_LABELS[i][0]}</button>)}</div><p className="mt-2 text-[11px] text-muted-foreground">We'll refine exact shift timing later and use this as the starting schedule.</p></div>
        </Section>}

        {step === 3 && <Section title="How do you train?" subtitle="We'll use this to shape your workouts. Shift-specific workout timing comes next.">
          <div><ChoiceLabel label="Experience" /><div className="space-y-2">{TRAINING_LEVELS.map((item) => <button type="button" key={item.value} onClick={() => set("training_level", item.value)} className={cn("w-full rounded-2xl border p-4 text-left", form.training_level === item.value ? "border-primary bg-primary/10" : "border-border bg-card")}><div className="font-semibold">{item.label}</div><div className="text-xs text-muted-foreground">{item.desc}</div></button>)}</div></div>
          <div><ChoiceLabel label="Days per week" /><div className="grid grid-cols-4 gap-2">{[2, 3, 4, 5].map((days) => <Choice key={days} active={Number(form.training_days_per_week) === days} onClick={() => set("training_days_per_week", days)}>{days} days</Choice>)}</div></div>
          <div><ChoiceLabel label="Preferred training time" /><div className="grid grid-cols-2 gap-2">{TRAINING_TIMES.map((time) => <Choice key={time} active={form.training_time === time} onClick={() => set("training_time", time)}>{time}</Choice>)}</div></div>
          <div><ChoiceLabel label="Where do you train?" /><div className="grid grid-cols-2 gap-2">{TRAINING_LOCATIONS.map(({ value, label, icon: Icon }) => <Choice key={value} active={form.training_location === value} onClick={() => set("training_location", value)}><Icon className="mr-2 inline h-4 w-4" />{label}</Choice>)}</div></div>
        </Section>}

        {step === 4 && <Section title="Your ShiftFit plan is ready" subtitle="Check everything below. We'll build your 7-day plan when you start.">
          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <Row label="Name" value={form.full_name} /><Row label="Body" value={`${form.height_cm} cm · ${form.weight_kg} kg`} /><Row label="Goal" value={GOALS.find((g) => g.value === form.goal)?.label} /><Row label="Activity" value={ACTIVITY.find((a) => a.value === form.activity_level)?.label} /><Row label="Shift pattern" value={selectedShift.label} /><Row label="Shift starts" value={form.shift_start_date} /><Row label="Work days" value={form.work_days.map((d) => DAY_LABELS[DAYS.indexOf(d)]).join(", ")} /><Row label="Training" value={`${form.training_days_per_week} days · ${form.training_level}`} /><Row label="Training place" value={form.training_location === "gym" ? "Gym" : "Home"} />
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="text-sm font-semibold">Ready to go?</div><p className="mt-1 text-xs text-muted-foreground">ShiftFit will calculate your targets and create your first Monday–Sunday meals and workouts.</p></div>
        </Section>}

        <div className="mt-7 flex items-center gap-3">
          {step > 0 && <Button type="button" variant="outline" size="icon" onClick={() => setStep((s) => s - 1)} disabled={saving}><ChevronLeft className="h-4 w-4" /></Button>}
          {step < 4 ? <Button type="button" className="flex-1" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>Continue <ChevronRight className="ml-1 h-4 w-4" /></Button> : <Button type="button" className="flex-1" disabled={saving} onClick={finish}>{saving ? "Building your plan…" : "Create my ShiftFit plan"}</Button>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) { return <section><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p><div className="mt-6 space-y-5">{children}</div></section>; }
function ChoiceLabel({ label }) { return <Label className="text-sm font-semibold">{label}</Label>; }
function Choice({ active, onClick, children }) { return <button type="button" onClick={onClick} className={cn("flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-all", active ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground")}>{children}</button>; }
function Field({ label, value, onChange, type = "text", placeholder }) { return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>; }
function Row({ label, value }) { return <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium capitalize">{value}</span></div>; }
