import axios from "axios";
import { BACKEND_URL } from "../config";

export class BackendHealthService {
  private static instance: BackendHealthService;
  private isBackendHealthy: boolean = true;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly listeners: Set<(isHealthy: boolean) => void> = new Set();

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
    // Check backend health every 10 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/status`, {
          timeout: 3000,
        });
        
        if (response.status === 200 && this.isBackendHealthy === false) {
          console.log("✅ Backend is back online!");
          this.setBackendHealth(true);
        } else if (!this.isBackendHealthy) {
          this.setBackendHealth(true);
        }
      } catch {
        if (this.isBackendHealthy) {
          console.error("❌ Backend is down or unreachable");
          this.setBackendHealth(false);
        }
      }
    }, 10000);
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
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/status`, {
        timeout: 3000,
      });
      const isHealthy = response.status === 200;
      this.setBackendHealth(isHealthy);
      return isHealthy;
    } catch {
      this.setBackendHealth(false);
      return false;
    }
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
