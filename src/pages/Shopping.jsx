import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { base44 } from "@/api/base44Client";
import { Check, ChevronRight, ShoppingCart, Sparkles, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const STORES = [
  { name: "Aldi", accent: "Best value", benchmark: 1.0 },
  { name: "Lidl", accent: "Close second", benchmark: 1.02 },
  { name: "Asda", accent: "Full range", benchmark: 1.17 },
  { name: "Sainsbury’s", accent: "Nectar prices", benchmark: 1.19 },
  { name: "Tesco", accent: "Clubcard prices", benchmark: 1.20 },
  { name: "Morrisons", accent: "More prices", benchmark: 1.23 },
];

function money(value) {
  return `£${value.toFixed(2)}`;
}

export default function Shopping() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("list");

  useEffect(() => {
    base44.entities.ShoppingListItem.list().then(setItems).catch(() => setItems([]));
  }, []);

  const toggle = async (item) => {
    const next = await base44.entities.ShoppingListItem.update(item.id, { checked: !item.checked });
    setItems((value) => value.map((x) => (x.id === item.id ? next : x)));
  };

  const groups = useMemo(() => items.reduce((acc, item) => {
    (acc[item.category || "Other"] ||= []).push(item);
    return acc;
  }, {}), [items]);

  const checked = items.filter((item) => item.checked).length;
  const estimatedBase = Math.max(25, items.length * 2.35);
  const storeEstimates = STORES.map((store) => ({ ...store, total: estimatedBase * store.benchmark }));
  const cheapest = storeEstimates[0];
  const bestFullRange = storeEstimates[2];

  return (
    <AppLayout>
      <header className="mb-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Basket</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your meal plan, turned into a smarter weekly shop.</p>
      </header>

      <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {[["list", "Shopping list"], ["basket", "Best basket"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn("rounded-lg px-3 py-2.5 text-sm font-semibold transition", tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "basket" ? (
        <div className="space-y-4">
          <section className="rounded-2xl border border-primary/25 bg-primary/[0.07] p-4 shadow-[0_0_28px_rgba(0,220,230,0.07)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">Best basket</span>
                </div>
                <h2 className="text-lg font-bold">Start with Aldi</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Based on your current list and a benchmark estimate. Live product pricing is not connected yet.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">{money(cheapest.total)}</p>
                <p className="text-[10px] text-muted-foreground">estimated</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Items</p>
                <p className="mt-1 font-bold">{items.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Checked</p>
                <p className="mt-1 font-bold">{checked}/{items.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <WalletCards className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Compare supermarkets</h2>
            </div>
            <div className="space-y-2">
              {storeEstimates.map((store, index) => (
                <div key={store.name} className={cn("flex items-center justify-between rounded-xl border p-3", index === 0 ? "border-primary/30 bg-primary/[0.06]" : "border-white/10 bg-black/10")}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-black">{index + 1}</div>
                    <div>
                      <p className="text-sm font-semibold">{store.name}</p>
                      <p className="text-[10px] text-muted-foreground">{store.accent}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{money(store.total)}</p>
                    {index === 0 && <p className="text-[10px] font-semibold text-primary">Best estimate</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-bold">How Smart Basket will work</h2>
            <div className="mt-3 space-y-3 text-xs text-muted-foreground">
              {["Match every meal-plan ingredient to real supermarket products.", "Include loyalty prices and pack-size differences.", "Split the basket when buying from two stores saves money.", "Suggest cheaper swaps without breaking your nutrition targets."].map((text, index) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{index + 1}</span>
                  <span className="leading-5">{text}</span>
                </div>
              ))}
            </div>
          </section>

          <p className="px-2 text-center text-[10px] leading-4 text-muted-foreground">The supermarket figures above are planning estimates, not live prices. Actual prices and availability vary by store and date. UK grocery comparisons show that the cheapest retailer can change by basket and loyalty pricing. citeturn0search0</p>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Weekly basket</p>
                <p className="mt-1 text-xl font-bold">{items.length} items</p>
              </div>
              <button onClick={() => setTab("basket")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                Best basket <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: items.length ? `${(checked / items.length) * 100}%` : "0%" }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{checked} of {items.length} items checked</p>
          </section>

          {!items.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h2 className="font-semibold">Your list is empty</h2>
              <p className="mt-1 text-sm text-muted-foreground">Generate your 7-day meal plan and your shopping list will appear here.</p>
            </div>
          ) : Object.entries(groups).map(([category, categoryItems]) => (
            <section key={category} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{category}</h2>
              <div className="space-y-1">
                {categoryItems.map((item) => (
                  <button key={item.id} onClick={() => toggle(item)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.04]">
                    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", item.checked ? "border-primary bg-primary text-primary-foreground" : "border-white/20")}>
                      {item.checked && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className={cn("flex-1 text-sm", item.checked && "text-muted-foreground line-through")}>{item.name}</span>
                    {item.quantity && <span className="text-xs text-muted-foreground">{item.quantity}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
