// src/ui/Button.tsx
import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** API nueva */
  variant?: ButtonVariant;
  /** âš ï¸ Compat: API antigua que usan los Step* (kindâ‰¡variant) */
  kind?: ButtonVariant;
  size?: ButtonSize;
};

export function Button(props: ButtonProps) {
  const {
    variant,
    kind,
    size = "md",
    className,
    disabled,
    ...rest
  } = props;

  const intent: ButtonVariant = (variant ?? kind ?? "secondary");

  const base =
    "inline-flex items-center justify-center rounded-2xl border transition " +
    "focus:outline-none focus:ring-2 ring-[--ring] " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-5 text-base",
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[--primary] text-[--primary-fg] border-transparent hover:opacity-90",
    secondary:
      "bg-[--bg-muted] text-[--fg] border-[--border] hover:bg-[--card]",
    danger:
      "bg-[--danger] text-white border-transparent hover:opacity-90",
    ghost:
      "bg-transparent text-[--fg] border-transparent hover:bg-[--bg-muted]",
  };

  const classes = [
    base,
    sizes[size],
    variants[intent],
    className ?? "",
  ].join(" ");

  return <button className={classes} disabled={disabled} {...rest} />;
}



