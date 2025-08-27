import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[--primary] text-[--primary-fg] border border-[--primary] hover:opacity-90",
  secondary:
    "bg-[--bg-muted] text-[--fg] border border-[--border] hover:bg-[--bg]",
  danger:
    "bg-[--danger] text-[--primary-fg] border border-[--danger] hover:opacity-90",
  ghost:
    "bg-transparent text-[--fg] border border-transparent hover:bg-[--bg-muted]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const cls = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
  return <button {...props} className={cls} />;
}
