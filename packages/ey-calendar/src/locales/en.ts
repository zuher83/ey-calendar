/**
 * English Calendar Configuration
 *
 * Pre-configured calendar options for English language support.
 * Combines date-fns English locale with English UI labels.
 *
 * @example
 * ```typescript
 * import { enCalendar, enLabels } from '@/components/ey-calendar';
 *
 * // Use pre-configured helper
 * <Calendar {...enCalendar} events={events} />
 *
 * // Or use labels separately
 * <Calendar locale={enUS} labels={enLabels} events={events} />
 * ```
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import { enUS as dateFnsEn } from "date-fns/locale";
import type { EyCalendarLabels, EyCalendarOptions } from "../types";

/**
 * English UI labels for calendar interface
 */
export const enLabels: EyCalendarLabels = {
  // Planning View
  planningToday: "Today",
  planningPast: "Past",
  planningNoEvents: "No events scheduled",
  planningEmptyTitle: "No events",
  planningEmptyText: "Your planning is empty for now",
  planningEventCount: (count: number) => `${count} event${count > 1 ? "s" : ""}`,

  // Event Display
  allDay: "All Day",
  eventBullet: "•",

  // Time & Duration
  timeFormat: "HH:mm",
  durationSeparator: "•",

  // Days
  today: "Today",
  past: "Past",

  // General
  noEvents: "No events",
  viewHeadStatic: "Even.",
  // Navigation
  navNextMonth: "Next month",
  navPreviousMonth: "Previous month",
  navNextWeek: "Next week",
  navPreviousWeek: "Previous week",
  navNextDay: "Next day",
  navPreviousDay: "Previous day",
  navNextPeriod: "Next period",
  navPreviousPeriod: "Previous period",
  navToday: "Today",

  // View Labels
  viewMonth: "Month",
  viewWeek: "Week",
  viewDay: "Day",
  viewPlanning: "Planning",
};

/**
 * English calendar configuration helper
 *
 * Provides both locale (for date formatting) and labels (for UI strings)
 * in English language. Can be spread directly into Calendar component or
 * extended with custom options.
 *
 * @example
 * ```typescript
 * // Basic usage
 * <Calendar {...enCalendar} events={myEvents} />
 *
 * // With custom theme
 * <Calendar {...enCalendar} theme="custom" events={myEvents} />
 * ```
 */
export const enCalendar: Partial<EyCalendarOptions> = {
  locale: dateFnsEn,
  labels: enLabels,
};
