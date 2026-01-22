// Time-related types for the Calendar component
// src/components/ey-calendar/types/time.ts

import type { GridGranularity, TimeFormat } from "./base";

/**
 * Time slot configuration
 */
export interface TimeSlotConfig {
  duration: number; // Duration in minutes (15, 30, 60, etc.)
  startHour: number; // Working hours start (0-23) - for visual highlight only
  endHour: number; // Working hours end (0-23) - for visual highlight only
  format: TimeFormat; // Display format
  granularity: GridGranularity; // Grid granularity for display
  showMinutes?: boolean; // Show minutes
  stepMinutes?: number; // Movement step (default: duration)
}

/**
 * Individual time slot
 */
export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  index: number;
  isWorkingTime?: boolean;
  isAvailable?: boolean;
}
