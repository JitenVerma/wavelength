import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#fb7185_0%,#f59e0b_45%,#818cf8_100%)] text-white shadow-[0_18px_40px_rgba(244,114,182,0.25)] hover:brightness-105",
  secondary:
    "border border-white/60 bg-white/75 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:bg-white",
  ghost: "bg-transparent text-slate-700 hover:bg-white/60",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
          buttonVariants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
