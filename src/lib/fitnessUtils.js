// Shared fitness/shift logic for ShiftFit

export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function weekdayOf(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay();
}

// Mifflin-St Jeor BMR
export function computeBMR({ sex, weight_kg, height_cm, age }) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

const ACTIVITY_FACTOR = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };

export function computeTargets(profile) {
  const bmr = computeBMR(profile);
  const tdee = bmr * (ACTIVITY_FACTOR[profile.activity_level] || 1.375);
  let calories = tdee;
  if (profile.goal === "lose") calories -= 400;
  if (profile.goal === "gain") calories += 350;
  calories = Math.round(calories / 10) * 10;

  const proteinPerKg = profile.goal === "lose" ? 1.8 : profile.goal === "gain" ? 2.2 : 2.0;
  const protein = Math.round((profile.weight_kg * proteinPerKg) / 5) * 5;
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water_target_ml = Math.round((profile.weight_kg * 35) / 50) * 50;
  const step_target = profile.goal === "lose" ? 10000 : profile.goal === "gain" ? 7000 : 8500;
  return { calorie_target: calories, protein_target: protein, carb_target: carbs, fat_target: fat, water_target_ml, step_target };
}

export function shiftForWeekday(profile, weekdayIdx) {
  const day = WEEKDAYS[weekdayIdx];
  if (!profile.work_days?.includes(day)) return "rest";
  if (profile.shift_pattern === "fixed_night") return "night";
  if (profile.shift_pattern === "rotating") return weekdayIdx % 2 === 0 ? "day" : "night";
  return "day";
}

export const SHIFT_META = {
  day: { label: "Day Shift", color: "text-primary", dot: "bg-primary" },
  night: { label: "Night Shift", color: "text-accent", dot: "bg-accent" },
  rest: { label: "Rest Day", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

const WORKOUT_TEMPLATES = {
  day: [
    { title: "Upper Body Power", focus: "Chest, Back, Shoulders", duration_min: 50, intensity: "high", exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest_sec: 120, notes: "Keep shoulders retracted" }, { name: "Bent-Over Row", sets: 4, reps: "8-10", rest_sec: 90, notes: "Squeeze at top" }, { name: "Overhead Press", sets: 3, reps: "8-10", rest_sec: 90, notes: "Brace core" }, { name: "Lat Pulldown", sets: 3, reps: "10-12", rest_sec: 75, notes: "" }, { name: "Dumbbell Curl", sets: 3, reps: "12", rest_sec: 60, notes: "" }, { name: "Tricep Pushdown", sets: 3, reps: "12", rest_sec: 60, notes: "" },
    ]},
    { title: "Lower Body Strength", focus: "Quads, Hamstrings, Glutes", duration_min: 55, intensity: "high", exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6-8", rest_sec: 150, notes: "Depth to parallel" }, { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest_sec: 120, notes: "Hinge at hips" }, { name: "Leg Press", sets: 3, reps: "10-12", rest_sec: 90, notes: "" }, { name: "Walking Lunges", sets: 3, reps: "12/leg", rest_sec: 75, notes: "" }, { name: "Calf Raises", sets: 4, reps: "15", rest_sec: 45, notes: "" },
    ]},
  ],
  night: [{ title: "Night Shift Maintenance", focus: "Full Body — Moderate", duration_min: 30, intensity: "moderate", exercises: [
    { name: "Goblet Squat", sets: 3, reps: "10", rest_sec: 75, notes: "Keep torso upright" }, { name: "Dumbbell Row", sets: 3, reps: "12", rest_sec: 60, notes: "" }, { name: "Push-Up", sets: 3, reps: "AMRAP", rest_sec: 60, notes: "Quality over quantity" }, { name: "Plank", sets: 3, reps: "45s", rest_sec: 45, notes: "Brace hard" }, { name: "Kettlebell Swing", sets: 3, reps: "15", rest_sec: 60, notes: "Hip drive" },
  ]}],
  rest: [{ title: "Active Recovery", focus: "Mobility & Light Cardio", duration_min: 25, intensity: "low", exercises: [
    { name: "Foam Rolling", sets: 1, reps: "10 min", rest_sec: 0, notes: "Focus on tight areas" }, { name: "Hip Mobility Flow", sets: 1, reps: "8 min", rest_sec: 0, notes: "90/90 transitions" }, { name: "Brisk Walk", sets: 1, reps: "15 min", rest_sec: 0, notes: "Zone 2 — easy pace" }, { name: "Deep Stretching", sets: 1, reps: "10 min", rest_sec: 0, notes: "Hold 30s each" },
  ]}],
};

export function generateWorkoutPlans(profile) {
  return Array.from({ length: 7 }, (_, i) => {
    const shift = shiftForWeekday(profile, i);
    const templates = WORKOUT_TEMPLATES[shift];
    const tmpl = templates[i % templates.length];
    return { day_index: i, day_label: WEEKDAY_LABELS[i], shift_context: shift, title: tmpl.title, focus: tmpl.focus, duration_min: tmpl.duration_min, intensity: tmpl.intensity, exercises: tmpl.exercises };
  });
}

