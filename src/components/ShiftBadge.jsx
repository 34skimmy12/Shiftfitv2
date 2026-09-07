import React from "react";
import { SHIFT_META } from "@/lib/fitnessUtils";
import { cn } from "@/lib/utils";

export default function ShiftBadge({ shift, className }) {
  const meta = SHIFT_META[shift] || SHIFT_META.rest;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium", meta.color, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
