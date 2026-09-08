// Master ShiftFit ingredient-price database.
// Prices are verified public UK supermarket snapshots. Blank stores mean no verified comparable pack price.
const D = "8 Sep 2026";
const src = "Verified public UK supermarket price snapshot";

const STORE_PRICES = {
  "chicken breast": { unit:"g", pack:1000, stores:{ Aldi:{price:1.99}, Lidl:{price:4.99}, Asda:{price:2.33}, "Sainsbury’s":{price:2.00}, Tesco:{price:2.44}, Morrisons:{price:2.49} } },
  "turkey mince": { unit:"g", pack:500, stores:{ Aldi:{price:2.99}, Lidl:{price:4.99}, Asda:{price:3.50}, "Sainsbury’s":{price:3.95}, Tesco:{price:4.40}, Morrisons:{price:4.49} } },
  "beef mince": { unit:"g", pack:500, stores:{ Lidl:{price:5.49,pack:800}, Asda:{price:3.25}, "Sainsbury’s":{price:3.09}, Tesco:{price:2.40}, Morrisons:{price:5.05} } },
  salmon: { unit:"g", pack:240, stores:{ Aldi:{price:3.59,pack:240}, Lidl:{price:4.49,pack:240}, Asda:{price:4.19,pack:350}, "Sainsbury’s":{price:4.95,pack:250}, Tesco:{price:4.90,pack:260}, Morrisons:{price:4.15,pack:220} } },
  tuna: { unit:"g", pack:110, stores:{ Aldi:{price:1.39,pack:145}, Lidl:{price:1.29,pack:145}, Asda:{price:1.25,pack:145}, "Sainsbury’s":{price:1.35,pack:145}, Tesco:{price:1.40,pack:110}, Morrisons:{price:1.35,pack:145} } },
  cod: { unit:"g", pack:280, stores:{ Aldi:{price:4.99,pack:300}, Lidl:{price:4.99,pack:300}, Asda:{price:5.00,pack:400}, "Sainsbury’s":{price:5.00,pack:400}, Tesco:{price:8.15,pack:280}, Morrisons:{price:5.00,pack:400} } },
  "turkey slices": { unit:"g", pack:100, stores:{ Aldi:{price:1.79,pack:100}, Lidl:{price:1.79,pack:100}, Asda:{price:1.80,pack:100}, "Sainsbury’s":{price:2.00,pack:100}, Tesco:{price:1.90,pack:100}, Morrisons:{price:1.90,pack:100} } },
  "smoked salmon": { unit:"g", pack:100, stores:{ Aldi:{price:2.99,pack:100}, Lidl:{price:3.29,pack:100}, Asda:{price:3.50,pack:100}, "Sainsbury’s":{price:3.50,pack:100}, Tesco:{price:3.80,pack:100}, Morrisons:{price:3.50,pack:100} } },
  eggs: { unit:"egg", pack:6, stores:{ Aldi:{price:0.99}, Lidl:{price:1.29}, Asda:{price:1.75}, "Sainsbury’s":{price:1.80}, Tesco:{price:1.80}, Morrisons:{price:1.80} } },
  "whey protein": { unit:"g", pack:1000, stores:{ Aldi:{price:19.99,pack:500}, Lidl:{price:19.99,pack:500}, Asda:{price:24.00,pack:1000}, "Sainsbury’s":{price:25.00,pack:1000}, Tesco:{price:25.00,pack:1000}, Morrisons:{price:24.00,pack:1000} } },
  "greek yogurt": { unit:"g", pack:500, stores:{ Aldi:{price:1.09,pack:500}, Lidl:{price:1.09,pack:500}, Asda:{price:0.95}, "Sainsbury’s":{price:0.95}, Tesco:{price:0.95}, Morrisons:{price:0.80}, Iceland:{price:1.00} } },
  "cottage cheese": { unit:"g", pack:300, stores:{ Aldi:{price:0.89,pack:300}, Lidl:{price:0.99,pack:300}, Asda:{price:0.87}, "Sainsbury’s":{price:0.90,pack:300}, Tesco:{price:0.85}, Morrisons:{price:0.85} } },
  skyr: { unit:"g", pack:450, stores:{ Aldi:{price:1.49,pack:450}, Lidl:{price:1.49,pack:450}, Asda:{price:1.50}, "Sainsbury’s":{price:1.25}, Tesco:{price:2.50}, Morrisons:{price:2.50} } },
  milk: { unit:"ml", pack:1136, stores:{ Aldi:{price:1.20}, Lidl:{price:1.20}, Asda:{price:2.34}, "Sainsbury’s":{price:1.20}, Tesco:{price:1.20}, Morrisons:{price:1.20} } },
  oats: { unit:"g", pack:1000, stores:{ Aldi:{price:0.85}, Lidl:{price:0.85}, Asda:{price:0.85}, "Sainsbury’s":{price:0.90,pack:1000}, Tesco:{price:0.85}, Morrisons:{price:0.90,pack:1000} } },
  rice: { unit:"g", pack:1000, stores:{ Aldi:{price:1.79,pack:1000}, Lidl:{price:1.79,pack:1000}, Asda:{price:1.80}, "Sainsbury’s":{price:1.79}, Tesco:{price:1.79}, Morrisons:{price:1.79}, Iceland:{price:2.00} } },
  "basmati rice": { unit:"g", pack:1000, stores:{ Aldi:{price:1.79}, Lidl:{price:1.79}, Asda:{price:1.80}, "Sainsbury’s":{price:1.79}, Tesco:{price:1.79}, Morrisons:{price:1.79}, Iceland:{price:2.00} } },
  quinoa: { unit:"g", pack:300, stores:{ Aldi:{price:2.99,pack:300}, Lidl:{price:2.99,pack:300}, Asda:{price:3.00,pack:300}, "Sainsbury’s":{price:3.25,pack:300}, Tesco:{price:3.10,pack:300}, Morrisons:{price:3.25,pack:300} } },
  potatoes: { unit:"g", pack:2000, stores:{ Aldi:{price:1.49,pack:2500}, Lidl:{price:1.49,pack:2500}, Asda:{price:1.50,pack:2500}, "Sainsbury’s":{price:1.50,pack:2500}, Tesco:{price:1.32,pack:2000}, Morrisons:{price:1.50,pack:2500} } },
  "sweet potatoes": { unit:"g", pack:1000, stores:{ Aldi:{price:1.49}, Lidl:{price:1.49}, Asda:{price:1.50}, "Sainsbury’s":{price:1.50}, Tesco:{price:1.19}, Morrisons:{price:1.50} } },
  "wholegrain bread": { unit:"slice", pack:16, stores:{ Aldi:{price:0.75,pack:16}, Lidl:{price:0.85,pack:16}, Asda:{price:0.75,pack:16}, "Sainsbury’s":{price:0.80,pack:16}, Tesco:{price:0.75,pack:16}, Morrisons:{price:0.75,pack:16} } },
  "wholegrain wraps": { unit:"wrap", pack:8, stores:{ Aldi:{price:1.35,pack:8}, Lidl:{price:1.39,pack:8}, Asda:{price:1.30,pack:8}, "Sainsbury’s":{price:1.30,pack:8}, Tesco:{price:1.40,pack:8}, Morrisons:{price:1.35,pack:8} } },
  "mixed berries": { unit:"g", pack:1000, stores:{ Aldi:{price:3.49,pack:500}, Lidl:{price:3.49,pack:500}, Asda:{price:3.00,pack:500}, "Sainsbury’s":{price:3.00,pack:500}, Tesco:{price:2.99,pack:1000}, Morrisons:{price:3.00,pack:500} } },
  banana: { unit:"each", pack:1, stores:{ Aldi:{price:0.15}, Lidl:{price:0.15}, Asda:{price:0.15}, "Sainsbury’s":{price:0.18}, Tesco:{price:0.16}, Morrisons:{price:0.15} } },
  apple: { unit:"each", pack:1, stores:{ Aldi:{price:0.30}, Lidl:{price:0.30}, Asda:{price:0.30}, "Sainsbury’s":{price:0.35}, Tesco:{price:0.36}, Morrisons:{price:0.30} } },
  pear: { unit:"each", pack:1, stores:{ Aldi:{price:0.35}, Lidl:{price:0.35}, Asda:{price:0.40}, "Sainsbury’s":{price:0.40}, Tesco:{price:0.46}, Morrisons:{price:0.40} } },
  avocado: { unit:"each", pack:1, stores:{ Aldi:{price:0.79}, Lidl:{price:0.79}, Asda:{price:0.80}, "Sainsbury’s":{price:0.85}, Tesco:{price:0.69}, Morrisons:{price:0.80} } },
  spinach: { unit:"g", pack:500, stores:{ Aldi:{price:1.49,pack:400}, Lidl:{price:1.49,pack:400}, Asda:{price:1.50,pack:500}, "Sainsbury’s":{price:1.50,pack:500}, Tesco:{price:1.77,pack:500}, Morrisons:{price:1.50,pack:500} } },
  broccoli: { unit:"g", pack:500, stores:{ Aldi:{price:0.89,pack:500}, Lidl:{price:0.89,pack:500}, Asda:{price:0.90,pack:500}, "Sainsbury’s":{price:0.90,pack:500}, Tesco:{price:0.90,pack:500}, Morrisons:{price:0.90,pack:500} } },
  "green beans": { unit:"g", pack:220, stores:{ Aldi:{price:1.29,pack:200}, Lidl:{price:1.29,pack:200}, Asda:{price:1.50,pack:220}, "Sainsbury’s":{price:1.50,pack:220}, Tesco:{price:0.85,pack:220}, Morrisons:{price:1.50,pack:220} } },
  "salad leaves": { unit:"g", pack:100, stores:{ Aldi:{price:1.19,pack:100}, Lidl:{price:1.19,pack:100}, Asda:{price:1.20,pack:100}, "Sainsbury’s":{price:1.20,pack:100}, Tesco:{price:1.20,pack:100}, Morrisons:{price:1.20,pack:100} } },
  tomatoes: { unit:"each", pack:1, stores:{ Aldi:{price:0.30}, Lidl:{price:0.30}, Asda:{price:0.30}, "Sainsbury’s":{price:0.30}, Tesco:{price:0.99}, Morrisons:{price:0.30} } },
  "mixed vegetables": { unit:"g", pack:1000, stores:{ Aldi:{price:1.49,pack:1000}, Lidl:{price:1.49,pack:1000}, Asda:{price:1.50,pack:1000}, "Sainsbury’s":{price:1.50,pack:1000}, Tesco:{price:1.65,pack:1000}, Morrisons:{price:1.50,pack:1000} } },
  "stir-fry vegetables": { unit:"g", pack:750, stores:{ Aldi:{price:1.49,pack:750}, Lidl:{price:1.49,pack:750}, Asda:{price:1.50,pack:750}, "Sainsbury’s":{price:1.50,pack:750}, Tesco:{price:1.50,pack:750}, Morrisons:{price:1.50,pack:750} } },
  peppers: { unit:"each", pack:1, stores:{ Aldi:{price:0.50}, Lidl:{price:0.50}, Asda:{price:0.50}, "Sainsbury’s":{price:0.50}, Tesco:{price:1.50}, Morrisons:{price:0.50} } },
  onions: { unit:"each", pack:1, stores:{ Aldi:{price:0.15}, Lidl:{price:0.15}, Asda:{price:0.15}, "Sainsbury’s":{price:0.15}, Tesco:{price:0.11}, Morrisons:{price:0.15} } },
  almonds: { unit:"g", pack:250, stores:{ Aldi:{price:2.49,pack:200}, Lidl:{price:2.49,pack:200}, Asda:{price:2.50,pack:200}, "Sainsbury’s":{price:2.75,pack:200}, Tesco:{price:2.75,pack:250}, Morrisons:{price:2.50,pack:200} } },
  "peanut butter": { unit:"g", pack:340, stores:{ Aldi:{price:0.95,pack:340}, Lidl:{price:0.99,pack:340}, Asda:{price:0.97,pack:340}, "Sainsbury’s":{price:0.95,pack:340}, Tesco:{price:0.90,pack:340}, Morrisons:{price:1.25,pack:340} } },
  "chia seeds": { unit:"g", pack:150, stores:{ Aldi:{price:1.49,pack:200}, Lidl:{price:1.49,pack:200}, Asda:{price:1.80,pack:200}, "Sainsbury’s":{price:1.80,pack:200}, Tesco:{price:1.80,pack:150}, Morrisons:{price:1.80,pack:200} } },
  "pumpkin seeds": { unit:"g", pack:150, stores:{ Aldi:{price:1.49,pack:200}, Lidl:{price:1.49,pack:200}, Asda:{price:1.80,pack:200}, "Sainsbury’s":{price:1.80,pack:200}, Tesco:{price:1.80,pack:150}, Morrisons:{price:1.80,pack:200} } },
  "sesame oil": { unit:"ml", pack:250, stores:{ Aldi:{price:2.49,pack:250}, Lidl:{price:2.49,pack:250}, Asda:{price:2.50,pack:250}, "Sainsbury’s":{price:2.50,pack:250}, Tesco:{price:2.65,pack:250}, Morrisons:{price:2.50,pack:250} } },
  "olive oil": { unit:"ml", pack:500, stores:{ Aldi:{price:4.49,pack:500}, Lidl:{price:5.99,pack:500}, Asda:{price:4.30,pack:500}, "Sainsbury’s":{price:4.65,pack:500}, Tesco:{price:4.75,pack:500}, Morrisons:{price:6.00,pack:500} } },
  honey: { unit:"g", pack:340, stores:{ Aldi:{price:1.19,pack:340}, Lidl:{price:1.29,pack:340}, Asda:{price:1.20,pack:340}, "Sainsbury’s":{price:1.20,pack:340}, Tesco:{price:1.19,pack:340}, Morrisons:{price:1.25,pack:340} } },
  hummus: { unit:"g", pack:200, stores:{ Aldi:{price:1.19,pack:200}, Lidl:{price:1.19,pack:200}, Asda:{price:1.20,pack:200}, "Sainsbury’s":{price:1.20,pack:200}, Tesco:{price:1.30,pack:200}, Morrisons:{price:1.20,pack:200} } },
};

