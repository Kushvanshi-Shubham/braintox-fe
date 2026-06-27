import axios from "axios";
import { BACKEND_URL } from "../config";

export class BackendHealthService {
  private static instance: BackendHealthService;
  private isBackendHealthy: boolean = true;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly listeners: Set<(isHealthy: boolean) => void> = new Set();
  // Render free tier is sluggish; require a few consecutive failures before
  // showing the "backend down" banner so a single slow poll doesn't trip it.
  private consecutiveFailures = 0;
  private readonly failureThreshold = 3;
  private readonly timeoutMs = 8000;

  private constructor() {
    this.startHealthCheck();
  }

  static getInstance(): BackendHealthService {
    if (!BackendHealthService.instance) {
      BackendHealthService.instance = new BackendHealthService();
    }
    return BackendHealthService.instance;
  }

  private startHealthCheck() {
    // Poll every 20s (gentler than 10s, fewer false positives on a slow tier)
    this.healthCheckInterval = setInterval(() => {
      void this.ping();
    }, 20000);
  }

  // Single health probe. Recovers immediately on success; only flips to "down"
  // after `failureThreshold` consecutive failures so transient slowness or one
  // cold-start hiccup doesn't flash the banner.
  private async ping(): Promise<boolean> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/status`, {
        timeout: this.timeoutMs,
      });
      if (response.status === 200) {
        if (!this.isBackendHealthy) console.log("✅ Backend is back online!");
        this.consecutiveFailures = 0;
        this.setBackendHealth(true);
        return true;
      }
      return this.isBackendHealthy;
    } catch {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.failureThreshold && this.isBackendHealthy) {
        console.error("❌ Backend is down or unreachable");
        this.setBackendHealth(false);
      }
      return false;
    }
  }

  private setBackendHealth(isHealthy: boolean) {
    if (this.isBackendHealthy !== isHealthy) {
      this.isBackendHealthy = isHealthy;
      this.notifyListeners(isHealthy);
    }
  }

  private notifyListeners(isHealthy: boolean) {
    for (const listener of this.listeners) {
      listener(isHealthy);
    }
  }

  subscribe(callback: (isHealthy: boolean) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  getBackendHealth(): boolean {
    return this.isBackendHealthy;
  }

  async checkNow(): Promise<boolean> {
    return this.ping();
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Initialize the singleton when imported
export const backendHealthService = BackendHealthService.getInstance();
