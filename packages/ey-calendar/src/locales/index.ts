/**
 * Calendar Locale Configurations
 *
 * Pre-configured calendar options for different languages.
 * Each export combines date-fns locale with corresponding UI labels
 * for a complete internationalization setup.
 *
 * @example
 * ```typescript
 * import { frCalendar, deCalendar, enCalendar } from '@/components/ey-calendar';
 *
 * // French calendar
 * <Calendar {...frCalendar} events={events} />
 *
 * // German calendar
 * <Calendar {...deCalendar} events={events} />
 *
 * // English calendar
 * <Calendar {...enCalendar} events={events} />
 * ```
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

export { frCalendar, frLabels } from "./fr";
export { deCalendar, deLabels } from "./de";
export { enCalendar, enLabels } from "./en";