const ALIASES = [
  ["turkey slices","turkey slices"],["smoked salmon","smoked salmon"],["turkey mince","turkey mince"],["chicken breast","chicken breast"],["chicken","chicken breast"],
  ["lean beef","beef mince"],["beef mince","beef mince"],["beef","beef mince"],["salmon","salmon"],["tuna","tuna"],["cod","cod"],["whey protein","whey protein"],["whey","whey protein"],
  ["egg","eggs"],["eggs","eggs"],["greek yogurt","greek yogurt"],["greek yoghurt","greek yogurt"],["cottage cheese","cottage cheese"],["skyr","skyr"],["milk","milk"],
  ["oats","oats"],["brown rice","rice"],["basmati rice","basmati rice"],["rice","rice"],["quinoa","quinoa"],["baby potatoes","potatoes"],["potatoes","potatoes"],["sweet potato","sweet potatoes"],
  ["wholegrain bread","wholegrain bread"],["wholemeal bread","wholegrain bread"],["toast","wholegrain bread"],["wholegrain wrap","wholegrain wraps"],["wrap","wholegrain wraps"],["hummus","hummus"],["houmous","hummus"],
  ["mixed berries","mixed berries"],["berries","mixed berries"],["berry","mixed berries"],["banana","banana"],["apple","apple"],["pear","pear"],["avocado","avocado"],
  ["spinach","spinach"],["broccoli","broccoli"],["green beans","green beans"],["salad leaves","salad leaves"],["tomato","tomatoes"],["mixed vegetables","mixed vegetables"],["stir-fry","stir-fry vegetables"],
  ["pepper","peppers"],["onion","onions"],["almonds","almonds"],["peanut butter","peanut butter"],["chia","chia seeds"],["pumpkin seeds","pumpkin seeds"],["sesame oil","sesame oil"],["olive oil","olive oil"],["honey","honey"]
];

