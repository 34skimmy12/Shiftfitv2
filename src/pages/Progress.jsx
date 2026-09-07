import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/AppLayout";
import ProgressRing from "@/components/ProgressRing";
import { todayStr } from "@/lib/fitnessUtils";
import { Plus, TrendingDown, Activity, Ruler } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Progress() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [metrics, setMetrics] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ weight_kg: "", body_fat_pct: "", waist_cm: "" });
  const today = todayStr();
  useEffect(() => { if (!profile) return; base44.entities.BodyMetric.list("-created_date", 30).then((m) => setMetrics(m.reverse())); }, [profile]);
  if (loading) return <Splash />;
  if (!profile) { navigate("/onboarding"); return null; }
  const chartData = metrics.map((m) => ({ date: new Date(m.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }), weight: m.weight_kg, bodyfat: m.body_fat_pct }));
  const latest = metrics[metrics.length - 1]; const first = metrics[0];
  const weightDelta = latest && first ? latest.weight_kg - first.weight_kg : 0;
  const addMetric = async () => { const data = { date: today, weight_kg: Number(form.weight_kg) || profile.weight_kg, body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : undefined, waist_cm: form.waist_cm ? Number(form.waist_cm) : undefined }; const created = await base44.entities.BodyMetric.create(data); setMetrics((m) => [...m, created].sort((a,b) => new Date(a.date)-new Date(b.date))); setForm({ weight_kg:"", body_fat_pct:"", waist_cm:"" }); setShowAdd(false); };
  const stats = [
    { icon: TrendingDown, label: "Weight", value: latest ? `${latest.weight_kg} kg` : "—", delta: weightDelta, color: "hsl(84 81% 52%)" },
    { icon: Activity, label: "Body Fat", value: latest?.body_fat_pct ? `${latest.body_fat_pct}%` : "—", color: "hsl(250 80% 64%)" },
    { icon: Ruler, label: "Waist", value: latest?.waist_cm ? `${latest.waist_cm} cm` : "—", color: "hsl(190 90% 50%)" },
  ];
  return <AppLayout><header className="mb-6 flex items-start justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Progress</h1><p className="text-sm text-muted-foreground">Track your body metrics over time</p></div><button onClick={()=>setShowAdd(v=>!v)} className="no-tap-highlight flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Plus className="h-5 w-5"/></button></header>
    {showAdd && <div className="mb-5 rounded-2xl border border-border bg-card p-4"><div className="mb-3 text-sm font-semibold">Log today's metrics</div><div className="grid grid-cols-3 gap-2"><InField label="Weight (kg)" value={form.weight_kg} onChange={v=>setForm(f=>({...f,weight_kg:v}))}/><InField label="Body fat %" value={form.body_fat_pct} onChange={v=>setForm(f=>({...f,body_fat_pct:v}))}/><InField label="Waist (cm)" value={form.waist_cm} onChange={v=>setForm(f=>({...f,waist_cm:v}))}/></div><button onClick={addMetric} className="no-tap-highlight mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Save</button></div>}
    <div className="mb-5 grid grid-cols-3 gap-3">{stats.map(s=>{const Icon=s.icon;return <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center"><Icon className="mx-auto mb-1 h-4 w-4" style={{color:s.color}}/><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-base font-bold">{s.value}</div>{s.delta!==undefined&&s.delta!==0&&<div className={`text-[10px] ${s.delta<0?"text-primary":"text-destructive"}`}>{s.delta<0?"▼":"▲"} {Math.abs(s.delta).toFixed(1)}kg</div>}</div>})}</div>
    <div className="mb-5 flex items-center justify-center gap-6 rounded-2xl border border-border bg-card p-5"><ProgressRing value={Math.min(metrics.length,4)} max={4} color="hsl(84 81% 52%)" label={`${metrics.length}/30`} sublabel="logs" size={100}/><div><div className="text-xs text-muted-foreground">Your goal</div><div className="text-lg font-bold capitalize">{profile.goal==="lose"?"Lose Fat":profile.goal==="gain"?"Build Muscle":"Maintain"}</div><div className="text-xs text-muted-foreground">Target: {profile.calorie_target} kcal/day</div></div></div>
    {chartData.length>1?<div className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 text-sm font-semibold">Weight Trend</div><div style={{height:180}}><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:5,right:5,bottom:5,left:-20}}><CartesianGrid strokeDasharray="3 3" stroke="hsl(222 16% 18%)" vertical={false}/><XAxis dataKey="date" tick={{fill:"hsl(220 12% 62%)",fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"hsl(220 12% 62%)",fontSize:10}} axisLine={false} tickLine={false} domain={["dataMin - 1","dataMax + 1"]}/><Tooltip contentStyle={{background:"hsl(222 20% 11%)",border:"1px solid hsl(222 16% 18%)",borderRadius:12,fontSize:12}}/><Line type="monotone" dataKey="weight" stroke="hsl(84 81% 52%)" strokeWidth={2.5} dot={{r:3,fill:"hsl(84 81% 52%)"}}/></LineChart></ResponsiveContainer></div></div>:<div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Log at least 2 entries to see your trend chart.</div>}
  </AppLayout>;
}
function InField({label,value,onChange}){return <div className="space-y-1"><label className="text-[10px] text-muted-foreground">{label}</label><input type="number" value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-2 py-2 text-sm outline-none focus:border-primary"/></div>}
function Splash(){return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary"/></div>}
