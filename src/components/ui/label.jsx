import React from "react";
export function Label({ className="", children, ...props }) { return <label className={`text-sm font-medium leading-none ${className}`} {...props}>{children}</label>; }
