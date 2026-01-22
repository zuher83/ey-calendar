import {
  differenceInHours,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  type Locale,
} from "date-fns";

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Format a time according to the requested format
 *
 * @param date - Date to format
 * @param locale - Optional date-fns locale for formatting
 * @param timeFormat - Time format ('12h' or '24h', defaults to '24h')
 * @returns Formatted time string
 */
export function formatTime(date: Date, locale?: Locale, timeFormat: "12h" | "24h" = "24h"): string {
  const pattern = timeFormat === "12h" ? "h:mm a" : "HH:mm";

  return format(date, pattern, { locale });
}

/**
 * Formats the duration of an event
 */
export function formatDuration(start: Date, end: Date): string {
  const hours = differenceInHours(end, start);
  const minutes = differenceInMinutes(end, start) % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

// ============================================================================
// INTERVAL UTILITIES
// ============================================================================

/**
 * Checks if two date ranges overlap
 */
export function doDateRangesOverlap(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean {
  return isBefore(range1.start, range2.end) && isAfter(range1.end, range2.start);
}
