"use client";

import { cn } from "@/lib/utils";

type ButtonKind = "primary" | "green" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  icon?: React.ReactNode;
  full?: boolean;
}

const kindClasses: Record<ButtonKind, string> = {
  primary:
    "bg-accent text-white shadow-btn-accent disabled:bg-soft disabled:text-mut2 disabled:shadow-none",
  green: "bg-green text-white shadow-btn-green",
  outline: "bg-card text-ink border border-line",
  ghost: "bg-soft text-ink",
};

export function Button({
  kind = "primary",
  icon,
  full = true,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-btn font-body font-bold text-base px-[18px] py-[15px]",
        "transition-transform duration-100 active:scale-[0.98] cursor-pointer disabled:cursor-default",
        "select-none",
        full ? "w-full" : "w-auto",
        kindClasses[kind],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
