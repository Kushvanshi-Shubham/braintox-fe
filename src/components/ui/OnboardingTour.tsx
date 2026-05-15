import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../../config";

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    async function checkStatus() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${BACKEND_URL}/api/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && !res.data.hasCompletedOnboarding) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status", error);
      }
    }
    // Small delay to let the app load first
    const timer = setTimeout(checkStatus, 1500);
    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = async () => {
    setIsVisible(false);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/api/v1/onboarding/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to save onboarding completion", error);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      completeOnboarding();
    } else {
      setStep(s => s + 1);
    }
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "Welcome to Braintox! 🧠",
      description: "Ready to build your digital brain? The quickest way to start is by adding a bookmark. Click the + button at the top to save your first link.",
      position: "fixed top-20 right-4 sm:right-20"
    },
    {
      title: "Organize Everything 📁",
      description: "Group your saved links into Collections. You can even make them public to share with others!",
      position: "fixed top-40 left-4 sm:left-72" // Assumes sidebar is open on desktop
    },
    {
      title: "Discover Ideas 🌍",
      description: "Not sure what to save? Explore the community feed to see what other smart people are reading.",
      position: "fixed top-60 left-4 sm:left-72"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
        onClick={completeOnboarding}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`pointer-events-auto p-5 sm:p-6 w-[90%] sm:w-80 rounded-2xl bg-white dark:bg-gray-800 shadow-[0_20px_40px_rgba(168,85,247,0.3)] border border-purple-200 dark:border-purple-800/50 ${steps[step].position}`}
        >
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-purple-500" : "w-1.5 bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {steps[step].title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {steps[step].description}
          </p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={completeOnboarding}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Skip tour
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
            >
              {step === 2 ? "Get Started" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