function roundTo(n, step) { return Math.round(n / step) * step; }

// Meal library deliberately contains interchangeable meals. The generator selects by
// shift + goal + user likes/avoidances, then scales portions to the calculated targets.
const MEAL_LIBRARY = [
  { key: "yogurt_bowl", shifts: ["day", "rest"], types: ["breakfast"], name: "Greek Yogurt Berry Bowl", tags: ["yogurt", "berries", "oats", "vegetarian"], items: ["Greek yogurt 250g", "Oats 40g", "Mixed berries 100g", "Honey 1 tsp"], p: 30, c: 48, f: 7 },
  { key: "eggs_toast", shifts: ["day", "rest"], types: ["breakfast"], name: "Eggs, Avocado & Wholegrain Toast", tags: ["eggs", "avocado", "vegetarian"], items: ["Eggs 3", "Wholegrain toast 2 slices", "Avocado 1/2", "Spinach"], p: 28, c: 40, f: 20 },
  { key: "protein_oats", shifts: ["day", "night"], types: ["breakfast", "pre_shift"], name: "Protein Overnight Oats", tags: ["oats", "whey", "banana"], items: ["Oats 60g", "Whey protein 1 scoop", "Banana", "Milk 200ml"], p: 35, c: 65, f: 9 },
  { key: "chicken_rice", shifts: ["day", "night"], types: ["lunch", "dinner"], name: "Chicken, Rice & Broccoli", tags: ["chicken", "rice", "broccoli"], items: ["Chicken breast 180g", "Brown rice 150g", "Broccoli", "Olive oil 1 tbsp"], p: 52, c: 58, f: 13 },
  { key: "beef_rice", shifts: ["day", "rest"], types: ["lunch", "dinner"], name: "Lean Beef & Rice Stir-Fry", tags: ["beef", "rice", "vegetables"], items: ["Lean beef 160g", "Brown rice 140g", "Mixed stir-fry vegetables", "Sesame oil 1 tsp"], p: 46, c: 54, f: 17 },
  { key: "salmon_potato", shifts: ["day", "rest"], types: ["dinner"], name: "Salmon, Sweet Potato & Greens", tags: ["salmon", "sweet potato", "avocado"], items: ["Salmon 160g", "Sweet potato 200g", "Spinach", "Avocado 1/4"], p: 39, c: 43, f: 21 },
  { key: "turkey_quinoa", shifts: ["night", "day"], types: ["lunch", "dinner"], name: "Turkey & Quinoa Power Bowl", tags: ["turkey", "quinoa", "vegetables"], items: ["Turkey mince 160g", "Quinoa 120g", "Mixed vegetables", "Olive oil 1 tsp"], p: 47, c: 48, f: 14 },
  { key: "tuna_wrap", shifts: ["night", "day", "rest"], types: ["lunch"], name: "Tuna & Hummus Wholegrain Wrap", tags: ["tuna", "wrap", "hummus"], items: ["Tuna 120g", "Wholegrain wrap", "Hummus 40g", "Salad leaves"], p: 38, c: 42, f: 12 },
  { key: "chicken_wrap", shifts: ["day", "night", "rest"], types: ["lunch"], name: "Chicken & Hummus Wrap", tags: ["chicken", "wrap", "hummus"], items: ["Chicken 150g", "Wholegrain wrap", "Hummus 40g", "Salad leaves"], p: 42, c: 44, f: 13 },
  { key: "cottage_fruit", shifts: ["day", "night", "rest"], types: ["snack", "post_shift"], name: "Cottage Cheese, Fruit & Almonds", tags: ["cottage cheese", "pear", "almonds"], items: ["Cottage cheese 200g", "Pear", "Almonds 20g"], p: 27, c: 29, f: 13 },
  { key: "shake_banana", shifts: ["day", "night", "rest"], types: ["snack"], name: "Protein Shake & Banana", tags: ["whey", "banana", "milk"], items: ["Whey protein 1 scoop", "Banana", "Milk 200ml"], p: 30, c: 34, f: 5 },
  { key: "smoothie", shifts: ["rest", "day"], types: ["snack"], name: "Berry Protein Smoothie", tags: ["whey", "berries", "spinach"], items: ["Whey protein 1 scoop", "Frozen berries 100g", "Spinach", "Milk 200ml", "Chia seeds 10g"], p: 30, c: 27, f: 8 },
  { key: "omelette", shifts: ["rest", "night"], types: ["breakfast", "post_shift"], name: "Veggie Omelette & Toast", tags: ["eggs", "vegetables", "vegetarian"], items: ["Eggs 3", "Peppers & onion", "Wholegrain toast 2 slices", "Spinach"], p: 30, c: 37, f: 18 },
  { key: "recovery_toast", shifts: ["night"], types: ["post_shift"], name: "Post-Shift Eggs & Toast", tags: ["eggs", "toast", "avocado"], items: ["Eggs 3", "Wholegrain toast 2 slices", "Avocado 1/4", "Spinach"], p: 30, c: 35, f: 18 },
];

