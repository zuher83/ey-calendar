/**
 * French Calendar Configuration
 *
 * Pre-configured calendar options for French language support.
 * Combines date-fns French locale with French UI labels.
 *
 * @example
 * ```typescript
 * import { frCalendar, frLabels } from '@/components/ey-calendar';
 *
 * // Use pre-configured helper
 * <Calendar {...frCalendar} events={events} />
 *
 * // Or use labels separately
 * <Calendar locale={fr} labels={frLabels} events={events} />
 * ```
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import { fr as dateFnsFr } from "date-fns/locale";
import type { EyCalendarLabels, EyCalendarOptions } from "../types";

/**
 * French UI labels for calendar interface
 */
export const frLabels: EyCalendarLabels = {
  // Planning View
  planningToday: "Aujourd'hui",
  planningPast: "Passé",
  planningNoEvents: "Aucun événement prévu",
  planningEmptyTitle: "Aucun événement",
  planningEmptyText: "Votre planning est vide pour le moment",
  planningEventCount: (count: number) => `${count} événement${count > 1 ? "s" : ""}`,

  // Event Display
  allDay: "Toute la journée",
  eventBullet: "•",

  // Time & Duration
  timeFormat: "HH:mm",
  durationSeparator: "•",

  // Days
  today: "Aujourd'hui",
  past: "Passé",

  // General
  noEvents: "Aucun événement",
  viewHeadStatic: "Évén.",

  // Navigation
  navNextMonth: "Mois suivant",
  navPreviousMonth: "Mois précédent",
  navNextWeek: "Semaine suivante",
  navPreviousWeek: "Semaine précédente",
  navNextDay: "Jour suivant",
  navPreviousDay: "Jour précédent",
  navNextPeriod: "Période suivante",
  navPreviousPeriod: "Période précédente",
  navToday: "Aujourd'hui",

  // View Labels
  viewMonth: "Mois",
  viewWeek: "Semaine",
  viewDay: "Jour",
  viewPlanning: "Planning",
};

/**
 * French calendar configuration helper
 *
 * Provides both locale (for date formatting) and labels (for UI strings)
 * in French language. Can be spread directly into Calendar component or
 * extended with custom options.
 *
 * @example
 * ```typescript
 * // Basic usage
 * <Calendar {...frCalendar} events={myEvents} />
 *
 * // With custom theme
 * <Calendar {...frCalendar} theme="custom" events={myEvents} />
 * ```
 */
export const frCalendar: Partial<EyCalendarOptions> = {
  locale: dateFnsFr,
  labels: frLabels,
};
