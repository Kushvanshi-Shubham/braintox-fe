import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../../utlis/cn";
import { Spinner } from "./Spinner";

const baseStyle = cn(
  "inline-flex items-center justify-center font-semibold",
  "transition-all duration-200 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400",
  "dark:focus-visible:ring-offset-gray-900",
  "active-scale"
);

const variantStyles = {
  primary: cn(
    "bg-gradient-to-r from-purple-600 to-pink-600",
    "hover:from-purple-700 hover:to-pink-700",
    "text-white shadow-lg shadow-purple-500/25",
    "hover:shadow-xl hover:shadow-purple-500/30"
  ),
  secondary: cn(
    "bg-white dark:bg-gray-800",
    "hover:bg-gray-50 dark:hover:bg-gray-700",
    "text-gray-800 dark:text-gray-200",
    "border border-gray-200 dark:border-gray-600",
    "shadow-sm hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/20"
  ),
  ghost: cn(
    "bg-transparent",
    "hover:bg-gray-100 dark:hover:bg-gray-700/50",
    "text-gray-700 dark:text-gray-300"
  ),
  danger: cn(
    "bg-gradient-to-r from-red-500 to-rose-600",
    "hover:from-red-600 hover:to-rose-700",
    "text-white shadow-lg shadow-red-500/25",
    "hover:shadow-xl hover:shadow-red-500/40"
  ),
};

const sizeStyles = {
  sm: "py-2 px-4 text-sm rounded-xl gap-1.5",
  md: "py-2.5 px-5 text-base rounded-xl gap-2",
  lg: "py-3.5 px-7 text-lg rounded-2xl gap-2.5",
};



export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  text?: string;
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  loadingText?: string; 
  fullWidth?: boolean;
}



export const Button = ({
  className,
  variant,
  size = "md",
  text,
  children,
  startIcon,
  endIcon,
  loading = false,
  loadingText = "Loading...",
  fullWidth,
  disabled, 
  ...props
}: ButtonProps) => {
  const content = children || text;
  const isDisabled = loading || disabled;

  return (
    <button
      className={cn(
        baseStyle,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        isDisabled && "opacity-60 cursor-not-allowed pointer-events-none",
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2" aria-live="polite">
          <Spinner />
          {content && <span>{loadingText}</span>}
        </span>
      ) : (
        <>
          {startIcon && <span className="flex items-center">{startIcon}</span>}
          {content}
          {endIcon && <span className="flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};
