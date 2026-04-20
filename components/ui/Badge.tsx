import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "white" | "charcoal" | "success" | "warning" | "info";
}

export default function Badge({
  variant = "gold",
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    gold: "bg-tbwr-gold text-tbwr-black",
    white: "bg-tbwr-white text-tbwr-black",
    charcoal: "bg-tbwr-charcoal text-tbwr-white border border-[#555]",
    success: "bg-green-900 text-green-300 border border-green-700",
    warning: "bg-yellow-900 text-yellow-300 border border-yellow-700",
    info: "bg-blue-900 text-blue-300 border border-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-block text-xs font-bold uppercase tracking-widest px-3 py-1",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
