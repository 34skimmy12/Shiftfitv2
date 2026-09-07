import { useCallback } from "react";
export function useToast() {
  const toast = useCallback(({ title, description }) => {
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("shiftfit-toast", { detail: { title, description } }));
  }, []);
  return { toast };
}
