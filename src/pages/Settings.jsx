import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Bell, ChevronRight, CircleHelp, Database, Footprints, Moon, Shield, Smartphone, Target, UserRound, CalendarDays, LogOut, Info } from "lucide-react";
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

export default function Settings() {
  const navigate = useNavigate();
  const handleAction = (action) => {
    if (action === "shift") return navigate("/onboarding?from=settings&step=2");
    if (action === "goal") return navigate("/onboarding?from=settings&step=1");
    if (action === "personal") return navigate("/onboarding?from=settings&step=0");
    if (action === "stats") return navigate("/stats");
    if (action === "connections") return navigate("/connections");
    if (action === "support") return window.alert("ShiftFit support is coming soon. You can continue using the app while we build the support centre.");
    if (action === "about") return window.alert("ShiftFit V2\nYour shift-friendly fitness, nutrition and progress companion.");
    if (action === "notifications") return window.alert("Notification controls will be available here when reminders are enabled.");
    if (action === "appearance") return window.alert("ShiftFit V2 keeps its current theme across the app. Appearance controls will be added without changing the V2 design.");
    if (action === "privacy") return window.alert("Your ShiftFit data is stored for your account and app features. Full privacy controls are coming soon.");
    if (action === "account") return window.alert("Account & sync controls will be expanded as ShiftFit V2 moves toward full account sync.");
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
    </AppLayout>
  );
}
