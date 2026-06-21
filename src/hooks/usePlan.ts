import { useState, useEffect, useCallback } from "react";
import apiClient from "../utlis/apiClient";

export interface PlanInfo {
  plan: "free" | "pro";
  role: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  limits: {
    maxSaves: number | null; // null = unlimited
    maxCollections: number | null;
    aiPerMonth: number | null;
  };
  usage: { saves: number; collections: number; ai: number };
}

/**
 * Fetches the logged-in user's plan, limits, and usage from /api/v1/plan.
 * No-ops (no fetch) when there's no auth token, so it's safe on public pages.
 */
export function usePlan() {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient
      .get("/api/v1/plan")
      .then((r) => {
        setPlan(r.data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { plan, loading, error, refresh };
}
