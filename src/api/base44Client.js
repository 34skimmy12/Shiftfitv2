const DB_KEY = "shiftfit_v2_db";
const USER_KEY = "shiftfit_v2_user";

const emptyDb = () => ({
  UserProfile: [], ShiftEntry: [], WorkoutPlan: [], WorkoutLog: [], MealPlan: [],
  WaterLog: [], StepLog: [], BodyMetric: [], ChatMessage: [], ShoppingListItem: [],
});

function readDb() {
  try { return { ...emptyDb(), ...(JSON.parse(localStorage.getItem(DB_KEY) || "{}")) }; }
  catch { return emptyDb(); }
}
function writeDb(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function id() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
function withMeta(item) { return { ...item, id: item.id || id(), created_date: item.created_date || new Date().toISOString() }; }

function entity(name) {
  return {
    async list(order) {
      const rows = [...readDb()[name]];
      if (order === "-created_date") rows.sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)));
      if (order === "created_date") rows.sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));
      return rows;
    },
    async filter(criteria = {}) {
      const rows = readDb()[name];
      return rows.filter(row => Object.entries(criteria).every(([key, value]) => row[key] === value));
    },
    async create(data) {
      const db = readDb(); const item = withMeta(data); db[name].push(item); writeDb(db); return item;
    },
    async bulkCreate(data) {
      const db = readDb(); const items = data.map(withMeta); db[name].push(...items); writeDb(db); return items;
    },
    async update(itemId, patch) {
      const db = readDb(); const index = db[name].findIndex(x => x.id === itemId);
      if (index < 0) throw new Error(`${name} record not found`);
      db[name][index] = { ...db[name][index], ...patch, updated_date: new Date().toISOString() }; writeDb(db); return db[name][index];
    },
    async delete(itemId) {
      const db = readDb(); db[name] = db[name].filter(x => x.id !== itemId); writeDb(db); return true;
    },
  };
}

const entities = Object.fromEntries(Object.keys(emptyDb()).map(name => [name, entity(name)]));

const coachReply = (prompt = "") => {
  const q = prompt.split("User:").pop()?.split("Coach:")[0]?.trim() || prompt;
  const lower = q.toLowerCase();
  if (lower.includes("night shift")) return "On a night shift, keep meals predictable: a protein-rich meal before work, a lighter balanced meal during the shift, and a small protein-focused option before sleep if you’re hungry. Keep caffeine to the first half of the shift and protect your post-shift sleep window. Your ShiftFit plan is built to adapt around this schedule.";
  if (lower.includes("workout") || lower.includes("training")) return "For a 12-hour shift, consistency beats intensity. If you’re fresh, use the planned session; if the shift has drained you, shorten it to the key compound movements and finish with mobility. ShiftFit can scale the session around your shift and recovery.";
  if (lower.includes("sleep")) return "For rotating shifts, anchor a protected sleep block, darken and cool the room, and keep your wind-down routine consistent. Avoid relying on late caffeine to push through fatigue. Recovery is part of the plan, not time away from it.";
  if (lower.includes("snack") || lower.includes("protein")) return "Easy high-protein options: Greek yogurt and berries, cottage cheese and fruit, a protein shake with a banana, eggs on toast, or chicken wraps. Aim for a convenient option you’ll actually eat during a busy shift.";
  return "I’m your ShiftFit coach. I can help you adjust training, meals, hydration and recovery around day shifts, night shifts and rest days. Tell me what shift you’re working and what you’re struggling with today.";
};

export const base44 = {
  entities,
  integrations: { Core: { InvokeLLM: async ({ prompt }) => ({ text: coachReply(prompt) }) } },
  auth: {
    async me() { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); },
    async loginViaEmailPassword(email) { const user = { id: email, email, full_name: email.split("@")[0] }; localStorage.setItem(USER_KEY, JSON.stringify(user)); return user; },
    async register(data) { const user = { id: data.email, email: data.email, full_name: data.full_name || data.email.split("@")[0] }; localStorage.setItem(USER_KEY, JSON.stringify(user)); return user; },
    async loginWithProvider() { const user = { id: `google-${id()}`, email: "demo@shiftfit.app", full_name: "ShiftFit Member" }; localStorage.setItem(USER_KEY, JSON.stringify(user)); return user; },
    async verifyOtp() { return { access_token: "local" }; },
    async resetPassword() { return true; },
    async logout() { localStorage.removeItem(USER_KEY); },
  },
  app: { async getPublicSettings() { return {}; } },
};

export function resetShiftFitDemoData() { localStorage.removeItem(DB_KEY); localStorage.removeItem(USER_KEY); window.location.href = "/onboarding"; }
