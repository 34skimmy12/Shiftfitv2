import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Bell, ChevronRight, CircleHelp, Database, Footprints, Moon, Shield, Smartphone, Target, UserRound, CalendarDays, LogOut, Info, X, Check, Dumbbell, Utensils, Droplets, Footprints as StepsIcon, Mail, RefreshCw, MessageCircle, Heart, ShoppingBasket, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const WHATSAPP_NUMBER = "";

const sections = [
  { title: "APP PREFERENCES", items: [
    { icon: Bell, title: "Notifications", description: "Manage reminders and activity updates", action: "notifications" },
    { icon: Moon, title: "Appearance", description: "Keep the ShiftFit V2 theme and display settings", action: "appearance" },
  ]},
  { title: "DATA & ACCOUNT", items: [
    { icon: Shield, title: "Data & Privacy", description: "Review your data and privacy controls", action: "privacy" },
    { icon: Database, title: "Account & Sync", description: "Account, saved plans and sync status", action: "account" },
  ]},
  { title: "MY SETUP", items: [
    { icon: CalendarDays, title: "Shift Schedule", description: "Change your shift pattern and work days", action: "shift" },
    { icon: Target, title: "Goal & Nutrition", description: "Update goals, calories and macros", action: "goal" },
    { icon: UserRound, title: "Personal Details", description: "Update your personal profile information", action: "personal" },
  ]},
  { title: "YOUR PROGRESS", items: [
    { icon: Footprints, title: "Progress", description: "View your activity, measurements and trends", action: "stats" },
    { icon: Smartphone, title: "Watches & Trackers", description: "Connect Apple Health, Garmin, Fitbit, Strava and more", action: "connections" },
  ]},
  { title: "SUPPORT", items: [
    { icon: CircleHelp, title: "Help & Support", description: "Get help using ShiftFit", action: "support" },
    { icon: Info, title: "About ShiftFit", description: "Version, features and app information", action: "about" },
  ]},
];

const modalCopy = {
  notifications: { title: "Notifications", description: "Choose the reminders that fit around your shifts. Preferences are saved on this device." },
  appearance: { title: "Appearance", description: "Control how ShiftFit feels while keeping the core V2 visual identity consistent." },
  privacy: { title: "Data & Privacy", description: "Understand what ShiftFit uses to generate your plans and track your progress." },
  account: { title: "Account & Sync", description: "Manage your signed-in account and see how your ShiftFit data is currently connected." },
  support: { title: "Help & Support", description: "Find quick answers first, then contact the ShiftFit team if you still need help." },
  about: { title: "About ShiftFit", description: "Fitness that fits your shift." },
};

export default function Settings() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("shiftfit_notifications") !== "off");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("shiftfit_reduced_motion") === "on");
  const [notificationPrefs, setNotificationPrefs] = useState(() => ({
    workouts: localStorage.getItem("shiftfit_notify_workouts") !== "off",
    meals: localStorage.getItem("shiftfit_notify_meals") !== "off",
    water: localStorage.getItem("shiftfit_notify_water") !== "off",
    progress: localStorage.getItem("shiftfit_notify_progress") !== "off",
  }));
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (activeModal === "account") {
      supabase?.auth.getUser().then(({ data }) => setEmail(data?.user?.email || ""));
    }
  }, [activeModal]);

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("shiftfit_notifications", next ? "on" : "off");
  };

  const togglePreference = (key) => {
    const next = !notificationPrefs[key];
    setNotificationPrefs((prev) => ({ ...prev, [key]: next }));
    localStorage.setItem(`shiftfit_notify_${key}`, next ? "on" : "off");
  };

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem("shiftfit_reduced_motion", next ? "on" : "off");
    document.documentElement.classList.toggle("motion-reduce", next);
  };

  const handleAction = (action) => {
    if (action === "shift") return navigate("/onboarding?from=settings&step=2");
    if (action === "goal") return navigate("/onboarding?from=settings&step=1");
    if (action === "personal") return navigate("/onboarding?from=settings&step=0");
    if (action === "stats") return navigate("/stats");
    if (action === "connections") return navigate("/connections");
    setActiveModal(action);
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login", { replace: true });
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-xl font-bold">Settings</h1><p className="text-xs text-muted-foreground">Manage your ShiftFit preferences</p></div>
      </div>
      {sections.map((section) => (
        <section key={section.title} className="mb-5">
          <h2 className="mb-2 px-1 text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground">{section.title}</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {section.items.map((item, index) => { const Icon = item.icon; return (
              <button key={item.title} type="button" onClick={() => handleAction(item.action)} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50 ${index < section.items.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{item.title}</div><div className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{item.description}</div></div>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
              </button>
            ); })}
          </div>
        </section>
      ))}
      <section className="mb-5">
        <h2 className="mb-2 px-1 text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground">ACCOUNT</h2>
        <button type="button" onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"><LogOut className="h-4 w-4" />Log out</button>
      </section>
      <div className="pb-4 text-center text-[10px] text-muted-foreground">ShiftFit V2 · Settings</div>
      {activeModal && <SettingsModal action={activeModal} notifications={notifications} onToggleNotifications={toggleNotifications} notificationPrefs={notificationPrefs} onTogglePreference={togglePreference} reducedMotion={reducedMotion} onToggleReducedMotion={toggleReducedMotion} email={email} onClose={() => setActiveModal(null)} />}
    </AppLayout>
  );
}

