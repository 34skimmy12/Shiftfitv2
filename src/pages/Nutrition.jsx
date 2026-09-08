import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/AppLayout";
import ShiftBadge from "@/components/ShiftBadge";
import { weekdayOf, WEEKDAY_LABELS, todayStr, swapMeal, getMealSwapOptions, generateShoppingList, computeTargets } from "@/lib/fitnessUtils";
import { Droplets, Plus, Minus, ShoppingCart, Check, Flame, Beef, Wheat, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MEAL_TYPE_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", pre_shift: "Pre-Shift", post_shift: "Post-Shift" };

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [plans, setPlans] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [water, setWater] = useState(0);
  const [shopping, setShopping] = useState([]);
  const [showShopping, setShowShopping] = useState(false);
  const [swapOpen, setSwapOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const today = todayStr();
  const wdIdx = weekdayOf(today);

  const loadData = async () => {
    if (!profile) return;
    const [mealPlans, waterLogs, basket] = await Promise.all([base44.entities.MealPlan.list(), base44.entities.WaterLog.filter({ date: today }), base44.entities.ShoppingListItem.list()]);
    const sorted = [...mealPlans].sort((a, b) => a.day_index - b.day_index);
    setPlans(sorted);
    setActiveDay((current) => sorted.some((p) => p.day_index === current) ? current : wdIdx);
    setWater(waterLogs[0]?.amount_ml || 0);
    setShopping(basket);
  };

  useEffect(() => { loadData(); }, [profile, today, wdIdx]);

  if (loading) return <Splash />;
  if (!profile) { navigate("/onboarding"); return null; }

  const plan = plans.find((p) => p.day_index === activeDay) || plans[0];
  const adjustWater = async (delta) => {
    setBusy(true); const next = Math.max(0, water + delta); setWater(next);
    try { const existing = await base44.entities.WaterLog.filter({ date: today }); if (existing[0]) await base44.entities.WaterLog.update(existing[0].id, { amount_ml: next }); else await base44.entities.WaterLog.create({ date: today, amount_ml: next }); } finally { setBusy(false); }
  };
  const toggleShopping = async (item) => { const updated = await base44.entities.ShoppingListItem.update(item.id, { checked: !item.checked }); setShopping((s) => s.map((x) => (x.id === item.id ? updated : x))); };

  const refreshBasket = async (updatedPlans) => {
    const items = generateShoppingList(updatedPlans);
    const existing = await base44.entities.ShoppingListItem.list();
    await Promise.all(existing.map((item) => base44.entities.ShoppingListItem.delete(item.id)));
    const created = items.length ? await base44.entities.ShoppingListItem.bulkCreate(items) : [];
    setShopping(created);
  };

  const handleSwap = async (mealIndex, replacementKey) => {
    if (!plan || busy) return;
    setBusy(true);
    try {
      const updatedPlan = swapMeal(plan, mealIndex, profile, computeTargets(profile), replacementKey);
      const saved = await base44.entities.MealPlan.update(plan.id, { meals: updatedPlan.meals, total_calories: updatedPlan.total_calories, total_protein: updatedPlan.total_protein });
      const nextPlans = plans.map((p) => p.id === saved.id ? saved : p);
      setPlans(nextPlans);
      setSwapOpen(null);
      await refreshBasket(nextPlans);
    } finally { setBusy(false); }
  };

  const waterPct = Math.min(100, (water / profile.water_target_ml) * 100);

  return <AppLayout>
    <header className="mb-6"><h1 className="text-2xl font-bold tracking-tight">Nutrition</h1><p className="text-sm text-muted-foreground">Meal plans tuned to your shifts</p></header>
    <div className="mb-5 rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-[hsl(190_90%_50%)]" /><span className="text-sm font-semibold">Water</span></div><span className="text-xs text-muted-foreground">{water} / {profile.water_target_ml} ml</span></div><div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-[hsl(190_90%_50%)] transition-all duration-500" style={{ width: `${waterPct}%` }} /></div><div className="flex items-center justify-between"><button disabled={busy} onClick={() => adjustWater(-250)} className="no-tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-secondary"><Minus className="h-4 w-4" /></button><span className="text-xs text-muted-foreground">±250 ml</span><button disabled={busy} onClick={() => adjustWater(250)} className="no-tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button></div></div>
    <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">{plans.map((p) => <button key={p.id} onClick={() => setActiveDay(p.day_index)} className={cn("no-tap-highlight flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all", activeDay === p.day_index ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{WEEKDAY_LABELS[p.day_index][0]}</button>)}</div>
    {plan && <><div className="mb-3 flex items-center justify-between"><div><div className="font-semibold">{plan.day_label}'s Meals</div><div className="text-xs text-muted-foreground">{plan.total_calories} kcal · {plan.total_protein}g protein</div></div><ShiftBadge shift={plan.shift_context} /></div><div className="space-y-3">{plan.meals.map((m, i) => <React.Fragment key={`${m.meal_key || m.name}-${i}`}><div className="rounded-2xl border border-border bg-card p-4"><div className="mb-1 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wide text-primary">{MEAL_TYPE_LABEL[m.type]}</span><div className="flex items-center gap-2"><span className="text-sm font-semibold">{m.calories} kcal</span><button disabled={busy} onClick={() => setSwapOpen(swapOpen === i ? null : i)} className="no-tap-highlight inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-semibold"><RefreshCw className="h-3 w-3" /> Swap</button></div></div><div className="font-semibold">{m.name}</div><div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Beef className="h-3 w-3" /> {m.protein}g</span><span className="flex items-center gap-1"><Wheat className="h-3 w-3" /> {m.carbs}g</span><span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {m.fat}g</span></div><ul className="mt-2 space-y-0.5">{m.items.map((it) => <li key={it} className="text-xs text-muted-foreground">· {it}</li>)}</ul>{swapOpen === i && <SwapPanel plan={plan} mealIndex={i} busy={busy} onClose={() => setSwapOpen(null)} onSwap={handleSwap} profile={profile} />}</div></React.Fragment>)}</div>
    <button onClick={() => setShowShopping((v) => !v)} className="no-tap-highlight mt-5 flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShoppingCart className="h-4 w-4" /></div><div className="text-left"><div className="text-sm font-semibold">Shopping List</div><div className="text-xs text-muted-foreground">{shopping.filter((s) => !s.checked).length} items to buy</div></div></div><span className="text-xs text-muted-foreground">{showShopping ? "Hide" : "View"}</span></button>
    {showShopping && <div className="mt-3 space-y-1.5">{shopping.map((item) => <button key={item.id} onClick={() => toggleShopping(item)} className="no-tap-highlight flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left"><div className={cn("flex h-5 w-5 items-center justify-center rounded-md border", item.checked ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{item.checked && <Check className="h-3 w-3" />}</div><span className={cn("flex-1 text-sm", item.checked && "text-muted-foreground line-through")}>{item.name}</span><span className="text-[10px] text-muted-foreground">{item.category}</span></button>)}</div>}</>}
  </AppLayout>;
}

function SwapPanel({ plan, mealIndex, busy, onClose, onSwap, profile }) {
  const options = getMealSwapOptions(plan, mealIndex, profile, 3);
  return <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">Swap this meal</span><button onClick={onClose} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button></div><div className="space-y-2">{options.length ? options.map((option) => <button key={option.key} disabled={busy} onClick={() => onSwap(mealIndex, option.key)} className="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary"><div className="text-xs font-semibold">{option.name}</div><div className="mt-1 text-[10px] text-muted-foreground">{option.items.join(" · ")}</div></button>) : <div className="text-[11px] text-muted-foreground">No compatible alternative is available for this meal with your current preferences.</div>}</div><p className="mt-2 text-[10px] text-muted-foreground">Your 7-day shopping basket updates automatically.</p></div>;
}

function Splash() { return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>; }
