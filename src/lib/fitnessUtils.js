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

const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

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
  const isWorkDay = profile.work_days?.includes(day);
  if (!isWorkDay) return "rest";
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
      { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest_sec: 120, notes: "Keep shoulders retracted" },
      { name: "Bent-Over Row", sets: 4, reps: "8-10", rest_sec: 90, notes: "Squeeze at top" },
      { name: "Overhead Press", sets: 3, reps: "8-10", rest_sec: 90, notes: "Brace core" },
      { name: "Lat Pulldown", sets: 3, reps: "10-12", rest_sec: 75, notes: "" },
      { name: "Dumbbell Curl", sets: 3, reps: "12", rest_sec: 60, notes: "" },
      { name: "Tricep Pushdown", sets: 3, reps: "12", rest_sec: 60, notes: "" },
    ]},
    { title: "Lower Body Strength", focus: "Quads, Hamstrings, Glutes", duration_min: 55, intensity: "high", exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6-8", rest_sec: 150, notes: "Depth to parallel" },
      { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest_sec: 120, notes: "Hinge at hips" },
      { name: "Leg Press", sets: 3, reps: "10-12", rest_sec: 90, notes: "" },
      { name: "Walking Lunges", sets: 3, reps: "12/leg", rest_sec: 75, notes: "" },
      { name: "Calf Raises", sets: 4, reps: "15", rest_sec: 45, notes: "" },
    ]},
  ],
  night: [
    { title: "Night Shift Maintenance", focus: "Full Body — Moderate", duration_min: 30, intensity: "moderate", exercises: [
      { name: "Goblet Squat", sets: 3, reps: "10", rest_sec: 75, notes: "Keep torso upright" },
      { name: "Dumbbell Row", sets: 3, reps: "12", rest_sec: 60, notes: "" },
      { name: "Push-Up", sets: 3, reps: "AMRAP", rest_sec: 60, notes: "Quality over quantity" },
      { name: "Plank", sets: 3, reps: "45s", rest_sec: 45, notes: "Brace hard" },
      { name: "Kettlebell Swing", sets: 3, reps: "15", rest_sec: 60, notes: "Hip drive" },
    ]},
  ],
  rest: [
    { title: "Active Recovery", focus: "Mobility & Light Cardio", duration_min: 25, intensity: "low", exercises: [
      { name: "Foam Rolling", sets: 1, reps: "10 min", rest_sec: 0, notes: "Focus on tight areas" },
      { name: "Hip Mobility Flow", sets: 1, reps: "8 min", rest_sec: 0, notes: "90/90 transitions" },
      { name: "Brisk Walk", sets: 1, reps: "15 min", rest_sec: 0, notes: "Zone 2 — easy pace" },
      { name: "Deep Stretching", sets: 1, reps: "10 min", rest_sec: 0, notes: "Hold 30s each" },
    ]},
  ],
};

export function generateWorkoutPlans(profile) {
  const plans = [];
  for (let i = 0; i < 7; i++) {
    const shift = shiftForWeekday(profile, i);
    const templates = WORKOUT_TEMPLATES[shift];
    const tmpl = templates[i % templates.length];
    plans.push({ day_index: i, day_label: WEEKDAY_LABELS[i], shift_context: shift, title: tmpl.title, focus: tmpl.focus, duration_min: tmpl.duration_min, intensity: tmpl.intensity, exercises: tmpl.exercises });
  }
  return plans;
}

function roundTo(n, step) { return Math.round(n / step) * step; }

const MEAL_TEMPLATES = {
  day: [
    { type: "breakfast", name: "Greek Yogurt Power Bowl", items: ["Greek yogurt 250g", "Granola 40g", "Berries 100g", "Honey 1 tsp"], p: 28, c: 55, f: 6 },
    { type: "lunch", name: "Grilled Chicken & Rice", items: ["Chicken breast 180g", "Brown rice 150g", "Steamed broccoli", "Olive oil 1 tbsp"], p: 48, c: 60, f: 14 },
    { type: "snack", name: "Protein Shake & Banana", items: ["Whey protein 1 scoop", "Banana", "Almond milk 200ml"], p: 28, c: 30, f: 4 },
    { type: "dinner", name: "Salmon & Sweet Potato", items: ["Salmon 160g", "Sweet potato 200g", "Spinach salad", "Avocado 1/2"], p: 38, c: 45, f: 22 },
  ],
  night: [
    { type: "pre_shift", name: "Pre-Shift Energy Plate", items: ["Oats 60g", "Whey protein", "Banana", " Peanut butter 1 tbsp"], p: 30, c: 58, f: 12 },
    { type: "snack", name: "Overnight Recovery Snack", items: ["Cottage cheese 200g", "Almonds 20g", "Pear"], p: 26, c: 28, f: 14 },
    { type: "lunch", name: "Turkey & Quinoa Bowl", items: ["Ground turkey 160g", "Quinoa 120g", "Mixed veg", "Olive oil"], p: 44, c: 52, f: 16 },
    { type: "post_shift", name: "Post-Shift Recovery Meal", items: ["Eggs 3", "Whole grain toast 2", "Avocado 1/2", "Spinach"], p: 32, c: 42, f: 18 },
  ],
  rest: [
    { type: "breakfast", name: "Veggie Omelette & Toast", items: ["Eggs 3", "Peppers & onion", "Whole grain toast", "Avocado"], p: 30, c: 38, f: 18 },
    { type: "lunch", name: "Chicken Salad Wrap", items: ["Chicken 150g", "Whole wheat wrap", "Greens", "Hummus"], p: 40, c: 40, f: 12 },
    { type: "snack", name: "Protein Smoothie", items: ["Whey protein", "Spinach", "Frozen berries", "Chia seeds"], p: 26, c: 22, f: 6 },
    { type: "dinner", name: "Lean Beef & Veg Stir-Fry", items: ["Lean beef 150g", "Mixed stir-fry veg", "Brown rice 120g", "Sesame oil"], p: 42, c: 48, f: 16 },
  ],
};

export function generateMealPlans(profile, targets) {
  const plans = [];
  for (let i = 0; i < 7; i++) {
    const shift = shiftForWeekday(profile, i);
    const templates = MEAL_TEMPLATES[shift];
    const baseCals = templates.reduce((s, m) => s + m.p * 4 + m.c * 4 + m.f * 9, 0);
    const scale = targets.calorie_target / baseCals;
    const meals = templates.map((m) => {
      const p = roundTo(m.p * scale, 1);
      const c = roundTo(m.c * scale, 1);
      const f = roundTo(m.f * scale, 1);
      const calories = roundTo(p * 4 + c * 4 + f * 9, 5);
      return { type: m.type, name: m.name, calories, protein: p, carbs: c, fat: f, items: m.items };
    });
    const total_calories = meals.reduce((s, m) => s + m.calories, 0);
    const total_protein = meals.reduce((s, m) => s + m.protein, 0);
    plans.push({ day_index: i, day_label: WEEKDAY_LABELS[i], shift_context: shift, meals, total_calories, total_protein });
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
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ name: it, category: categorize(it), quantity: "x7 days", checked: false });
    }
  })));
  return items;
}

export function shiftTip(shift) {
  if (shift === "night") return "Prioritise protein every 3-4 hrs overnight, keep caffeine before 2am, and dim screens on the commute home to protect sleep.";
  if (shift === "day") return "Front-load carbs around your shift, train before work if possible, and wind down screens 60 min before bed.";
  return "Use rest days for mobility, meal prep and extra sleep — recovery is where progress happens.";
}
