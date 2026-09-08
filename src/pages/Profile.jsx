import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserRound, Target, Clock3, LogOut, Pencil, Camera } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    base44.entities.UserProfile.list().then((rows) => setProfile(rows[0] || null));
  }, []);

  if (!profile) return <Splash />;

  const logout = async () => {
    if (!supabase) return;
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage("Couldn’t log out. Try again.");
      setLoggingOut(false);
      return;
    }
    navigate("/login", { replace: true });
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile?.id) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage("Please choose an image under 4MB.");
      return;
    }
    setPhotoBusy(true);
    setMessage("");
    try {
      const dataUrl = await resizeImage(file);
      const updated = await base44.entities.UserProfile.update(profile.id, { profile_photo: dataUrl });
      setProfile(updated);
      setMessage("Profile photo updated.");
    } catch {
      setMessage("Couldn’t update the photo. Try another image.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const goalLabel = profile.goal === "lose" ? "Lose weight" : profile.goal === "gain" ? "Build muscle" : "Maintain";
  const shiftLabel = profile.shift_pattern === "fixed_day" ? "Fixed day" : profile.shift_pattern === "fixed_night" ? "Fixed night" : "Rotating";
  const workDays = (profile.work_days || []).map((d) => d.slice(0, 1).toUpperCase() + d.slice(1, 3)).join(" • ") || "Not set";
  const avatar = profile.profile_photo ? <img src={profile.profile_photo} alt="Profile" className="h-full w-full object-cover" /> : profile.full_name?.[0]?.toUpperCase();

  return <AppLayout>
    <div className="mb-5 flex items-center gap-3">
      <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button>
      <div className="flex-1"><h1 className="text-xl font-bold">Profile</h1><p className="text-xs text-muted-foreground">Your ShiftFit profile and plan setup</p></div>
    </div>

    <section className="mb-4 rounded-2xl border border-primary/30 bg-card p-5 glow-cyan">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-secondary text-2xl font-bold text-primary" aria-label="Change profile photo">
          {avatar}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/65 py-1 text-[9px] font-bold uppercase tracking-wide text-white"><Camera className="mr-1 h-3 w-3" />{photoBusy ? "Saving" : "Change"}</span>
        </button>
        <div className="min-w-0">
          <div className="truncate text-xl font-extrabold">{profile.full_name || "ShiftFit Member"}</div>
          <div className="mt-1 text-xs text-muted-foreground">Your photo appears on your Home profile card too.</div>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-bold text-primary">Upload profile photo</button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
    </section>

    <button type="button" onClick={() => navigate("/onboarding")} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Pencil className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><div className="text-sm font-bold">Edit profile & plan setup</div><div className="mt-1 text-xs text-muted-foreground">Change your personal details, goal, nutrition, shifts and training.</div></div>
      <span className="text-sm font-semibold text-primary">Edit</span>
    </button>

    <InfoCard icon={UserRound} title="Personal profile">
      <Row label="Name" value={profile.full_name || "Not set"} />
      <Row label="Age" value={profile.age ? `${profile.age} years` : "Not set"} />
      <Row label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : "Not set"} />
      <Row label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : "Not set"} />
    </InfoCard>

    <InfoCard icon={Target} title="Current goal">
      <Row label="Goal" value={goalLabel} />
      <Row label="Calories" value={profile.calorie_target ? `${profile.calorie_target} kcal/day` : "Not set"} />
      <Row label="Protein" value={profile.protein_target ? `${profile.protein_target} g/day` : "Not set"} />
    </InfoCard>

    <InfoCard icon={Clock3} title="Shift schedule">
      <Row label="Pattern" value={shiftLabel} />
      <Row label="Work days" value={workDays} />
      {profile.shift_start_date && <Row label="Start date" value={profile.shift_start_date} />}
    </InfoCard>

    {message && <div className="mb-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">{message}</div>}

    <div className="pb-4">
      <Button variant="outline" className="w-full" disabled={loggingOut} onClick={logout}><LogOut className="mr-2 h-4 w-4" />{loggingOut ? "Logging out…" : "Log out"}</Button>
    </div>
  </AppLayout>;
}

async function resizeImage(file) {
  const src = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const size = Math.min(640, image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function InfoCard({ icon: Icon, title, children }) {
  return <section className="mb-4 rounded-2xl border border-border bg-card p-4">
    <div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><h2 className="text-sm font-bold">{title}</h2></div>
    <div className="space-y-2">{children}</div>
  </section>;
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 px-3 py-2.5"><span className="text-xs text-muted-foreground">{label}</span><span className="text-right text-sm font-medium">{value}</span></div>;
}

function Splash() { return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" /></div>; }
