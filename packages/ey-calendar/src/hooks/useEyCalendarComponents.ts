/**
 * Hook to merge default and custom components for icon overrides
 * Author: Zuher ELMAS de l'équipe Emoory
 */

import { useMemo } from "react";
import { DEFAULT_COMPONENTS, type EyCalendarComponents } from "../constants/components";

/**
 * Merged components type (always has all required components)
 */
type MergedCalendarComponents = Required<EyCalendarComponents>;

/**
 * Merges default components with custom user-provided components.
 * Custom components take precedence over defaults.
 *
 * @param customComponents - Optional custom components to override defaults
 * @returns Merged components object with all icon components (guaranteed non-undefined)
 *
 * @example
 * ```tsx
 * // With lucide-react
 * import { MapPin, RefreshCw, Calendar } from 'lucide-react';
 * const Components = useEyCalendarComponents({
 *   LocationIcon: MapPin,
 *   RecurringIcon: RefreshCw,
 *   EmptyStateIcon: Calendar
 * });
 *
 * // Usage in JSX
 * <Components.LocationIcon />
 * ```
 */
export function useEyCalendarComponents(
  customComponents?: Partial<EyCalendarComponents>
): MergedCalendarComponents {
  return useMemo(() => {
    if (!customComponents) {
      return DEFAULT_COMPONENTS;
    }

    // Merge defaults with custom components
    return {
      ...DEFAULT_COMPONENTS,
      ...customComponents,
    } as MergedCalendarComponents;
  }, [customComponents]);
}
