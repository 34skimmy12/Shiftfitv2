import React, { useState } from "react";
import { ArrowLeft, Bluetooth, Watch, Smartphone, Activity, CheckCircle2, ChevronRight, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const devices = [
  { name: "Apple Health", description: "Steps, activity, workouts and health data", icon: Smartphone, status: "mobile" },
  { name: "Apple Watch", description: "Sync activity and workout data", icon: Watch, status: "mobile" },
  { name: "Garmin", description: "Connect your Garmin fitness data", icon: Activity, status: "planned" },
  { name: "Fitbit", description: "Sync steps, activity and workouts", icon: Activity, status: "planned" },
  { name: "Strava", description: "Import your workouts and activities", icon: Activity, status: "planned" },
  { name: "Other trackers", description: "More device integrations coming soon", icon: Bluetooth, status: "planned" },
];

export default function Connections() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const openConnection = (device) => setSelected(device);

  return (
    <AppLayout>
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card" aria-label="Back to Settings"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-xl font-extrabold">Connect & Sync</h1><p className="text-xs text-muted-foreground">Connect your watches and fitness trackers to ShiftFit.</p></div>
      </div>
      <div className="mb-5 rounded-2xl border border-primary/40 bg-card p-4 glow-cyan"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Bluetooth className="h-5 w-5" /></div><div><div className="text-sm font-bold">Your activity, automatically synced</div><div className="text-xs text-muted-foreground">Choose a device below to see its ShiftFit connection options.</div></div></div></div>
      <div className="space-y-3">{devices.map((device) => { const Icon = device.icon; return <button key={device.name} type="button" onClick={() => openConnection(device)} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/40"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div><div className="text-sm font-semibold">{device.name}</div><div className="text-xs text-muted-foreground">{device.description}</div></div></div><div className="flex items-center gap-2 text-primary"><span className="text-[10px] font-bold uppercase tracking-wide">Connect</span><ChevronRight className="h-4 w-4" /></div></button>; })}</div>
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /><span>Connections will only be used to bring your activity data into ShiftFit.</span></div>
      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="connection-title"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"><div className="mb-4 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><selected.icon className="h-5 w-5" /></div><div><h2 id="connection-title" className="text-base font-extrabold">Connect {selected.name}</h2><p className="text-xs text-muted-foreground">ShiftFit connection setup</p></div></div><button type="button" onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary" aria-label="Close"><X className="h-4 w-4" /></button></div>{selected.status === "mobile" ? <><div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-6"><strong>Mobile connection ready for the next integration step.</strong><div className="mt-1 text-xs text-muted-foreground">The web app cannot directly request Apple Health or Apple Watch permissions. ShiftFit will need a native iPhone bridge before live health data can be imported.</div></div><button type="button" onClick={() => setSelected(null)} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Got it</button></> : <><div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm leading-6"><strong>Integration coming next.</strong><div className="mt-1 text-xs text-muted-foreground">The ShiftFit connection screen is ready. Live account linking for {selected.name} requires its OAuth/API integration and secure server-side credentials.</div></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ExternalLink className="h-4 w-4" /> No account credentials are collected by this screen.</div><button type="button" onClick={() => setSelected(null)} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Close</button></>}</div></div>}
    </AppLayout>
  );
}
