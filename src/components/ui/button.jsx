import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:brightness-105",
  outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
  ghost: "hover:bg-secondary",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-105",
};
const sizes = { default: "h-10 px-4 py-2", sm: "h-9 rounded-lg px-3", lg: "h-11 rounded-xl px-8", icon: "h-10 w-10" };

export function Button({ className, variant="default", size="default", ...props }) {
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 no-tap-highlight", variants[variant], sizes[size], className)} {...props} />;
}
