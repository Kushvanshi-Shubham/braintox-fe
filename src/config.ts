// Backend API URL configuration
// Falls back to the production backend so a build without VITE_BACKEND_URL
// (e.g. a misconfigured Vercel env) still works instead of hitting localhost.
// For local dev, .env sets VITE_BACKEND_URL=http://localhost:3000.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://braintox-be.onrender.com";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";