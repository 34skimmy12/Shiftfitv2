import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Dumbbell, UtensilsCrossed, ShoppingCart, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/train", label: "Train", icon: Dumbbell },
  { to: "/fuel", label: "Meals", icon: UtensilsCrossed },
  { to: "/shopping", label: "Shop", icon: ShoppingCart },
  { to: "/stats", label: "Progress", icon: LineChart },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-5">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-[hsl(180_10%_5%_/_0.94)] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {TABS.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
            const Icon = t.icon;
            return <Link key={t.to} to={t.to} className={cn("no-tap-highlight flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[9px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className={cn("h-[17px] w-[17px]", active && "scale-105")} strokeWidth={active ? 2.5 : 1.9} />
              <span className="truncate">{t.label}</span>
            </Link>;
          })}
        </div>
      </nav>
    </div>
  </div>;
}
