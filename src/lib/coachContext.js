import { base44 } from "@/api/base44Client";
import { todayStr, weekdayOf } from "@/lib/fitnessUtils";

const compact = (value, max = 1200) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export async function getCoachContext(profile) {
  const today = todayStr();
  const dayIndex = weekdayOf(today);

  const [mealPlans, workoutPlans, shiftLogs, workoutLogs, metrics, stepLogs, waterLogs] = await Promise.all([
    base44.entities.MealPlan.list(),
    base44.entities.WorkoutPlan.list(),
    base44.entities.ShiftEntry.filter({ date: today }),
    base44.entities.WorkoutLog.filter({ date: today }),
    base44.entities.BodyMetric.list("-created_date", 30),
    base44.entities.StepLog.filter({ date: today }),
    base44.entities.WaterLog.filter({ date: today }),
  ]);

  const meals = [...mealPlans].sort((a, b) => a.day_index - b.day_index);
  const workouts = [...workoutPlans].sort((a, b) => a.day_index - b.day_index);
  const todayMeals = meals.find((p) => p.day_index === dayIndex) || null;
  const todayWorkout = workouts.find((p) => p.day_index === dayIndex) || null;
  const todayShift = shiftLogs[0] || null;
  const todayWorkoutLog = workoutLogs.find((l) => l.workout_plan_id === todayWorkout?.id) || null;

  return {
    date: today,
    dayIndex,
    profile: {
      name: profile.full_name,
      age: profile.age,
      sex: profile.sex,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      goal: profile.goal,
      activity_level: profile.activity_level,
      shift_pattern: profile.shift_pattern,
      work_days: profile.work_days || [],
      calorie_target: profile.calorie_target,
      protein_target: profile.protein_target,
      carb_target: profile.carb_target,
      fat_target: profile.fat_target,
      water_target_ml: profile.water_target_ml,
      step_target: profile.step_target,
    },
    todayShift,
    todayMeals,
    todayWorkout,
    todayWorkoutLog,
    todaySteps: stepLogs[0]?.steps || 0,
    todayWaterMl: waterLogs[0]?.amount_ml || 0,
    recentProgress: metrics.slice(-10).map((m) => ({
      date: m.date,
      weight_kg: m.weight_kg,
      body_fat_pct: m.body_fat_pct,
      muscle_mass_kg: m.muscle_mass_kg,
      waist_cm: m.waist_cm,
    })),
  };
}

export function formatCoachContext(context) {
  const p = context.profile;
  const shift = context.todayShift
    ? `${context.todayShift.shift_type}${context.todayShift.start_time ? ` ${context.todayShift.start_time}` : ""}${context.todayShift.end_time ? `–${context.todayShift.end_time}` : ""}`
    : "No calendar shift entry for today";

  const mealSummary = context.todayMeals
    ? context.todayMeals.meals.map((m) => `${m.type}: ${m.name} (${m.calories} kcal, ${m.protein}g protein)`).join("\n")
    : "No meal plan found for today";

  const workoutSummary = context.todayWorkout
    ? `${context.todayWorkout.title}; focus: ${context.todayWorkout.focus || "n/a"}; ${context.todayWorkout.duration_min || "?"} min; intensity: ${context.todayWorkout.intensity || "n/a"}; exercises: ${(context.todayWorkout.exercises || []).map((e) => e.name).join(", ")}`
    : "No workout plan found for today";

  return `SHIFTfit live context for ${context.date}:

PROFILE
- Name: ${p.name}
- Age/sex: ${p.age}/${p.sex}
- Body: ${p.weight_kg}kg, ${p.height_cm}cm
- Goal: ${p.goal}; activity: ${p.activity_level}
- Shift pattern: ${p.shift_pattern}; work days: ${p.work_days.join(", ") || "not set"}
- Targets: ${p.calorie_target} kcal, ${p.protein_target}g protein, ${p.carb_target}g carbs, ${p.fat_target}g fat, ${p.water_target_ml}ml water, ${p.step_target} steps

TODAY
- Calendar shift: ${shift}
- Water: ${context.todayWaterMl}/${p.water_target_ml} ml
- Steps: ${context.todaySteps}/${p.step_target}
- Meals:
${compact(mealSummary, 2200)}
- Workout: ${compact(workoutSummary, 1600)}
- Workout progress: ${context.todayWorkoutLog ? `${(context.todayWorkoutLog.completed_exercises || []).length} exercises completed; ${context.todayWorkoutLog.completed ? "complete" : "in progress"}` : "not started"}

RECENT PROGRESS
${compact(context.recentProgress.length ? JSON.stringify(context.recentProgress) : "No progress entries yet", 1800)}

Use this context when relevant. Never invent missing ShiftFit data. If today's data is missing, say so and give general guidance that still fits the user's known profile and shift pattern.`;
}
