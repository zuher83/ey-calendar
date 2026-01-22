// Theme exports and resolver for EY Calendar
// src/themes/index.ts

import type { EyCalendarThemeClasses } from "../types";

// ============================================================================
// EMPTY DEFAULT THEME
// The library now uses standalone CSS files (ey-calendar.css)
// Themes are now optional overlays for users who want Tailwind-based styling
// ============================================================================

/**
 * Empty default theme - no additional classes
 * Visual styles are now handled by the standalone CSS files
 */
export const DEFAULT_CALENDAR_THEME: EyCalendarThemeClasses = {};

// ============================================================================
// THEME RESOLVER
// ============================================================================

/**
 * Resolves a theme identifier or object to a theme configuration.
 *
 * @param theme - Theme name string or custom theme object
 * @returns Resolved theme classes or empty object for default mode
 *
 * @example
 * // Use default theme (empty, CSS handles styling)
 * const theme = resolveTheme('default');
 *
 * // Use custom theme (e.g., Tailwind classes overlay)
 * const theme = resolveTheme({ eventBar: 'custom-event-class' });
 *
 * // No theme specified (returns empty)
 * const theme = resolveTheme(undefined);
 */
export function resolveTheme(
  theme?: string | EyCalendarThemeClasses
): EyCalendarThemeClasses | undefined {
  // No theme specified - return empty default
  if (theme === undefined) {
    return DEFAULT_CALENDAR_THEME;
  }

  // Custom theme object - return as-is
  if (typeof theme === "object") {
    return theme;
  }

  // Named theme
  switch (theme) {
    case "default":
      return DEFAULT_CALENDAR_THEME;
    // Future: Users can import Tailwind theme from examples/themes/tailwind.ts
    // and pass it as a custom theme object
    default:
      // Unknown theme name - fall back to empty default
      return DEFAULT_CALENDAR_THEME;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DEFAULT_CALENDAR_THEME as EMPTY_CALENDAR_THEME };
// Re-export types from central types file
export type { EyCalendarThemeClasses } from "../types";
