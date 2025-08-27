import React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium border transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 " +
    "dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
  secondary:
    "border-gray-300 bg-white text-gray-900 hover:bg-gray-100 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "border-transparent bg-transparent text-gray-700 hover:bg-gray-100 " +
    "dark:text-zinc-200 dark:hover:bg-zinc-800",
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const cls = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
  return <button {...props} className={cls} />;
}
