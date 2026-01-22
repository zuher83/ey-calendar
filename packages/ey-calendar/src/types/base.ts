// Base types for the Calendar component
// src/components/ey-calendar/types/base.ts

/**
 * Available view modes for the calendar
 */
export type ViewMode = "month" | "week" | "day" | "planning";

/**
 * Available time formats
 */
export type TimeFormat = "12h" | "24h";

/**
 * Grid granularity for time slots
 */
export type GridGranularity = "hour" | "half-hour" | "quarter-hour";

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy =
  | "intelligent-overlay"
  | "side-by-side"
  | "stack"
  | "compress"
  | "manual";
