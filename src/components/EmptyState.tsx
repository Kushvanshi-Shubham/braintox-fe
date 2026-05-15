import { motion } from "framer-motion";
import { cn } from "../utlis/cn";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12",
        "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
        "rounded-3xl border border-white/60 dark:border-gray-800/60 shadow-xl shadow-purple-500/5",
        "w-full max-w-lg mx-auto my-8",
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse-glow" />
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-purple-500 dark:text-purple-400 w-12 h-12">
            {icon}
          </div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      
      {action && (
        <div className="mt-2 active-scale">
          {action}
        </div>
      )}
    </motion.div>
  );
}