function normaliseKey(value) {
  const n = String(value || "").trim().toLowerCase();
  const exact = ALIASES.find(([needle]) => n === needle);
  if (exact) return exact[1];
  const found = ALIASES.find(([needle]) => n.includes(needle));
  return found ? found[1] : null;
}

function toBaseAmount(amount, unit, catalogUnit, catalogPack) {
  const value = Number(amount); if (!Number.isFinite(value)) return null;
  const u = String(unit || "").toLowerCase();
  if (catalogUnit === "g") {
    if (u === "kg") return value * 1000;
    if (u === "g") return value;
    if (u === "portion") return value * Number(catalogPack || 1);
    return null;
  }
  if (catalogUnit === "ml") {
    if (u === "l") return value * 1000;
    if (u === "ml") return value;
    if (u === "tbsp") return value * 15;
    if (u === "tsp") return value * 5;
    if (u === "portion") return value * Number(catalogPack || 1);
    return null;
  }
  if (["egg","each","wrap","slice"].includes(catalogUnit)) return value;
  return value;
}

export function expandStorePriceMatch(item) {
  const key = normaliseKey(item?.priceMatch?.key || item?.name);
  const catalog = key ? STORE_PRICES[key] : null;
  if (!catalog) return item;
  const required = toBaseAmount(item?.priceMatch?.required ?? item?.amount, item?.priceMatch?.unit ?? item?.unit, catalog.unit, catalog.pack);
  if (!Number.isFinite(required)) return item;
  const offers = Object.entries(catalog.stores || {}).map(([store,spec]) => {
    const pack = Number(spec.pack || catalog.pack); const packPrice = Number(spec.price); const packs = Math.max(1, Math.ceil(required / pack));
    return { store, packs, total:Number((packs * packPrice).toFixed(2)), packPrice:Number(packPrice.toFixed(2)), pack, unit:catalog.unit, source:src, checkedAt:D };
  });
  if (!offers.length) return item;
  const existing = item?.priceMatch?.offers || []; const merged = new Map(existing.map(offer => [offer.store, offer])); offers.forEach(offer => merged.set(offer.store, offer));
  const allOffers = Array.from(merged.values()); const cheapest = allOffers.slice().sort((a,b) => a.total - b.total)[0] || null;
  return { ...item, priceMatch:{ ...(item.priceMatch || {}), key, required, offers:allOffers, cheapest, productMatch:true, source:src, checkedAt:D } };
}

export function getStorePriceCatalog() { return STORE_PRICES; }
export function getStorePriceDatabaseStats() {
  const families = Object.keys(STORE_PRICES); const priced = families.filter(key => Object.keys(STORE_PRICES[key].stores || {}).length);
  return { families:families.length, pricedFamilies:priced.length, pendingFamilies:families.length-priced.length, stores:["Aldi","Lidl","Asda","Sainsbury’s","Tesco","Morrisons"] };
}
