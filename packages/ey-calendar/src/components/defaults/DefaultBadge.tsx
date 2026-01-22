import React from "react";
import type { DefaultBadgeProps } from "../../types";
import { cn } from "../../utils/cn";

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Default badge component for the calendar.
 * Used for event indicators, counters, and status labels.
 * Can be replaced via the `components` prop for custom styling.
 *
 * @example
 * ```tsx
 * <DefaultBadge variant="info">All Day</DefaultBadge>
 * <DefaultBadge variant="warning" size="sm">3</DefaultBadge>
 * ```
 */
export const DefaultBadge = React.forwardRef<HTMLSpanElement, DefaultBadgeProps>(
  ({ variant = "default", size = "default", className, children, ...props }, ref) => {
    // Build class list using ey-cal-* namespace
    const sizeClass = size === "sm" ? "ey-cal-badge-sm" : size === "lg" ? "ey-cal-badge-lg" : "";
    const variantClass = `ey-cal-badge-${variant}`;

    return (
      <span
        ref={ref}
        className={cn("ey-cal-badge", sizeClass, variantClass, className)}
        data-eycalendar-badge
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </span>
    );
  }
);

DefaultBadge.displayName = "DefaultBadge";
