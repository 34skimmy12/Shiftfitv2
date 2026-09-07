import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { const list = await base44.entities.UserProfile.list(); setProfile(list[0] || null); }
    catch { setProfile(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { profile, loading, reload: load };
}
