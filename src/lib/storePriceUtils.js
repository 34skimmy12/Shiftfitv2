// Verified public UK supermarket price snapshots used to expand Smart Basket comparisons.
// Prices are dated and can change; blank stores mean no verified comparable pack was found.

const STORE_PRICES = {
  "chicken breast": {
    unit: "g", pack: 1000,
    stores: { Aldi: 1.99, Lidl: 4.99, Asda: 2.33, "Sainsbury’s": 2.00, Tesco: 2.44, Morrisons: 2.49 },
    source: "Basketr + Lidl GB public prices", checkedAt: "8 Sep 2026",
  },
  "beef mince": {
    unit: "g", pack: 500,
    stores: { Lidl: 5.49 * (500 / 800), Asda: 3.25, "Sainsbury’s": 3.09, Tesco: 2.40, Morrisons: 5.05 },
    source: "Basketr + Lidl GB public prices", checkedAt: "8 Sep 2026",
  },
  eggs: {
    unit: "egg", pack: 6,
    stores: { Aldi: 0.99, Asda: 1.75, "Sainsbury’s": 1.80, Tesco: 1.80, Morrisons: 1.80 },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  milk: {
    unit: "ml", pack: 1136,
    stores: { Aldi: 1.20, Asda: 2.34, "Sainsbury’s": 1.65, Tesco: 1.20, Morrisons: 1.20 },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  "basmati rice": {
    unit: "g", pack: 1000,
    stores: { Asda: 1.80, "Sainsbury’s": 1.79, Tesco: 1.79, Morrisons: 1.79 },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  "olive oil": {
    unit: "ml", pack: 500,
    stores: { Lidl: 5.99, Asda: 4.30, "Sainsbury’s": 4.65, Tesco: 4.75, Morrisons: 6.00 },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  skyr: {
    unit: "g", pack: 450,
    stores: { Asda: 1.50, "Sainsbury’s": 1.25, Tesco: 2.50, Morrisons: 2.50 },
    source: "Basketr exact-product comparison", checkedAt: "8 Sep 2026",
  },
  "peanut butter": {
    unit: "g", pack: 340,
    stores: { Aldi: 0.95, Asda: 1.80, Tesco: 1.80 },
    source: "Basketr exact-product comparison", checkedAt: "8 Sep 2026",
  },
  honey: {
    unit: "g", pack: 340,
    stores: { Asda: 2.48, "Sainsbury’s": 3.75, Tesco: 3.00, Morrisons: 3.00 },
    source: "Basketr exact-product comparison", checkedAt: "8 Sep 2026",
  },
};

function normaliseKey(value) {
  const n = String(value || "").trim().toLowerCase();
  if (n.includes("chicken")) return "chicken breast";
  if (n.includes("beef") && n.includes("mince")) return "beef mince";
  if (n === "egg" || n === "eggs") return "eggs";
  if (n === "milk") return "milk";
  if (n.includes("basmati") || n === "rice") return "basmati rice";
  if (n.includes("olive oil")) return "olive oil";
  if (n.includes("skyr")) return "skyr";
  if (n.includes("peanut butter")) return "peanut butter";
  if (n.includes("honey")) return "honey";
  return null;
}

function toBaseAmount(amount, unit, catalogUnit) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  const u = String(unit || "").toLowerCase();
  if (catalogUnit === "g") {
    if (u === "kg") return value * 1000;
    if (u === "g") return value;
    return null;
  }
  if (catalogUnit === "ml") {
    if (u === "l") return value * 1000;
    if (u === "ml") return value;
    if (u === "tbsp") return value * 15;
    if (u === "tsp") return value * 5;
    return null;
  }
  if (catalogUnit === "egg") return value;
  return value;
}

export function expandStorePriceMatch(item, fallbackStores = []) {
  const key = normaliseKey(item?.priceMatch?.key || item?.name);
  const catalog = key ? STORE_PRICES[key] : null;
  if (!catalog) return item;

  const required = toBaseAmount(item?.priceMatch?.required ?? item?.amount, item?.priceMatch?.unit ?? item?.unit, catalog.unit);
  if (!Number.isFinite(required)) return item;

  const stores = catalog.stores || {};
  const offers = Object.entries(stores).map(([store, packPrice]) => {
    const packs = Math.max(1, Math.ceil(required / catalog.pack));
    return {
      store,
      packs,
      total: Number((packs * packPrice).toFixed(2)),
      packPrice: Number(packPrice.toFixed(2)),
      pack: catalog.pack,
      unit: catalog.unit,
      source: catalog.source,
      checkedAt: catalog.checkedAt,
    };
  });

  const existing = item?.priceMatch?.offers || [];
  const merged = new Map(existing.map(offer => [offer.store, offer]));
  offers.forEach(offer => merged.set(offer.store, offer));
  const allOffers = Array.from(merged.values());
  const cheapest = allOffers.slice().sort((a, b) => a.total - b.total)[0] || null;

  return {
    ...item,
    priceMatch: {
      ...(item.priceMatch || {}),
      key,
      required,
      offers: allOffers,
      cheapest,
      productMatch: true,
      source: catalog.source,
      checkedAt: catalog.checkedAt,
    },
  };
}

export function getStorePriceCatalog() {
  return STORE_PRICES;
}
