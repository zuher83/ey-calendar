// View-related types for the Calendar component
// src/components/ey-calendar/types/views.ts

import type { ViewMode } from "./base";
import type { TimeSlotConfig } from "./time";

/**
 * Configuration for a specific view
 */
export interface ViewConfig {
  mode: ViewMode;
  timeSlots: TimeSlotConfig;
  showWeekends: boolean;
  showTimeAxis: boolean;
  showResourceAxis: boolean;
  showAllDayEvents: boolean;
  virtualizeThreshold: number;
  minEventHeight: number;
  maxEventsPerSlot?: number;
  compactMode?: boolean;
}

/**
 * Date range configuration
 */
export interface DateRange {
  start: Date;
  end: Date;
}
