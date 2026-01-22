/**
 * Hook to merge default and custom labels for internationalization
 * Author: Zuher ELMAS de l'équipe Emoory
 */

import { useMemo } from "react";
import type { Locale } from "date-fns";
import { DEFAULT_LABELS } from "../constants/labels";
import type { EyCalendarLabels } from "../types";
import { getLabelsForLocale } from "../utils/localeMapping";

/**
 * Merges default labels with custom user-provided labels.
 * If a locale is provided without custom labels, it will automatically
 * select the appropriate labels based on the locale.
 *
 * Priority order:
 * 1. Custom labels (highest priority)
 * 2. Labels matched from locale
 * 3. Default labels (fallback)
 *
 * @param customLabels - Optional custom labels to override defaults
 * @param locale - Optional date-fns locale to auto-select labels
 * @returns Merged labels object with all required properties
 *
 * @example
 * ```tsx
 * // Auto-detect labels from locale
 * import { fr } from 'date-fns/locale';
 * const labels = useEyCalendarLabels(undefined, fr); // Uses French labels
 *
 * // With custom labels (manual override)
 * const labels = useEyCalendarLabels({ planningToday: 'Custom Today' });
 *
 * // Mix both: locale-based + custom overrides
 * const labels = useEyCalendarLabels({ planningToday: 'Hoy' }, es);
 * ```
 */
export function useEyCalendarLabels(
  customLabels?: Partial<EyCalendarLabels>,
  locale?: Locale
): EyCalendarLabels {
  return useMemo(() => {
    // Start with default labels
    let baseLabels = DEFAULT_LABELS;

    // If locale is provided, try to get matching labels
    if (locale) {
      const localeLabels = getLabelsForLocale(locale);
      if (localeLabels) {
        baseLabels = localeLabels;
      }
    }

    // If no custom labels, return base labels (default or locale-matched)
    if (!customLabels) {
      return baseLabels;
    }

    // Merge base labels with custom overrides
    return {
      ...baseLabels,
      ...customLabels,
    };
  }, [customLabels, locale]);
}
