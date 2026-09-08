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
    chicken: "chicken breast", "chicken breast": "chicken breast", "lean chicken": "chicken breast",
    "lean beef": "beef mince", "beef mince": "beef mince",
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
  if (count) {
    const name = singularise(count[1]);
    const unit = name === "eggs" ? "egg" : "portion";
    return { name, amount: parseFraction(count[2]), unit };
  }

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

// UK public-price snapshot refreshed 8 Sep 2026. Prices are indicative public
// pack prices, not guaranteed checkout totals; loyalty/promotional prices may differ.
const PRICE_CATALOG = {
  "chicken breast": { unit: "g", pack: 1000, stores: { Aldi: 4.25, Asda: 5.20, Morrisons: 4.25, "Sainsbury’s": 5.00, Tesco: 6.69 }, source: "Current UK supermarket public price snapshot" },
  "turkey mince": { unit: "g", pack: 500, stores: { Aldi: 2.99, "Sainsbury’s": 3.95, Tesco: 4.40 }, source: "Current UK supermarket public price snapshot" },
  "turkey slices": { unit: "g", pack: 100, stores: { Tesco: 1.90 }, source: "Tesco public product price" },
  "greek yogurt": { unit: "g", pack: 1000, stores: { Aldi: 1.49, Asda: 1.90, Tesco: 1.70 }, source: "Current UK supermarket public price snapshot" },
  skyr: { unit: "g", pack: 450, stores: { Tesco: 2.50 }, source: "Tesco public product price" },
  oats: { unit: "g", pack: 1000, stores: { Aldi: 0.85, Asda: 0.85, Tesco: 0.85 }, source: "Current UK supermarket public price snapshot" },
  salmon: { unit: "g", pack: 350, stores: { Aldi: 4.19, Asda: 4.19, Tesco: 5.95 }, source: "Current UK supermarket public price snapshot" },
  "smoked salmon": { unit: "g", pack: 100, stores: { Tesco: 3.80 }, source: "Tesco public product price" },
  "beef mince": { unit: "g", pack: 500, stores: { Tesco: 2.40, Iceland: 2.50, "Sainsbury’s": 3.09, Asda: 3.25, Morrisons: 5.05 }, source: "Current UK supermarket public price snapshot" },
  eggs: { unit: "egg", pack: 6, stores: { Aldi: 0.99, Asda: 1.75, Morrisons: 1.80, "Sainsbury’s": 1.80, Tesco: 1.80 }, source: "Current UK supermarket public price snapshot" },
  milk: { unit: "ml", pack: 1136, stores: { Aldi: 1.20, Asda: 1.20, Morrisons: 1.20, "Sainsbury’s": 1.20, Tesco: 1.20 }, source: "Current UK supermarket public price snapshot" },
  "brown rice": { unit: "g", pack: 1000, stores: { Tesco: 1.39 }, source: "Tesco public product price" },
  "basmati rice": { unit: "g", pack: 1000, stores: { Morrisons: 1.79, "Sainsbury’s": 1.79, Tesco: 1.79, Asda: 1.80, Iceland: 2.00 }, source: "Current UK supermarket public price snapshot" },
  avocado: { unit: "portion", pack: 1, stores: { Tesco: 0.69 }, source: "Tesco public grocery price" },
  "cottage cheese": { unit: "g", pack: 300, stores: { Tesco: 0.85 }, source: "Tesco public product price" },
  spinach: { unit: "portion", pack: 1, stores: { Tesco: 1.77 }, source: "Tesco public product price; 500g pack" },
  broccoli: { unit: "portion", pack: 1, stores: { Tesco: 0.90 }, source: "Tesco public product price; 375g pack" },
  "sweet potato": { unit: "g", pack: 1000, stores: { Tesco: 1.19 }, source: "Tesco public product price" },
  "baby potatoes": { unit: "g", pack: 2000, stores: { Tesco: 1.32 }, source: "Tesco public product price; 2kg potatoes family" },
  potatoes: { unit: "g", pack: 2000, stores: { Tesco: 1.32 }, source: "Tesco public product price" },
  quinoa: { unit: "g", pack: 300, stores: { Tesco: 3.10 }, source: "Tesco public product price" },
  "green beans": { unit: "portion", pack: 1, stores: { Tesco: 0.85 }, source: "Tesco public product price; 220g pack" },
  tuna: { unit: "g", pack: 110, stores: { Tesco: 1.40 }, source: "Tesco public product price snapshot" },
  cod: { unit: "g", pack: 280, stores: { Tesco: 8.15 }, source: "Tesco public product price; Clubcard price may differ" },
  "mixed berries": { unit: "g", pack: 1000, stores: { Tesco: 2.99 }, source: "Tesco public product price" },
  almonds: { unit: "g", pack: 250, stores: { Tesco: 2.75 }, source: "Tesco public product price" },
  "olive oil": { unit: "ml", pack: 500, stores: { Tesco: 5.75 }, source: "Tesco public product price" },
  "sesame oil": { unit: "ml", pack: 250, stores: { Tesco: 2.65 }, source: "Current UK public supermarket price comparison" },
  "chia seeds": { unit: "g", pack: 150, stores: { Tesco: 1.80 }, source: "Tesco public product price" },
  "pumpkin seeds": { unit: "g", pack: 150, stores: { Tesco: 1.80 }, source: "Tesco public product price" },
  banana: { unit: "portion", pack: 1, stores: { Tesco: 0.16 }, source: "Tesco public grocery price; loose banana" },
  pear: { unit: "portion", pack: 1, stores: { Tesco: 0.46 }, source: "Tesco public grocery price; derived from 4-pack public price" },
  apple: { unit: "portion", pack: 1, stores: { Tesco: 0.36 }, source: "Tesco public grocery price; derived from 5-pack public price" },
  "wholegrain toast": { unit: "slice", pack: 16, stores: { Tesco: 0.75 }, source: "Tesco public product price; 800g wholemeal bread" },
  "wholegrain wrap": { unit: "portion", pack: 8, stores: { Tesco: 1.40 }, source: "Tesco public product price; 8 pack" },
  hummus: { unit: "g", pack: 200, stores: { Tesco: 1.30 }, source: "Tesco public product price" },
  "salad leaves": { unit: "portion", pack: 1, stores: { Tesco: 1.20 }, source: "Tesco public product price; 120g mixed leaf salad" },
  tomato: { unit: "portion", pack: 1, stores: { Tesco: 0.99 }, source: "Tesco public product price; 6-pack" },
  "mixed vegetables": { unit: "portion", pack: 1, stores: { Tesco: 1.65 }, source: "Tesco public product price; 1kg pack" },
  "mixed stir-fry vegetables": { unit: "portion", pack: 1, stores: { Tesco: 1.50 }, source: "Current UK public supermarket product price" },
  "peppers & onion": { unit: "portion", pack: 1, stores: { Tesco: 1.50 }, source: "Current UK public supermarket product snapshot" },
  "peanut butter": { unit: "g", pack: 340, stores: { Tesco: 1.80 }, source: "Tesco public product price" },
  honey: { unit: "portion", pack: 1, stores: { Tesco: 0.99 }, source: "Tesco public product price; 340g honey pack" },
  "whey protein": { unit: "scoop", pack: 20, stores: { Tesco: 25.00 }, source: "Tesco public protein powder price snapshot; pack-size normalised to 20 servings" },
};

