import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, UtensilsCrossed, Sparkles, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/train", label: "Workouts", icon: Dumbbell },
  { to: "/fuel", label: "Meals", icon: UtensilsCrossed },
  { to: "/coach", label: "Coach", icon: Sparkles },
  { to: "/stats", label: "Progress", icon: LineChart },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <main className="flex-1 overflow-x-hidden px-5 pb-28 pt-6">{children}</main>
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border glass px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center justify-around">
            {TABS.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "no-tap-highlight flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} strokeWidth={active ? 2.4 : 2} />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
