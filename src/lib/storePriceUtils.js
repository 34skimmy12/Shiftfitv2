// Verified public UK supermarket price snapshots used to expand Smart Basket comparisons.
// Prices are dated and can change; blank stores mean no verified comparable pack was found.

const STORE_PRICES = {
  "chicken breast": {
    unit: "g", pack: 1000,
    stores: { Aldi: { price: 1.99 }, Lidl: { price: 4.99 }, Asda: { price: 2.33 }, "Sainsbury’s": { price: 2.00 }, Tesco: { price: 2.44 }, Morrisons: { price: 2.49 } },
    source: "Basketr + Lidl GB public prices", checkedAt: "8 Sep 2026",
  },
  "beef mince": {
    unit: "g", pack: 500,
    stores: { Lidl: { price: 5.49, pack: 800 }, Asda: { price: 3.25 }, "Sainsbury’s": { price: 3.09 }, Tesco: { price: 2.40 }, Morrisons: { price: 5.05 } },
    source: "Basketr + Lidl GB public prices", checkedAt: "8 Sep 2026",
  },
  eggs: {
    unit: "egg", pack: 6,
    stores: { Aldi: { price: 0.99 }, Asda: { price: 1.75 }, "Sainsbury’s": { price: 1.80 }, Tesco: { price: 1.80 }, Morrisons: { price: 1.80 } },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  milk: {
    unit: "ml", pack: 1136,
    stores: { Aldi: { price: 1.20 }, Asda: { price: 2.34 }, "Sainsbury’s": { price: 1.65 }, Tesco: { price: 1.20 }, Morrisons: { price: 1.20 } },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  "basmati rice": {
    unit: "g", pack: 1000,
    stores: { Asda: { price: 1.80 }, "Sainsbury’s": { price: 1.79 }, Tesco: { price: 1.79 }, Morrisons: { price: 1.79 } },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  "olive oil": {
    unit: "ml", pack: 500,
    stores: { Lidl: { price: 5.99 }, Asda: { price: 4.30 }, "Sainsbury’s": { price: 4.65 }, Tesco: { price: 4.75 }, Morrisons: { price: 6.00 } },
    source: "Basketr current public comparison", checkedAt: "8 Sep 2026",
  },
  skyr: {
    unit: "g", pack: 450,
    stores: { Asda: { price: 1.50 }, "Sainsbury’s": { price: 1.25 }, Tesco: { price: 2.50 }, Morrisons: { price: 2.50 } },
    source: "Basketr exact-product comparison", checkedAt: "8 Sep 2026",
  },
  "peanut butter": {
    unit: "g", pack: 340,
    stores: { Aldi: { price: 0.95 }, Asda: { price: 1.80 }, Tesco: { price: 1.80 } },
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

export function expandStorePriceMatch(item) {
  const key = normaliseKey(item?.priceMatch?.key || item?.name);
  const catalog = key ? STORE_PRICES[key] : null;
  if (!catalog) return item;

  const required = toBaseAmount(item?.priceMatch?.required ?? item?.amount, item?.priceMatch?.unit ?? item?.unit, catalog.unit);
  if (!Number.isFinite(required)) return item;

  const offers = Object.entries(catalog.stores || {}).map(([store, storeSpec]) => {
    const pack = Number(storeSpec.pack || catalog.pack);
    const packPrice = Number(storeSpec.price);
    const packs = Math.max(1, Math.ceil(required / pack));
    return {
      store,
      packs,
      total: Number((packs * packPrice).toFixed(2)),
      packPrice: Number(packPrice.toFixed(2)),
      pack,
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
