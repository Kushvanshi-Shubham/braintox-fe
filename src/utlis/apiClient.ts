import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { BACKEND_URL } from "../config";
import toast from "react-hot-toast";

// Request queue to prevent overwhelming the backend
let pendingRequests = 0;
const MAX_CONCURRENT_REQUESTS = 10;
const requestQueue: Array<() => void> = [];

function processQueue() {
  if (requestQueue.length > 0 && pendingRequests < MAX_CONCURRENT_REQUESTS) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

// Create axios instance with connection pooling
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // Increased to 30s
  headers: {
    "Content-Type": "application/json",
  },
  maxRedirects: 5,
  // Enable HTTP keep-alive for connection reuse
  httpAgent: undefined,
  httpsAgent: undefined,
});

// Request interceptor - add auth token and queue management
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    pendingRequests++;
    
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    pendingRequests--;
    processQueue();
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally and manage queue
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    pendingRequests--;
    processQueue();
    return response;
  },
  (error: AxiosError) => {
    pendingRequests--;
    processQueue();
    
    // Network error - backend is down
    if (!error.response) {
      console.warn("⚠️ Backend is unreachable. Request failed:", error.config?.url);
      // Don't show toast for every failed request - let components handle it
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response.status === 401) {
      const currentPath = globalThis.location.pathname;
      // Only redirect if not already on login/signup pages
      if (currentPath !== "/login" && currentPath !== "/signup" && currentPath !== "/") {
        console.warn("🔐 Session expired. Redirecting to login...");
        localStorage.removeItem("token");
        globalThis.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      toast.error("You don't have permission to perform this action");
    }

    // Handle 402 Payment Required — free-plan quota hit
    if (error.response.status === 402) {
      const data = error.response.data as { message?: string } | undefined;
      toast.error(data?.message || "You've hit a Free plan limit. Upgrade to Pro to continue.", {
        duration: 6000,
      });
    }

    // Handle 500 Internal Server Error
    if (error.response.status === 500) {
      console.error("❌ Server error:", error.response.data);
      toast.error("Something went wrong on the server. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
