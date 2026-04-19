import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "dark";
  padding?: "sm" | "md" | "lg";
}

export default function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-tbwr-charcoal border border-[#444]",
    gold: "bg-tbwr-charcoal border-2 border-tbwr-gold",
    dark: "bg-[#111] border border-[#222]",
  };

  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
