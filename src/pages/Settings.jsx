import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Bell, Moon, Shield, Smartphone, ChevronRight } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return <AppLayout>
    <div className="mb-5 flex items-center gap-3">
      <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button>
      <div><h1 className="text-xl font-bold">Settings</h1><p className="text-xs text-muted-foreground">Manage your ShiftFit preferences</p></div>
    </div>

    <section className="mb-4 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-bold">Preferences</h2>
      <SettingToggle icon={Bell} title="Notifications" description="Reminders and daily activity updates" checked={notifications} onChange={setNotifications} />
      <SettingToggle icon={Moon} title="Dark mode" description="Use the ShiftFit dark appearance" checked={darkMode} onChange={setDarkMode} />
    </section>

    <section className="mb-4 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-bold">Connections</h2>
      <button type="button" onClick={() => navigate("/connections")} className="flex w-full items-center justify-between rounded-xl bg-secondary/50 p-3 text-left hover:bg-secondary">
        <div className="flex items-center gap-3"><Smartphone className="h-4 w-4 text-primary" /><div><div className="text-sm font-semibold">Watches & trackers</div><div className="text-xs text-muted-foreground">Apple Health, Garmin, Fitbit, Strava & more</div></div></div>
        <ChevronRight className="h-4 w-4 text-primary" />
      </button>
    </section>

    <section className="mb-6 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-bold">Privacy & security</h2>
      <button type="button" className="flex w-full items-center justify-between rounded-xl bg-secondary/50 p-3 text-left hover:bg-secondary">
        <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-primary" /><div><div className="text-sm font-semibold">Privacy & data</div><div className="text-xs text-muted-foreground">Review how ShiftFit handles your data</div></div></div>
        <ChevronRight className="h-4 w-4 text-primary" />
      </button>
    </section>
  </AppLayout>;
}

function SettingToggle({ icon: Icon, title, description, checked, onChange }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0">
    <div className="flex min-w-0 items-center gap-3"><Icon className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><div className="text-sm font-semibold">{title}</div><div className="text-xs text-muted-foreground">{description}</div></div></div>
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "left-6" : "left-1"}`} /></button>
  </div>;
}
