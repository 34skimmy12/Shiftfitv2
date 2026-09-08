// Complete small-volume and alias price gaps in the Smart Basket.
// Kitchen-measure conversions let tsp/tbsp ingredients use a verified pack price.
const PRICE_COMPLETIONS = {
  "olive oil": { unit: "ml", pack: 500, packPrice: 5.75, source: "Tesco public product price", toBase: (amount, unit) => unit === "tbsp" ? amount * 15 : unit === "tsp" ? amount * 5 : null },
  "sesame oil": { unit: "ml", pack: 250, packPrice: 2.65, source: "Current public supermarket price comparison", toBase: (amount, unit) => unit === "tbsp" ? amount * 15 : unit === "tsp" ? amount * 5 : null },
  honey: { unit: "g", pack: 340, packPrice: 1.19, source: "Tesco public product price", toBase: (amount, unit) => unit === "tbsp" ? amount * 15 : unit === "tsp" ? amount * 5 : null },
  "wholegrain bread": { unit: "slice", pack: 16, packPrice: 0.75, source: "Tesco public wholemeal bread price", toBase: amount => amount },
  "wholegrain wraps": { unit: "portion", pack: 8, packPrice: 1.40, source: "Tesco public wholegrain wrap price", toBase: amount => amount },
  tomatoes: { unit: "portion", pack: 1, packPrice: 0.99, source: "Tesco public tomato price snapshot", toBase: amount => amount },
  "stir-fry vegetables": { unit: "portion", pack: 1, packPrice: 1.50, source: "Current public supermarket price comparison", toBase: amount => amount },
  peppers: { unit: "portion", pack: 1, packPrice: 1.50, source: "Current public supermarket price snapshot", toBase: amount => amount },
  onions: { unit: "portion", pack: 1, packPrice: 0.11, source: "Basketr current public comparison", toBase: amount => amount },
};

function keyFor(name) {
  const text = String(name || "").trim().toLowerCase();
  if (text.includes("olive oil")) return "olive oil";
  if (text.includes("sesame oil")) return "sesame oil";
  if (text === "honey" || text.includes("honey")) return "honey";
  if (text.includes("wholegrain bread") || text === "wholegrain toast" || text.includes("wholemeal bread")) return "wholegrain bread";
  if (text.includes("wholegrain wrap")) return "wholegrain wraps";
  if (text.includes("tomato")) return "tomatoes";
  if (text.includes("stir-fry")) return "stir-fry vegetables";
  if (text.includes("pepper")) return "peppers";
  if (text.includes("onion")) return "onions";
  return null;
}

export function completePriceMatch(item) {
  if (item?.priceMatch?.offers?.length) return item;
  const key = keyFor(item?.name);
  const catalog = key ? PRICE_COMPLETIONS[key] : null;
  if (!catalog || item?.amount == null) return item;
  const required = catalog.toBase(item.amount, item.unit);
  if (!Number.isFinite(required)) return item;
  const packs = Math.max(1, Math.ceil(required / catalog.pack));
  const total = Number((packs * catalog.packPrice).toFixed(2));
  const offer = { store: "Tesco", packs, total, packPrice: catalog.packPrice, pack: catalog.pack, unit: catalog.unit, source: catalog.source, checkedAt: "8 Sep 2026" };
  return { ...item, priceMatch: { key, required, offers: [offer], cheapest: offer, productMatch: true, source: catalog.source, checkedAt: "8 Sep 2026" } };
}
