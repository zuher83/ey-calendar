/**
 * German Calendar Configuration
 *
 * Pre-configured calendar options for German language support.
 * Combines date-fns German locale with German UI labels.
 *
 * @example
 * ```typescript
 * import { deCalendar, deLabels } from '@/components/ey-calendar';
 *
 * // Use pre-configured helper
 * <Calendar {...deCalendar} events={events} />
 *
 * // Or use labels separately
 * <Calendar locale={de} labels={deLabels} events={events} />
 * ```
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import { de as dateFnsDe } from "date-fns/locale";
import type { EyCalendarLabels, EyCalendarOptions } from "../types";

/**
 * German UI labels for calendar interface
 */
export const deLabels: EyCalendarLabels = {
  // Planning View
  planningToday: "Heute",
  planningPast: "Vergangen",
  planningNoEvents: "Keine Termine geplant",
  planningEmptyTitle: "Keine Termine",
  planningEmptyText: "Ihre Planung ist derzeit leer",
  planningEventCount: (count: number) => `${count} Termin${count > 1 ? "e" : ""}`,

  // Event Display
  allDay: "Ganztägig",
  eventBullet: "•",

  // Time & Duration
  timeFormat: "HH:mm",
  durationSeparator: "•",

  // Days
  today: "Heute",
  past: "Vergangen",

  // General
  noEvents: "Keine Termine",
  viewHeadStatic: "Term.",
  ariaCalendar: "Kalender",
  ariaCalendarToolbar: "Kalender-Werkzeugleiste",
  ariaEvent: (title: string) => `Termin: ${title}`,
  ariaMoreEvents: (count: number) => `Weitere ${count} Termine anzeigen`,
  ariaViewAnnouncement: (viewLabel: string, currentLabel: string, eventCount: number) =>
    `${viewLabel}. ${currentLabel}. ${eventCount === 0 ? "Keine Termine" : `${eventCount} Termin${eventCount > 1 ? "e" : ""}`}`,

  // Navigation
  navNextMonth: "Nächster Monat",
  navPreviousMonth: "Vorheriger Monat",
  navNextWeek: "Nächste Woche",
  navPreviousWeek: "Vorherige Woche",
  navNextDay: "Nächster Tag",
  navPreviousDay: "Vorheriger Tag",
  navNextPeriod: "Nächste Periode",
  navPreviousPeriod: "Vorherige Periode",
  navToday: "Heute",

  // View Labels
  viewMonth: "Monat",
  viewWeek: "Woche",
  viewDay: "Tag",
  viewPlanning: "Planung",
};

/**
 * German calendar configuration helper
 *
 * Provides both locale (for date formatting) and labels (for UI strings)
 * in German language. Can be spread directly into Calendar component or
 * extended with custom options.
 *
 * @example
 * ```typescript
 * // Basic usage
 * <Calendar {...deCalendar} events={myEvents} />
 *
 * // With custom theme
 * <Calendar {...deCalendar} theme="custom" events={myEvents} />
 * ```
 */
export const deCalendar: Partial<EyCalendarOptions> = {
  locale: dateFnsDe,
  labels: deLabels,
};