function SettingsModal({ action, notifications, onToggleNotifications, notificationPrefs, onTogglePreference, reducedMotion, onToggleReducedMotion, email, onClose }) {
  const copy = modalCopy[action];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-background p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{copy.title}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{copy.description}</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        {action === "notifications" && <div className="mt-5 space-y-3">
          <SettingToggle title="ShiftFit notifications" description="Master switch for ShiftFit reminders." enabled={notifications} onClick={onToggleNotifications} />
          <SettingToggle icon={Dumbbell} title="Workout reminders" description="Remind me about scheduled training sessions." enabled={notificationPrefs.workouts && notifications} onClick={() => onTogglePreference("workouts")} />
          <SettingToggle icon={Utensils} title="Meal reminders" description="Remind me to stay on track with planned meals." enabled={notificationPrefs.meals && notifications} onClick={() => onTogglePreference("meals")} />
          <SettingToggle icon={Droplets} title="Water reminders" description="Keep hydration visible during the day." enabled={notificationPrefs.water && notifications} onClick={() => onTogglePreference("water")} />
          <SettingToggle icon={StepsIcon} title="Progress reminders" description="Prompt me to check steps, measurements and progress." enabled={notificationPrefs.progress && notifications} onClick={() => onTogglePreference("progress")} />
          <InfoBox>Notification preferences are stored locally. Push delivery will be connected when native notification support is enabled.</InfoBox>
        </div>}

        {action === "appearance" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="text-sm font-semibold">ShiftFit V2 design</div><div className="mt-1 text-xs leading-5 text-muted-foreground">The current V2 theme is used consistently across Home, Meals, Train, Progress and Settings.</div><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary"><Check className="h-4 w-4" /> Current design</div></div>
          <SettingToggle icon={Moon} title="Reduced motion" description="Reduce non-essential interface movement on this device." enabled={reducedMotion} onClick={onToggleReducedMotion} />
          <InfoBox>More appearance controls can be added later without changing the core V2 design system.</InfoBox>
        </div>}

        {action === "privacy" && <div className="mt-5 space-y-3">
          <InfoCard icon={UserRound} title="Profile information" text="Personal details, goals, shift pattern, work days and food preferences are used to personalise your plans." />
          <InfoCard icon={Utensils} title="Nutrition & meals" text="Your calorie and macro targets are used to generate the Monday–Sunday meal plan and Smart Basket." />
          <InfoCard icon={Dumbbell} title="Training & progress" text="Workout plans, logged measurements, steps and other progress entries support your fitness tracking." />
          <InfoCard icon={Smartphone} title="Connected devices" text="Device connections are managed separately. A connection only becomes active when you authorise it." />
          <InfoBox>Before production launch, ShiftFit should provide dedicated data export, deletion and consent controls.</InfoBox>
        </div>}

        {action === "account" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div><div className="min-w-0"><div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Signed-in account</div><div className="mt-1 break-all text-sm font-semibold">{email || "Current ShiftFit account"}</div></div></div></div>
          <InfoCard icon={RefreshCw} title="Plan sync" text="Your saved profile, meal plans, workout plans and shopping data are used together so personalisation stays consistent." />
          <InfoCard icon={Smartphone} title="Device sync" text="Apple Health, Garmin, Fitbit and Strava are managed from Watches & Trackers." />
          <InfoBox>Account sync will expand as ShiftFit moves toward full cloud synchronisation. Your current app session remains available.</InfoBox>
        </div>}

        {action === "support" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm font-semibold">How do I change my plan?</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Open Shift Schedule, Goal & Nutrition or Personal Details. Save your changes and ShiftFit will rebuild the personalised plan where required.</p></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm font-semibold">How do meal swaps work?</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the swap action on a meal to choose another suitable option while keeping your personal preferences in mind.</p></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm font-semibold">Why is a Smart Basket price missing?</div><p className="mt-1 text-xs leading-5 text-muted-foreground">ShiftFit only shows verified comparable pack prices. A blank price means we do not currently have a verified match rather than guessing a price.</p></div>
          <a href="mailto:support@shiftfit.app" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Mail className="h-4 w-4" />Email ShiftFit support</a>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold">WhatsApp Support</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Have a question, found a problem, or need help with your plan? Message ShiftFit Support directly on WhatsApp.</p></div></div>{WHATSAPP_NUMBER ? <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi ShiftFit Support, I need some help with the app.")}`} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><MessageCircle className="h-4 w-4" />Message us on WhatsApp</a> : <div className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground">WhatsApp support number coming soon</div>}</div>
        </div>}

        {action === "about" && <AboutShiftFit />}

        <button type="button" onClick={onClose} className="mt-5 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold">Done</button>
      </div>
    </div>
  );
}

function AboutShiftFit() {
  return <div className="mt-5 space-y-4">
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">S</div><div><div className="font-bold tracking-wide">SHIFT FIT</div><div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Shift smart. Train smart.</div></div></div>
    <AboutSection title="Fitness that fits your shift." text="ShiftFit is a fitness and nutrition companion built for people whose working lives don't always follow a normal 9–5 routine. Whether you work early mornings, late nights, rotating shifts or long working days, ShiftFit helps bring your training, nutrition, recovery and progress together around the way you actually live." />
    <AboutSection title="Your plan. Your schedule. Your goals." text="ShiftFit starts by understanding you. Your goals, calorie and macro targets, food preferences, foods you avoid, shift pattern and working days all help shape your personalised plan. Instead of giving everyone the same generic programme, ShiftFit is designed to adapt around your lifestyle." />
    <AboutFeature icon={Dumbbell} title="Train smarter" text="Your training plan is designed to work alongside your schedule, helping you stay consistent even when your working hours change. Track your workouts, activity and progress in one place and build consistency over time." />
    <AboutFeature icon={Utensils} title="Eat with a plan" text="ShiftFit creates a personalised Monday–Sunday meal plan based around your nutritional targets and preferences. Don't like something? Swap it. Your meal plan can adapt without losing sight of your overall nutrition goals." />
    <AboutFeature icon={ShoppingBasket} title="Shop smarter" text="The Smart Basket turns your actual meal plan into a shopping list. Where verified supermarket pricing is available, ShiftFit can compare products across supermarkets so you can see where your basket could be cheaper. No made-up prices. If we don't have a verified comparable price, we'll tell you." />
    <AboutFeature icon={TrendingUp} title="Your progress, your journey" text="Fitness isn't just about one workout or one weigh-in. ShiftFit brings your measurements, activity and progress together so you can see how you're moving towards your goals over time." />
    <AboutSection title="Built for real life" text="Shift work can make consistency difficult. Sleep schedules change. Work days move. Meal times aren't always predictable. Training has to fit around life rather than the other way around. That's what ShiftFit is built for. We're creating a fitness app that understands that your schedule isn't always standard — and your fitness plan shouldn't be either." />
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-start gap-3"><Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="text-sm font-bold">Our goal</div><p className="mt-2 text-sm leading-6 text-foreground/90">To make getting fitter, eating better and staying consistent easier for people with demanding and unpredictable schedules.</p><p className="mt-3 text-sm font-extrabold text-primary">Shift smart. Train smart. Live better.</p></div></div></div>
    <div className="rounded-2xl border border-border bg-card p-4 text-center"><div className="text-sm font-bold">ShiftFit V2</div><p className="mt-2 text-xs leading-5 text-muted-foreground">ShiftFit is currently under active development. We're continuing to improve the app, expand integrations, develop AI-powered coaching and add new features designed to make ShiftFit your complete fitness companion.</p><div className="mt-3 text-[10px] text-muted-foreground">© 2026 ShiftFit. All rights reserved.</div></div>
  </div>;
}

function AboutSection({ title, text }) {
  return <section className="rounded-2xl border border-border bg-card p-4"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></section>;
}

function AboutFeature({ icon: Icon, title, text }) {
  return <section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></div></div></section>;
}

function SettingToggle({ icon: Icon, title, description, enabled, onClick }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left">
    {Icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>}
    <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div></div>
    <div className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${enabled ? "bg-primary justify-end" : "bg-secondary justify-start"}`}><div className="h-5 w-5 rounded-full bg-background shadow-sm" /></div>
  </button>;
}

function InfoCard({ icon: Icon, title, text }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><div><div className="text-sm font-semibold">{title}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div></div>;
}

function InfoBox({ children }) {
  return <div className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-5 text-muted-foreground">{children}</div>;
}