const MEAL_SLOTS = {
  day: ["breakfast", "lunch", "snack", "dinner"],
  night: ["pre_shift", "snack", "lunch", "post_shift"],
  rest: ["breakfast", "lunch", "snack", "dinner"],
};

function normaliseList(value) {
  if (Array.isArray(value)) return value.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  return String(value || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
}

function matchesPreference(meal, likes, avoid) {
  const haystack = `${meal.name} ${meal.items.join(" ")} ${meal.tags.join(" ")}`.toLowerCase();
  if (avoid.some((x) => haystack.includes(x))) return false;
  return likes.length === 0 || likes.some((x) => haystack.includes(x));
}

function candidateMeals(shift, slot, avoid) {
  return MEAL_LIBRARY.filter((m) => m.shifts.includes(shift) && m.types.includes(slot) && !matchesPreference(m, [], avoid));
}

function pickMeal(shift, slot, dayIndex, usedKeys, likes, avoid) {
  let candidates = candidateMeals(shift, slot, avoid);
  if (!candidates.length) candidates = MEAL_LIBRARY.filter((m) => m.shifts.includes(shift) && m.types.includes(slot));
  const liked = candidates.filter((m) => matchesPreference(m, likes, []));
  if (liked.length) candidates = liked;
  const unused = candidates.filter((m) => !usedKeys.has(m.key));
  const pool = unused.length ? unused : candidates;
  return pool[(dayIndex + slot.length) % pool.length] || candidates[0];
}

export function generateMealPlans(profile, targets) {
  const likes = normaliseList(profile.food_likes);
  const avoid = normaliseList(profile.food_avoid);
  const plans = [];

  for (let i = 0; i < 7; i++) {
    const shift = shiftForWeekday(profile, i);
    const slots = MEAL_SLOTS[shift];
    const usedKeys = new Set();
    const chosen = slots.map((slot) => {
      const meal = pickMeal(shift, slot, i, usedKeys, likes, avoid);
      usedKeys.add(meal.key);
      return { ...meal, slot };
    });

    const baseCalories = chosen.reduce((sum, m) => sum + m.p * 4 + m.c * 4 + m.f * 9, 0);
    const scale = targets.calorie_target > 0 ? targets.calorie_target / baseCalories : 1;
    const goalAdjust = profile.goal === "gain" ? 1.02 : profile.goal === "lose" ? 0.98 : 1;

    const meals = chosen.map((m) => {
      const p = roundTo(m.p * scale * goalAdjust, 1);
      const c = roundTo(m.c * scale, 1);
      const f = roundTo(m.f * scale, 1);
      const calories = roundTo(p * 4 + c * 4 + f * 9, 5);
      return { type: m.slot, name: m.name, calories, protein: p, carbs: c, fat: f, items: m.items };
    });

    plans.push({
      day_index: i,
      day_label: WEEKDAY_LABELS[i],
      shift_context: shift,
      meals,
      total_calories: meals.reduce((s, m) => s + m.calories, 0),
      total_protein: meals.reduce((s, m) => s + m.protein, 0),
    });
  }
  return plans;
}

export function generateShoppingList(mealPlans) {
  const items = [];
  const seen = new Set();
  const categorize = (name) => {
    const n = name.toLowerCase();
    if (/(chicken|salmon|turkey|beef|tuna|eggs?|whey|cottage cheese|greek yogurt|yogurt)/.test(n)) return "Protein";
    if (/(broccoli|spinach|peppers|onion|berries|pear|avocado|veg|salad|greens|stir-fry)/.test(n)) return "Produce";
    if (/(milk|cheese|butter|hummus|honey)/.test(n)) return "Dairy";
    if (/(rice|oats|quinoa|toast|wrap|granola|bread|chia)/.test(n)) return "Grains";
    if (/(oil|almonds|peanut|sesame|seeds)/.test(n)) return "Pantry";
    return "Other";
  };
  mealPlans.forEach((plan) => plan.meals.forEach((m) => m.items.forEach((it) => {
    const key = it.toLowerCase();
    if (!seen.has(key)) { seen.add(key); items.push({ name: it, category: categorize(it), quantity: "x7 days", checked: false }); }
  })));
  return items;
}

export function shiftTip(shift) {
  if (shift === "night") return "Prioritise protein every 3-4 hrs overnight, keep caffeine before 2am, and dim screens on the commute home to protect sleep.";
  if (shift === "day") return "Front-load carbs around your shift, train before work if possible, and wind down screens 60 min before bed.";
  return "Use rest days for mobility, meal prep and extra sleep — recovery is where progress happens.";
}
