import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Bell, ChevronRight, CircleHelp, Database, Footprints, Moon, Shield, Smartphone, Target, UserRound, CalendarDays, LogOut, Info, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
    { icon: Info, title: "About ShiftFit", description: "Version and app information", action: "about" },
  ]},
];

const modalCopy = {
  notifications: { title: "Notifications", description: "Choose which ShiftFit reminders you want to receive." },
  appearance: { title: "Appearance", description: "ShiftFit V2 keeps the same clean theme across the app. Your preference is saved on this device." },
  privacy: { title: "Data & Privacy", description: "Your profile, plans and progress data are used to power your ShiftFit experience. You stay in control of the data stored by the app." },
  account: { title: "Account & Sync", description: "Your ShiftFit account is connected to the current signed-in session. Device connections are managed separately." },
  support: { title: "Help & Support", description: "Need help? You can contact the ShiftFit team from here while the full support centre is being built." },
  about: { title: "About ShiftFit", description: "ShiftFit V2 is your shift-friendly fitness, nutrition and progress companion." },
};

export default function Settings() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("shiftfit_notifications") !== "off");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("shiftfit_reduced_motion") === "on");
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

      {activeModal && <SettingsModal action={activeModal} notifications={notifications} onToggleNotifications={toggleNotifications} reducedMotion={reducedMotion} onToggleReducedMotion={toggleReducedMotion} email={email} onClose={() => setActiveModal(null)} />}
    </AppLayout>
  );
}

function SettingsModal({ action, notifications, onToggleNotifications, reducedMotion, onToggleReducedMotion, email, onClose }) {
  const copy = modalCopy[action];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{copy.title}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{copy.description}</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        {action === "notifications" && <div className="mt-5 space-y-3">
          <SettingToggle title="ShiftFit notifications" description="Allow reminder and activity notifications when the feature is available." enabled={notifications} onClick={onToggleNotifications} />
          <div className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-5 text-muted-foreground">Your choice is saved on this device. Push delivery will be connected when native notifications are enabled.</div>
        </div>}

        {action === "appearance" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="text-sm font-semibold">ShiftFit V2 theme</div><div className="mt-1 text-xs text-muted-foreground">Active across the app.</div><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary"><Check className="h-4 w-4" /> Current design</div></div>
          <SettingToggle title="Reduced motion" description="Reduce non-essential interface movement on this device." enabled={reducedMotion} onClick={onToggleReducedMotion} />
        </div>}

        {action === "privacy" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm font-semibold">What ShiftFit stores</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Your profile details, nutrition targets, meal plans, workout plans and progress entries are stored for app functionality.</p></div>
          <div className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-5 text-muted-foreground">Full export and account deletion controls will be added before production launch.</div>
        </div>}

        {action === "account" && <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Signed-in account</div><div className="mt-1 break-all text-sm font-semibold">{email || "Current ShiftFit account"}</div></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm font-semibold">Sync status</div><div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" /> Local app data ready</div></div>
          <div className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-5 text-muted-foreground">Apple Health, Garmin, Fitbit and Strava connections are managed from Watches & Trackers.</div>
        </div>}

        {action === "support" && <div className="mt-5 space-y-3">
          <a href="mailto:support@shiftfit.app" className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Email ShiftFit support</a>
          <div className="rounded-2xl bg-secondary/60 p-3 text-[11px] leading-5 text-muted-foreground">For account, plan or app issues, include what you were doing and what happened so we can reproduce it.</div>
        </div>}

        {action === "about" && <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">S</div><div><div className="font-bold">SHIFT FIT</div><div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Shift smart. Train smart.</div></div></div>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm"><div className="flex justify-between py-1"><span className="text-muted-foreground">Version</span><span className="font-semibold">V2</span></div><div className="flex justify-between py-1"><span className="text-muted-foreground">Build</span><span className="font-semibold">Production</span></div></div>
        </div>}

        <button type="button" onClick={onClose} className="mt-5 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold">Done</button>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, enabled, onClick }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left">
    <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div></div>
    <div className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${enabled ? "bg-primary justify-end" : "bg-secondary justify-start"}`}><div className="h-5 w-5 rounded-full bg-background shadow-sm" /></div>
  </button>;
}
