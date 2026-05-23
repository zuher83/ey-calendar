/**
 * Default labels for calendar text content
 * Author: Zuher ELMAS de l'équipe Emoory
 */

/**
 * Calendar labels type for internationalization
 */
export interface EyCalendarLabels {
  // Planning View
  planningToday: string;
  planningPast: string;
  planningNoEvents: string;
  planningEmptyTitle: string;
  planningEmptyText: string;
  planningEventCount: (count: number) => string;

  // Event Display
  allDay: string;
  eventBullet: string;

  // Time & Duration
  timeFormat: string;
  durationSeparator: string;

  // Days
  today: string;
  past: string;

  // General
  noEvents: string;
  viewHeadStatic: string;
  ariaCalendar: string;
  ariaCalendarToolbar: string;
  ariaEvent: (title: string) => string;
  ariaMoreEvents: (count: number) => string;
  ariaViewAnnouncement: (viewLabel: string, currentLabel: string, eventCount: number) => string;

  // Navigation
  navNextMonth: string;
  navPreviousMonth: string;
  navNextWeek: string;
  navPreviousWeek: string;
  navNextDay: string;
  navPreviousDay: string;
  navNextPeriod: string;
  navPreviousPeriod: string;
  navToday: string;

  // View Labels
  viewMonth: string;
  viewWeek: string;
  viewDay: string;
  viewPlanning: string;
}

/**
 * Default English labels
 */
export const DEFAULT_LABELS: EyCalendarLabels = {
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
  ariaCalendar: "Calendar",
  ariaCalendarToolbar: "Calendar toolbar",
  ariaEvent: (title: string) => `Event: ${title}`,
  ariaMoreEvents: (count: number) => `Show ${count} more events`,
  ariaViewAnnouncement: (viewLabel: string, currentLabel: string, eventCount: number) =>
    `${viewLabel}. ${currentLabel}. ${eventCount === 0 ? "No events" : `${eventCount} event${eventCount > 1 ? "s" : ""}`}`,

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
