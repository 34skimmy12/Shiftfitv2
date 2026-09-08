import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeTargets, generateMealPlans, generateShoppingList, generateWorkoutPlans } from "@/lib/fitnessUtils";
import { ArrowLeft, Save, RefreshCw, UserRound, Target, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose", label: "Lose weight", desc: "Calorie deficit + high protein" },
  { value: "maintain", label: "Maintain", desc: "Stay strong and consistent" },
  { value: "gain", label: "Build muscle", desc: "Small surplus + progressive training" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    base44.entities.UserProfile.list().then((rows) => {
      const p = rows[0];
      setProfile(p || null);
      if (p) setForm({ ...p, food_likes: (p.food_likes || []).join(", "), food_avoid: (p.food_avoid || []).join(", ") });
    });
  }, []);

  if (!form) return <Splash />;
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (regenerate = false) => {
    setSaving(true); setMessage("");
    try {
      const clean = {
        ...form,
        age: Number(form.age), height_cm: Number(form.height_cm), weight_kg: Number(form.weight_kg),
        food_likes: String(form.food_likes || "").split(",").map((x) => x.trim()).filter(Boolean),
        food_avoid: String(form.food_avoid || "").split(",").map((x) => x.trim()).filter(Boolean),
      };
      const targets = computeTargets(clean);
      const updated = await base44.entities.UserProfile.update(profile.id, { ...clean, ...targets });
      setProfile(updated); setForm({ ...updated, food_likes: (updated.food_likes || []).join(", "), food_avoid: (updated.food_avoid || []).join(", ") });
      if (regenerate) {
        const meals = generateMealPlans({ ...clean, ...targets }, targets);
        const workouts = generateWorkoutPlans({ ...clean, ...targets });

        // Replace persisted plans instead of updating whatever legacy rows happen to exist.
        // This guarantees the live app cannot keep showing meals from an older generator.
        const existingMeals = await base44.entities.MealPlan.list();
        await Promise.all(existingMeals.map((p) => base44.entities.MealPlan.delete(p.id)));
        await base44.entities.MealPlan.bulkCreate(meals);

        const existingWorkouts = await base44.entities.WorkoutPlan.list();
        await Promise.all(existingWorkouts.map((p) => base44.entities.WorkoutPlan.delete(p.id)));
        await base44.entities.WorkoutPlan.bulkCreate(workouts);

        // The basket must represent this exact newly generated 7-day plan.
        const oldShopping = await base44.entities.ShoppingListItem.list();
        await Promise.all(oldShopping.map((item) => base44.entities.ShoppingListItem.delete(item.id)));
        const list = generateShoppingList(meals);
        if (list.length) await base44.entities.ShoppingListItem.bulkCreate(list);

        setMessage("Saved — your full 7-day plan has been rebuilt.");
      } else setMessage("Profile saved.");
    } catch (e) { setMessage("Couldn’t save your changes. Try again."); }
    finally { setSaving(false); }
  };

  return <AppLayout>
    <div className="mb-5 flex items-center gap-3"><button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"><ArrowLeft className="h-4 w-4" /></button><div><h1 className="text-xl font-bold">Profile</h1><p className="text-xs text-muted-foreground">Control your ShiftFit plan</p></div></div>
    <Section icon={UserRound} title="Personal details" subtitle="These drive your calorie and recovery targets.">
      <Field label="Name" value={form.full_name || ""} onChange={(v) => set("full_name", v)} />
      <div className="grid grid-cols-2 gap-3"><Field label="Age" type="number" value={form.age || ""} onChange={(v) => set("age", v)} /><Field label="Sex" select value={form.sex || "male"} options={["male", "female", "other"]} onChange={(v) => set("sex", v)} /></div>
      <div className="grid grid-cols-2 gap-3"><Field label="Height (cm)" type="number" value={form.height_cm || ""} onChange={(v) => set("height_cm", v)} /><Field label="Weight (kg)" type="number" value={form.weight_kg || ""} onChange={(v) => set("weight_kg", v)} /></div>
    </Section>
    <Section icon={Target} title="Goal & nutrition" subtitle="Change your goal and ShiftFit recalculates your targets.">
      <div className="space-y-2">{GOALS.map((g) => <button key={g.value} onClick={() => set("goal", g.value)} className={cn("w-full rounded-2xl border p-4 text-left", form.goal === g.value ? "border-primary bg-primary/10" : "border-border bg-card")}><div className="font-semibold">{g.label}</div><div className="text-xs text-muted-foreground">{g.desc}</div></button>)}</div>
      <div className="grid grid-cols-2 gap-3"><Field label="Calories / day" type="number" value={form.calorie_target || ""} onChange={(v) => set("calorie_target", v)} /><Field label="Protein (g)" type="number" value={form.protein_target || ""} onChange={(v) => set("protein_target", v)} /></div>
      <div className="grid grid-cols-2 gap-3"><Field label="Target weight (kg)" type="number" value={form.target_weight_kg || ""} onChange={(v) => set("target_weight_kg", v)} /><Field label="Activity" select value={form.activity_level || "moderate"} options={["sedentary", "light", "moderate", "active"]} onChange={(v) => set("activity_level", v)} /></div>
      <div><Label>Foods you like</Label><Input className="mt-2" value={form.food_likes || ""} onChange={(e) => set("food_likes", e.target.value)} placeholder="Chicken, rice, yoghurt..." /></div>
      <div><Label>Foods to avoid</Label><Input className="mt-2" value={form.food_avoid || ""} onChange={(e) => set("food_avoid", e.target.value)} placeholder="Foods or ingredients..." /></div>
    </Section>
    <Section icon={Clock3} title="Shift schedule" subtitle="Your schedule controls day, night and recovery planning.">
      <Field label="Shift pattern" select value={form.shift_pattern || "fixed_day"} options={["fixed_day", "fixed_night", "rotating"]} onChange={(v) => set("shift_pattern", v)} />
      <div><Label>Work days</Label><div className="mt-2 grid grid-cols-7 gap-1.5">{["sun","mon","tue","wed","thu","fri","sat"].map((d) => <button key={d} onClick={() => set("work_days", (form.work_days || []).includes(d) ? form.work_days.filter((x) => x !== d) : [...(form.work_days || []), d])} className={cn("rounded-xl py-2 text-[11px] font-semibold", (form.work_days || []).includes(d) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{d[0].toUpperCase()}</button>)}</div></div>
    </Section>
    {message && <div className="mb-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">{message}</div>}
    <div className="space-y-2 pb-4"><Button className="w-full" disabled={saving} onClick={() => save(false)}><Save className="mr-2 h-4 w-4" />Save profile</Button><Button variant="outline" className="w-full" disabled={saving} onClick={() => save(true)}><RefreshCw className="mr-2 h-4 w-4" />Save & regenerate my 7-day plan</Button></div>
  </AppLayout>;
}

function Section({ icon: Icon, title, subtitle, children }) { return <section className="mb-4 rounded-2xl border border-border bg-card p-4"><div className="mb-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><div><h2 className="text-sm font-bold">{title}</h2><p className="text-[11px] text-muted-foreground">{subtitle}</p></div></div><div className="space-y-4">{children}</div></section>; }
function Field({ label, value, onChange, type = "text", select, options = [] }) { return <div><Label>{label}</Label>{select ? <select className="mt-2 flex h-10 w-full rounded-xl border border-input bg-secondary px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select> : <Input className="mt-2" type={type} value={value} onChange={(e) => onChange(e.target.value)} />}</div>; }
function Splash() { return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>; }
