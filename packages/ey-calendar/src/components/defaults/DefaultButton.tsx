// Default Button component for EY Calendar
// src/components/ey-calendar/components/defaults/DefaultButton.tsx

import React from "react";
import type { DefaultButtonProps } from "../../types";
import { cn } from "../../utils/cn";

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Default button component for the calendar.
 * Can be replaced via the `components` prop for custom styling.
 *
 * @example
 * ```tsx
 * <DefaultButton variant="nav" onClick={handlePrevious}>
 *   <ChevronLeftIcon />
 * </DefaultButton>
 * ```
 */
export const DefaultButton = React.forwardRef<HTMLButtonElement, DefaultButtonProps>(
  ({ variant = "default", size = "default", className, children, ...props }, ref) => {
    // Map variant to ey-cal-* class
    const variantClasses: Record<string, string> = {
      default: "ey-cal-button",
      outline: "ey-cal-button",
      ghost: "ey-cal-button ey-cal-button-ghost",
      nav: "ey-cal-button-nav",
      today: "ey-cal-button ey-cal-button-today",
      view: "ey-cal-button-view",
      viewActive: "ey-cal-button-view ey-cal-button-view-active",
    };

    // Map size to ey-cal-* class
    const sizeClasses: Record<string, string> = {
      default: "",
      sm: "ey-cal-button-sm",
      lg: "ey-cal-button-lg",
      icon: "ey-cal-button-icon",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(variantClasses[variant], sizeClasses[size], className)}
        data-eycalendar-button
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DefaultButton.displayName = "DefaultButton";
