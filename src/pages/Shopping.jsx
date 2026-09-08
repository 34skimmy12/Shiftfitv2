import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { base44 } from "@/api/base44Client";
import { Check, ChevronRight, ShoppingCart, Sparkles, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBasketPriceComparison, generateSmartBasket } from "@/lib/shoppingUtils";

const STORES = ["Aldi", "Lidl", "Asda", "Sainsbury’s", "Tesco", "Morrisons"];

function money(value) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function basketKey(item) {
  return `${String(item.name || "").trim().toLowerCase()}|${String(item.category || "Other").trim().toLowerCase()}`;
}

export default function Shopping() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("list");

  useEffect(() => {
    async function loadBasket() {
      try {
        const [mealPlans, savedItems] = await Promise.all([
          base44.entities.MealPlan.list(),
          base44.entities.ShoppingListItem.list(),
        ]);
        const generated = generateSmartBasket(mealPlans);
        if (!generated.length) {
          setItems(savedItems || []);
          return;
        }
        const checkedByKey = new Map((savedItems || []).map((item) => [basketKey(item), Boolean(item.checked)]));
        const nextItems = generated.map((item) => ({ ...item, checked: checkedByKey.get(basketKey(item)) || false }));
        await Promise.all((savedItems || []).map((item) => base44.entities.ShoppingListItem.delete(item.id)));
        const persisted = await base44.entities.ShoppingListItem.bulkCreate(nextItems);
        setItems(persisted);
      } catch {
        base44.entities.ShoppingListItem.list().then(setItems).catch(() => setItems([]));
      }
    }
    loadBasket();
  }, []);

  const toggle = async (item) => {
    const next = await base44.entities.ShoppingListItem.update(item.id, { checked: !item.checked });
    setItems((value) => value.map((x) => (x.id === item.id ? next : x)));
  };

  const pricedItems = useMemo(() => getBasketPriceComparison(items), [items]);
  const matchedItems = pricedItems.filter((item) => item.priceMatch?.offers?.length);
  const unmatchedCount = Math.max(0, items.length - matchedItems.length);

  // A store with fewer matched products cannot honestly be called the cheapest basket.
  // Rank by coverage first, then use matched subtotal as the tie-breaker.
  const storeTotals = useMemo(() => {
    return STORES.map((store) => {
      const matched = matchedItems.filter((item) => item.priceMatch.offers.some((offer) => offer.store === store));
      const total = matched.reduce((sum, item) => sum + (item.priceMatch.offers.find((offer) => offer.store === store)?.total || 0), 0);
      const coverage = matchedItems.length ? matched.length / matchedItems.length : 0;
      return { store, total: Number(total.toFixed(2)), matched: matched.length, coverage };
    }).filter((row) => row.matched > 0).sort((a, b) => b.matched - a.matched || a.total - b.total);
  }, [matchedItems]);

  const bestStore = storeTotals[0];
  const groups = useMemo(() => pricedItems.reduce((acc, item) => {
    (acc[item.category || "Other"] ||= []).push(item);
    return acc;
  }, {}), [pricedItems]);

  const checked = items.filter((item) => item.checked).length;

  return (
    <AppLayout>
      <header className="mb-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShoppingCart className="h-5 w-5" /></div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Basket</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your meal plan, turned into a smarter weekly shop.</p>
      </header>

      <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {[["list", "Shopping list"], ["basket", "Best basket"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={cn("rounded-lg px-3 py-2.5 text-sm font-semibold transition", tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{label}</button>
        ))}
      </div>

      {tab === "basket" ? (
        <div className="space-y-4">
          <section className="rounded-2xl border border-primary/25 bg-primary/[0.07] p-4 shadow-[0_0_28px_rgba(0,220,230,0.07)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.14em]">Price intelligence</span></div>
                <h2 className="text-lg font-bold">{bestStore ? `Best current match: ${bestStore.store}` : "Building your price basket"}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">We rank supermarkets by how much of your matched basket they can cover, then by matched subtotal. Unmatched ingredients are never given an invented price.</p>
              </div>
              {bestStore && <div className="text-right"><p className="text-2xl font-black text-primary">{money(bestStore.total)}</p><p className="text-[10px] text-muted-foreground">matched subtotal</p></div>}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Basket</p><p className="mt-1 font-bold">{items.length}</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Matched</p><p className="mt-1 font-bold">{matchedItems.length}</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">To price</p><p className="mt-1 font-bold">{unmatchedCount}</p></div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2"><WalletCards className="h-4 w-4 text-primary" /><h2 className="font-bold">Compare matched supermarkets</h2></div>
            <div className="space-y-2">
              {storeTotals.map((row, index) => (
                <div key={row.store} className={cn("flex items-center justify-between rounded-xl border p-3", index === 0 ? "border-primary/30 bg-primary/[0.06]" : "border-white/10 bg-black/10")}>
                  <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-black">{index + 1}</div><div><p className="text-sm font-semibold">{row.store}</p><p className="text-[10px] text-muted-foreground">{row.matched}/{matchedItems.length} matched products · {Math.round(row.coverage * 100)}% coverage</p></div></div>
                  <div className="text-right"><p className="text-sm font-bold">{money(row.total)}</p>{index === 0 && <p className="text-[10px] font-semibold text-primary">Best coverage</p>}</div>
                </div>
              ))}
              {!storeTotals.length && <p className="py-4 text-center text-xs text-muted-foreground">No current product matches yet.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-bold">Matched products</h2>
            <div className="mt-3 space-y-2">
              {matchedItems.map((item) => {
                const best = item.priceMatch.cheapest;
                return <div key={item.id || item.name} className="rounded-xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{item.name}</p><p className="text-[10px] text-muted-foreground">Need {item.quantity} · {item.priceMatch.checkedAt}</p></div><div className="text-right"><p className="text-sm font-bold text-primary">{best.store} {money(best.total)}</p><p className="text-[10px] text-muted-foreground">{best.packs} pack{best.packs === 1 ? "" : "s"}</p></div></div><div className="mt-2 flex flex-wrap gap-1.5">{item.priceMatch.offers.slice(0, 5).map((offer) => <span key={offer.store} className={cn("rounded-full border px-2 py-1 text-[10px]", offer.store === best.store ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 text-muted-foreground")}>{offer.store} {money(offer.total)}</span>)}</div></div>;
              })}
              {!matchedItems.length && <p className="text-xs text-muted-foreground">We’ll show product matches here as the price catalogue grows.</p>}
            </div>
          </section>

          <p className="px-2 text-center text-[10px] leading-4 text-muted-foreground">Price data is a dated public snapshot and can change by store, region, loyalty status and date. The app does not claim live checkout pricing yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Weekly basket</p><p className="mt-1 text-xl font-bold">{items.length} items</p></div><button onClick={() => setTab("basket")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">Best basket <ChevronRight className="h-3.5 w-3.5" /></button></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: items.length ? `${(checked / items.length) * 100}%` : "0%" }} /></div>
            <p className="mt-2 text-[11px] text-muted-foreground">{checked} of {items.length} items checked · {matchedItems.length} currently price matched</p>
          </section>

          {!items.length ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><ShoppingCart className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h2 className="font-semibold">Your list is empty</h2><p className="mt-1 text-sm text-muted-foreground">Generate your 7-day meal plan and your shopping list will appear here.</p></div> : Object.entries(groups).map(([category, categoryItems]) => (
            <section key={category} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{category}</h2><div className="space-y-1">
              {categoryItems.map((item) => { const best = item.priceMatch?.cheapest; return <button key={item.id} onClick={() => toggle(item)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.04]"><span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", item.checked ? "border-primary bg-primary text-primary-foreground" : "border-white/20")}>{item.checked && <Check className="h-3.5 w-3.5" />}</span><span className={cn("flex-1 text-sm", item.checked && "text-muted-foreground line-through")}>{item.name}</span>{best && <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{best.store} {money(best.total)}</span>}<span className="text-xs text-muted-foreground">{item.quantity}</span></button>; })}
            </div></section>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
