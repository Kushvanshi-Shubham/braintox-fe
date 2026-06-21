import { useState, useEffect } from "react";

interface AvatarProps {
  profilePic?: string | null;
  username: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showOnlineIndicator?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
  "2xl": "w-32 h-32",
};

const textClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
  "2xl": "text-4xl",
};

// Deterministic gradient per username so a user's fallback avatar is stable.
const GRADIENTS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-fuchsia-500 to-purple-600",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-blue-500",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export const Avatar = ({
  profilePic,
  username,
  size = "md",
  className = "",
  showOnlineIndicator = false,
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profilePic]);

  const hasImage = !!profilePic && profilePic.trim() !== "" && !imgError;
  const initial = (username?.trim()?.charAt(0) || "?").toUpperCase();
  const frame = "rounded-full border-2 border-white/70 dark:border-gray-800 ring-2 ring-purple-400/40";

  return (
    <div className={`relative inline-block ${className}`}>
      {hasImage ? (
        <img
          src={profilePic as string}
          alt={`${username}'s avatar`}
          className={`${sizeClasses[size]} ${frame} object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        // Clean gradient-initial fallback (replaces the old generated image).
        <div
          className={`${sizeClasses[size]} ${textClasses[size]} ${frame} bg-gradient-to-br ${gradientFor(
            username || "?"
          )} flex items-center justify-center font-bold text-white select-none`}
          aria-label={`${username}'s avatar`}
        >
          {initial}
        </div>
      )}
      {showOnlineIndicator && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
      )}
    </div>
  );
};
