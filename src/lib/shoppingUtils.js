// Turn personalised meal-plan ingredients into a practical UK shopping basket.

function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function parseFraction(value) {
  const text = String(value).trim();
  if (/^\d+\/\d+$/.test(text)) {
    const [a, b] = text.split("/").map(Number);
    return b ? a / b : null;
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function singularise(value) {
  const text = cleanName(value);
  const lower = text.toLowerCase();
  const aliases = {
    egg: "eggs", eggs: "eggs", berry: "mixed berries", berries: "mixed berries",
    chicken: "chicken breast", "chicken breast": "chicken breast",
    "spinach leaves": "spinach", "salad leaves": "salad leaves",
    "mixed stir-fry vegetables": "mixed stir-fry vegetables", "mixed vegetables": "mixed vegetables",
    "baby potato": "baby potatoes", "baby potatoes": "baby potatoes",
    potato: "potatoes", potatoes: "potatoes", almond: "almonds", almonds: "almonds",
    peanut: "peanut butter", "peanut butter": "peanut butter",
    "greek yoghurt": "greek yogurt", "greek yogurt": "greek yogurt",
    yoghurt: "yogurt", yogurt: "yogurt",
  };
  return aliases[lower] || text;
}

function parseIngredient(raw) {
  const text = cleanName(raw);
  const match = text.match(/^(.+?)\s+(\d+(?:\.\d+)?(?:\/\d+)?)\s*(kg|g|l|ml|slices?|eggs?|scoop(?:s)?|tbsp|tsp)$/i);
  if (match) {
    const rawUnit = match[3].toLowerCase();
    const unit = rawUnit.startsWith("slice") ? "slice" : rawUnit.startsWith("scoop") ? "scoop" : rawUnit.startsWith("egg") ? "egg" : rawUnit;
    return { name: singularise(match[1]), amount: parseFraction(match[2]), unit };
  }
  const count = text.match(/^(.+?)\s+(\d+(?:\.\d+)?(?:\/\d+)?)$/i);
  if (count) return { name: singularise(count[1]), amount: parseFraction(count[2]), unit: "portion" };
  return { name: singularise(text), amount: 1, unit: "portion" };
}

function unitKey(unit) {
  if (["slice", "slices"].includes(unit)) return "slice";
  if (["scoop", "scoops"].includes(unit)) return "scoop";
  if (["egg", "eggs"].includes(unit)) return "egg";
  return unit;
}

function formatAmount(amount, unit) {
  const rounded = Math.round(amount * 100) / 100;
  if (unit === "g" && rounded >= 1000) return `${Math.round((rounded / 1000) * 100) / 100} kg`;
  if (unit === "ml" && rounded >= 1000) return `${Math.round((rounded / 1000) * 100) / 100} L`;
  if (unit === "portion") return `${rounded} ${rounded === 1 ? "portion" : "portions"}`;
  if (unit === "egg") return `${rounded} ${rounded === 1 ? "egg" : "eggs"}`;
  if (unit === "slice") return `${rounded} ${rounded === 1 ? "slice" : "slices"}`;
  if (unit === "scoop") return `${rounded} ${rounded === 1 ? "scoop" : "scoops"}`;
  if (!unit) return `${rounded}`;
  return `${rounded} ${unit}`;
}

function categoryFor(name) {
  const n = name.toLowerCase();
  if (/(chicken|salmon|turkey|beef|tuna|cod|egg|whey|cottage cheese|greek yogurt|yogurt|skyr)/.test(n)) return "Protein";
  if (/(broccoli|spinach|pepper|onion|berry|berries|pear|apple|avocado|tomato|green beans|vegetable|salad|greens|stir-fry)/.test(n)) return "Produce";
  if (/(milk|cheese|hummus|honey)/.test(n)) return "Dairy";
  if (/(rice|oats|quinoa|toast|wrap|granola|bread|chia|potato)/.test(n)) return "Grains";
  if (/(oil|almond|peanut|sesame|seed)/.test(n)) return "Pantry";
  return "Other";
}

// Current UK public-price snapshot gathered 8 Sep 2026. These are indicative
// own-brand/unit-price matches, not guaranteed store checkout totals.
const PRICE_CATALOG = {
  "chicken breast": {
    unit: "g", pack: 1000,
    stores: { Aldi: 4.25, Asda: 5.20, Morrisons: 4.25, "Sainsbury’s": 5.00, Tesco: 6.69 },
    source: "Aldi/UK price comparison snapshot",
  },
  "turkey mince": {
    unit: "g", pack: 500,
    stores: { Aldi: 2.99, "Sainsbury’s": 3.95, Tesco: 4.40 },
    source: "Aldi and current supermarket comparison snapshot",
  },
  "greek yogurt": {
    unit: "g", pack: 1000,
    stores: { Aldi: 1.49, Asda: 1.90, Tesco: 1.70 },
    source: "Current UK supermarket comparison snapshot",
  },
  oats: {
    unit: "g", pack: 1000,
    stores: { Aldi: 0.85, Asda: 0.85, Tesco: 0.85 },
    source: "Current UK supermarket comparison snapshot",
  },
  "salmon": {
    unit: "g", pack: 350,
    stores: { Aldi: 4.19, Asda: 4.19 },
    source: "Current UK salmon comparison snapshot",
  },
  "beef mince": {
    unit: "g", pack: 500,
    stores: { Tesco: 2.40, Iceland: 2.50, "Sainsbury’s": 3.09, Asda: 3.25, Morrisons: 5.05 },
    source: "Current UK supermarket comparison snapshot",
  },
  eggs: {
    unit: "egg", pack: 6,
    stores: { Aldi: 0.99, Asda: 1.75, Morrisons: 1.80, "Sainsbury’s": 1.80, Tesco: 1.80 },
    source: "Current UK supermarket comparison snapshot",
  },
  milk: {
    unit: "ml", pack: 1136,
    stores: { Aldi: 1.20, Asda: 1.20, Morrisons: 1.20, "Sainsbury’s": 1.20, Tesco: 1.20 },
    source: "Current UK supermarket comparison snapshot",
  },
  "basmati rice": {
    unit: "g", pack: 1000,
    stores: { Morrisons: 1.79, "Sainsbury’s": 1.79, Tesco: 1.79, Asda: 1.80, Iceland: 2.00 },
    source: "Current UK supermarket comparison snapshot",
  },
  avocado: {
    unit: "portion", pack: 1,
    stores: { Tesco: 0.69 },
    source: "Tesco current public grocery price",
  },
};

function priceKey(name) {
  const n = cleanName(name).toLowerCase();
  if (n.includes("chicken breast")) return "chicken breast";
  if (n.includes("turkey")) return "turkey mince";
  if (n.includes("greek yogurt")) return "greek yogurt";
  if (n === "oats" || n.includes("oats")) return "oats";
  if (n.includes("salmon")) return "salmon";
  if (n.includes("beef") && n.includes("mince")) return "beef mince";
  if (n === "eggs") return "eggs";
  if (n === "milk") return "milk";
  if (n.includes("basmati rice") || n === "rice") return "basmati rice";
  if (n.includes("avocado")) return "avocado";
  return null;
}

function quantityInCatalogUnits(item, catalog) {
  if (catalog.unit === "g" && item.unit === "kg") return item.amount * 1000;
  if (catalog.unit === "g" && item.unit === "g") return item.amount;
  if (catalog.unit === "ml" && item.unit === "l") return item.amount * 1000;
  if (catalog.unit === "ml" && item.unit === "ml") return item.amount;
  if (catalog.unit === "egg" && item.unit === "egg") return item.amount;
  if (catalog.unit === "portion" && item.unit === "portion") return item.amount;
  return null;
}

export function generateSmartBasket(mealPlans) {
  const aggregate = new Map();
  (mealPlans || []).forEach((plan) => {
    (plan.meals || []).forEach((meal) => {
      (meal.items || []).forEach((raw) => {
        const parsed = parseIngredient(raw);
        const unit = unitKey(parsed.unit);
        const key = `${parsed.name.toLowerCase()}|${unit}`;
        const existing = aggregate.get(key);
        if (existing) existing.amount += parsed.amount;
        else aggregate.set(key, { ...parsed, unit });
      });
    });
  });

  return Array.from(aggregate.values())
    .sort((a, b) => categoryFor(a.name).localeCompare(categoryFor(b.name)) || a.name.localeCompare(b.name))
    .map((item) => ({
      name: item.name,
      category: categoryFor(item.name),
      quantity: formatAmount(item.amount, item.unit),
      checked: false,
    }));
}

export function getBasketPriceComparison(items) {
  return (items || []).map((item) => {
    const key = priceKey(item.name);
    const catalog = key ? PRICE_CATALOG[key] : null;
    if (!catalog) return { ...item, priceMatch: null };

    const required = quantityInCatalogUnits(item, catalog);
    if (required == null) return { ...item, priceMatch: null };

    const offers = Object.entries(catalog.stores).map(([store, packPrice]) => {
      const packs = Math.max(1, Math.ceil(required / catalog.pack));
      return { store, packs, total: Number((packs * packPrice).toFixed(2)), packPrice, pack: catalog.pack, unit: catalog.unit };
    }).sort((a, b) => a.total - b.total);

    return {
      ...item,
      priceMatch: {
        key,
        required,
        offers,
        cheapest: offers[0] || null,
        source: catalog.source,
        checkedAt: "8 Sep 2026",
      },
    };
  });
}
