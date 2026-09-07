import React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef(({ className, type="text", ...props }, ref) => <input ref={ref} type={type} className={cn("flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground", className)} {...props} />);
Input.displayName = "Input";
