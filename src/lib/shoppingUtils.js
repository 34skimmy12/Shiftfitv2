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
    egg: "eggs",
    eggs: "eggs",
    berry: "mixed berries",
    berries: "mixed berries",
    "chicken": "chicken breast",
    "chicken breast": "chicken breast",
    "spinach leaves": "spinach",
    "salad leaves": "salad leaves",
    "mixed stir-fry vegetables": "mixed stir-fry vegetables",
    "mixed vegetables": "mixed vegetables",
    "baby potato": "baby potatoes",
    "baby potatoes": "baby potatoes",
    potato: "potatoes",
    potatoes: "potatoes",
    "almond": "almonds",
    almonds: "almonds",
    "peanut": "peanut butter",
    "peanut butter": "peanut butter",
    "greek yoghurt": "greek yogurt",
    "greek yogurt": "greek yogurt",
    yoghurt: "yogurt",
    yogurt: "yogurt",
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
