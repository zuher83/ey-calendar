/**
 * Locale to Labels Mapping
 *
 * Automatically maps date-fns locale to corresponding UI labels.
 * This enables automatic label selection based on the locale prop.
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import type { Locale } from "date-fns";
import { de, enUS, fr } from "date-fns/locale";
import type { EyCalendarLabels } from "../constants/labels";
import { deLabels } from "../locales/de";
import { enLabels } from "../locales/en";
import { frLabels } from "../locales/fr";

/**
 * Mapping between date-fns locales and calendar labels
 */
const LOCALE_TO_LABELS = new Map<Locale, EyCalendarLabels>([
  [fr, frLabels],
  [de, deLabels],
  [enUS, enLabels],
]);

/**
 * Get labels for a given locale
 * Falls back to English if locale is not found
 *
 * @param locale - date-fns locale object
 * @returns Corresponding calendar labels
 */
export function getLabelsForLocale(locale?: Locale): EyCalendarLabels | undefined {
  if (!locale) return undefined;

  return LOCALE_TO_LABELS.get(locale);
}

/**
 * Check if a locale is supported
 *
 * @param locale - date-fns locale object
 * @returns true if locale has corresponding labels
 */
export function isLocaleSupported(locale: Locale): boolean {
  return LOCALE_TO_LABELS.has(locale);
}
