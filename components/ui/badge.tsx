import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-primary text-white",
        secondary:
          "border-transparent bg-surface-subtle text-text-secondary",
        verified:
          "border-transparent bg-feedback-success-bg text-feedback-success-text font-semibold",
        warning:
          "border-transparent bg-feedback-warning-bg text-feedback-warning-text",
        error:
          "border-transparent bg-feedback-error-bg text-feedback-error-text",
        info:
          "border-transparent bg-feedback-info-bg text-feedback-info-text",
        outline: "text-text-primary border border-border-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
