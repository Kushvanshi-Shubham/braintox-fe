import { memo } from "react";
import { cn } from "../../utlis/cn";

export const Skeleton = memo(({ className, variant = "rounded" }: { className?: string, variant?: "circular" | "rounded" | "text" }) => {
  return (
    <div
      className={cn(
        "skeleton",
        {
          "rounded-full": variant === "circular",
          "rounded-xl": variant === "rounded",
          "rounded-md": variant === "text",
        } as Record<string, boolean>,
        className
      )}
    />
  );
});

Skeleton.displayName = "Skeleton";

const CardSkeleton = memo(() => {
  return (
    <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 w-full max-w-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="text" className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton variant="circular" className="h-7 w-7" />
          <Skeleton variant="circular" className="h-7 w-7" />
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <Skeleton variant="text" className="h-6 w-5/6" />
        <Skeleton variant="text" className="h-6 w-2/3" />
      </div>

      <div className="flex gap-2 mb-3">
        <Skeleton variant="rounded" className="h-5 w-16" />
        <Skeleton variant="rounded" className="h-5 w-20" />
      </div>

      <div className="rounded-lg overflow-hidden mt-auto">
        <Skeleton variant="rounded" className="w-full h-32" />
      </div>
    </div>
  );
});

CardSkeleton.displayName = "CardSkeleton";

const ContentGridSkeleton = memo(({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
});

ContentGridSkeleton.displayName = "ContentGridSkeleton";

export { CardSkeleton, ContentGridSkeleton };
