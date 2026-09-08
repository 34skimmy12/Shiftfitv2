import React from "react";
import { ArrowLeft, Bluetooth, Watch, Smartphone, Activity, CheckCircle2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const devices = [
  { name: "Apple Health", description: "Steps, activity, workouts and health data", icon: Smartphone },
  { name: "Apple Watch", description: "Sync activity and workout data", icon: Watch },
  { name: "Garmin", description: "Connect your Garmin fitness data", icon: Activity },
  { name: "Fitbit", description: "Sync steps, activity and workouts", icon: Activity },
  { name: "Strava", description: "Import your workouts and activities", icon: Activity },
  { name: "Other trackers", description: "More device integrations coming soon", icon: Bluetooth },
];

export default function Connections() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold">Connect & Sync</h1>
          <p className="text-xs text-muted-foreground">Connect your watches and fitness trackers to ShiftFit.</p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-primary/40 bg-card p-4 glow-cyan">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Bluetooth className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-bold">Your activity, automatically synced</div>
            <div className="text-xs text-muted-foreground">Connect a device below to bring your steps and workouts into ShiftFit.</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {devices.map(({ name, description, icon: Icon }) => (
          <button key={name} type="button" onClick={() => {}} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <div><div className="text-sm font-semibold">{name}</div><div className="text-xs text-muted-foreground">{description}</div></div>
            </div>
            <div className="flex items-center gap-2 text-primary"><span className="text-[10px] font-bold uppercase tracking-wide">Connect</span><ChevronRight className="h-4 w-4" /></div>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        <span>Connections will only be used to bring your activity data into ShiftFit.</span>
      </div>
    </AppLayout>
  );
}