function priceKey(name) {
  const n = cleanName(name).toLowerCase();
  if (n.includes("smoked salmon")) return "smoked salmon";
  if (n.includes("salmon")) return "salmon";
  if (n.includes("turkey slices") || n.includes("turkey breast")) return "turkey slices";
  if (n.includes("turkey")) return "turkey mince";
  if (n.includes("chicken breast") || n === "chicken") return "chicken breast";
  if (n.includes("greek yogurt")) return "greek yogurt";
  if (n.includes("skyr")) return "skyr";
  if (n.includes("cottage cheese")) return "cottage cheese";
  if (n.includes("whey")) return "whey protein";
  if (n === "oats" || n.includes("oats")) return "oats";
  if (n.includes("beef") && n.includes("mince")) return "beef mince";
  if (n === "eggs" || n === "egg") return "eggs";
  if (n === "milk") return "milk";
  if (n.includes("brown rice")) return "brown rice";
  if (n.includes("basmati rice") || n === "rice") return "basmati rice";
  if (n.includes("avocado")) return "avocado";
  if (n.includes("sweet potato")) return "sweet potato";
  if (n.includes("baby potato")) return "baby potatoes";
  if (n === "potatoes" || n.includes("potato")) return "potatoes";
  if (n.includes("quinoa")) return "quinoa";
  if (n.includes("green beans")) return "green beans";
  if (n.includes("tuna")) return "tuna";
  if (n.includes("cod")) return "cod";
  if (n.includes("berry") || n.includes("berries")) return "mixed berries";
  if (n.includes("almond")) return "almonds";
  if (n.includes("olive oil")) return "olive oil";
  if (n.includes("sesame oil")) return "sesame oil";
  if (n.includes("chia")) return "chia seeds";
  if (n.includes("pumpkin seed")) return "pumpkin seeds";
  if (n === "banana") return "banana";
  if (n === "pear") return "pear";
  if (n === "apple") return "apple";
  if (n.includes("wholegrain toast") || n.includes("wholegrain bread") || n === "toast") return "wholegrain toast";
  if (n.includes("wholegrain wrap") || n === "wrap") return "wholegrain wrap";
  if (n.includes("hummus") || n.includes("houmous")) return "hummus";
  if (n.includes("salad leaves")) return "salad leaves";
  if (n === "tomato" || n.includes("tomato")) return "tomato";
  if (n.includes("stir-fry")) return "mixed stir-fry vegetables";
  if (n.includes("mixed vegetables")) return "mixed vegetables";
  if (n.includes("peppers") && n.includes("onion")) return "peppers & onion";
  if (n.includes("peanut butter")) return "peanut butter";
  if (n.includes("honey")) return "honey";
  return null;
}

