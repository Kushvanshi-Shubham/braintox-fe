import React, { useEffect, useState } from "react";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { motion, AnimatePresence } from "framer-motion";

export const BackendStatusNotification: React.FC = () => {
  const { isBackendHealthy } = useBackendHealth();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!isBackendHealthy) {
      // Wait 5s before showing — prevents false positives during backend cold starts
      // or brief network hiccups when switching tabs / opening the app
      timer = setTimeout(() => setShowNotification(true), 5000);
    } else {
      // Delay hiding to show "back online" message
      timer = setTimeout(() => setShowNotification(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isBackendHealthy]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            isBackendHealthy
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isBackendHealthy ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold">
                {isBackendHealthy
                  ? "Backend is back online!"
                  : "Backend is currently unavailable"}
              </p>
              {!isBackendHealthy && (
                <p className="text-sm opacity-90">
                  Some features may not work. Trying to reconnect...
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
