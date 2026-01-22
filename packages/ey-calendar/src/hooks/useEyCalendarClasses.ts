// Hook for merging calendar classes with 3-level priority
// src/components/ey-calendar/hooks/useEyCalendarClasses.ts

import { useMemo } from "react";
import { DEFAULT_CALENDAR_CLASSES } from "../styles/classes";
import { resolveTheme } from "../themes";
import type { EyCalendarClassKey, EyCalendarClassNames, EyCalendarThemeClasses } from "../types";
import { cn } from "../utils/cn";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for the calendar classes hook
 */
export interface UseEyCalendarClassesOptions {
  /**
   * Theme to apply. Can be:
   * - 'default' (uses DEFAULT_CALENDAR_THEME)
   * - Custom theme object with partial overrides
   */
  theme?: string | EyCalendarThemeClasses;

  /**
   * If true, only structural classes are applied (no colors, borders, shadows).
   * Useful when you want complete control over styling.
   */
  unstyled?: boolean;

  /**
   * Custom class overrides for any element.
   * These have the highest priority and will override both
   * structural classes and theme classes.
   */
  classNames?: EyCalendarClassNames;
}

/**
 * Function returned by the hook to get merged classes for a key
 */
export type GetEyCalendarClass = (key: EyCalendarClassKey) => string;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook that provides a function to get merged classes for calendar elements.
 *
 * The merge follows a 3-level priority system:
 * 1. Structural classes (always applied) - from styles/classes.ts
 * 2. Theme classes (if !unstyled) - from themes/default.ts
 * 3. Custom classNames (highest priority) - from props
 *
 * @param options - Theme, unstyled flag, and custom classNames
 * @returns Function to get merged classes by key
 *
 * @example
 * ```tsx
 * function Calendar({ theme, unstyled, classNames }: EyCalendarProps) {
 *   const getClass = useEyCalendarClasses({ theme, unstyled, classNames });
 *
 *   return (
 *     <div className={getClass('root')}>
 *       <div className={getClass('toolbar')}>
 *         // ...
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEyCalendarClasses(
  options: UseEyCalendarClassesOptions = {}
): GetEyCalendarClass {
  const { theme, unstyled = false, classNames = {} } = options;

  // Resolve the active theme (memoized)
  const activeTheme = useMemo(() => {
    if (unstyled) {
      return undefined;
    }

    return resolveTheme(theme);
  }, [theme, unstyled]);

  // Create the class getter function (memoized)
  const getClass = useMemo(() => {
    return (key: EyCalendarClassKey): string => {
      // Level 1: Structural classes (always applied)
      const structuralClass = DEFAULT_CALENDAR_CLASSES[key] || "";

      // Level 2: Theme classes (if not unstyled)
      const themeClass = activeTheme?.[key] || "";

      // Level 3: Custom overrides (highest priority)
      const customClass = classNames[key] || "";

      // Merge all levels using cn() for proper Tailwind deduplication
      return cn(structuralClass, themeClass, customClass);
    };
  }, [activeTheme, classNames]);

  return getClass;
}
