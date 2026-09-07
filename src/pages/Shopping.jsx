import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Shopping() {
  const [items, setItems] = useState([]);
  useEffect(() => { base44.entities.ShoppingListItem.list().then(setItems); }, []);
  const toggle = async (item) => { const next = await base44.entities.ShoppingListItem.update(item.id, { checked: !item.checked }); setItems(v => v.map(x => x.id === item.id ? next : x)); };
  const groups = items.reduce((a, x) => { (a[x.category || "Other"] ||= []).push(x); return a; }, {});
  return <AppLayout>
    <header className="mb-6"><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShoppingCart className="h-5 w-5" /></div><h1 className="text-2xl font-bold">Shopping list</h1><p className="text-sm text-muted-foreground">Built from your 7-day meal plan.</p></header>
    {!items.length ? <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Your list will appear after onboarding.</div> : Object.entries(groups).map(([category, list]) => <section key={category} className="mb-5"><h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{category}</h2><div className="space-y-1.5">{list.map(item => <button key={item.id} onClick={() => toggle(item)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"><div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", item.checked ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{item.checked && <Check className="h-3 w-3"/>}</div><span className={cn("flex-1 text-sm", item.checked && "line-through text-muted-foreground")}>{item.name}</span><span className="text-xs text-muted-foreground">{item.quantity}</span></button>)}</div></section>)}
  </AppLayout>;
}