function quantityInCatalogUnits(item, catalog) {
  if (catalog.unit === "g" && item.unit === "kg") return item.amount * 1000;
  if (catalog.unit === "g" && item.unit === "g") return item.amount;
  if (catalog.unit === "ml" && item.unit === "l") return item.amount * 1000;
  if (catalog.unit === "ml" && item.unit === "ml") return item.amount;
  if (catalog.unit === "ml" && item.unit === "tbsp") return item.amount * 15;
  if (catalog.unit === "ml" && item.unit === "tsp") return item.amount * 5;
  if (catalog.unit === "egg" && item.unit === "egg") return item.amount;
  if (catalog.unit === "slice" && item.unit === "slice") return item.amount;
  if (catalog.unit === "scoop" && item.unit === "scoop") return item.amount;
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
    .map((item) => ({ name: item.name, category: categoryFor(item.name), quantity: formatAmount(item.amount, item.unit), amount: item.amount, unit: item.unit, checked: false }));
}

export function getBasketPriceComparison(items) {
  return (items || []).map((item) => {
    const key = priceKey(item.name);
    const catalog = key ? PRICE_CATALOG[key] : null;
    if (!catalog) return { ...item, priceMatch: null };

    const sourceItem = item.amount != null && item.unit ? item : parseIngredient(`${item.name} ${String(item.quantity || "")}`.trim());
    const required = quantityInCatalogUnits(sourceItem, catalog);
    if (required == null || !Number.isFinite(required)) return { ...item, priceMatch: null };

    const packs = Math.max(1, Math.ceil(required / catalog.pack));
    const offers = Object.entries(catalog.stores).map(([store, packPrice]) => ({ store, packs, total: Number((packs * packPrice).toFixed(2)), packPrice, pack: catalog.pack, unit: catalog.unit })).sort((a, b) => a.total - b.total);

    return { ...item, priceMatch: { key, required, offers, cheapest: offers[0] || null, source: catalog.source, checkedAt: "8 Sep 2026" } };
  });
}
