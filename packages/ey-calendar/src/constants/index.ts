import type { EyCalendarOptions, GridGranularity, TimeFormat, TimeSlotConfig } from "../types";

// ============================================================================
// LAYOUT AND DIMENSIONING CONSTANTS
// ============================================================================

/**
 * Default hour cell height in pixels.
 * This value is used for all positioning calculations.
 */
export const DEFAULT_HOUR_CELL_HEIGHT = 64;

// ============================================================================
// VIEW MODES
// ============================================================================

/**
 * Default time slot configuration
 */
export const DEFAULT_TIME_SLOT_CONFIG: TimeSlotConfig = {
  duration: 60, // 60 minutes (1 hour)
  startHour: 8, // 8:00 AM - working hours start (visual highlight)
  endHour: 18, // 6:00 PM - working hours end (visual highlight)
  format: "24h" as TimeFormat,
  granularity: "quarter-hour" as GridGranularity, // Quarter-hour grid for precise resizing
  showMinutes: true,
  stepMinutes: 15, // Move by 15-minute increments for precision
};

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

/**
 * Default calendar options
 */
export const DEFAULT_OPTIONS: EyCalendarOptions = {
  // Default view
  defaultView: "week",
  defaultDate: new Date(),

  timeSlots: DEFAULT_TIME_SLOT_CONFIG,

  // Display
  showWeekends: true,
  showToday: true,
  highlightToday: true,
  showWeekNumbers: false,
  showToolbar: true,

  // Layout
  width: "100%",
  height: 600,
  autoHeight: false,
  cellHeight: DEFAULT_HOUR_CELL_HEIGHT,

  // Interactions
  readonly: false,
  enableDragDrop: true,
  enableResize: true,
  enableCreate: true,
  enableDelete: true,

  // Conflicts
  conflictStrategy: "side-by-side",
  allowOverlaps: false,
  maxEventsPerSlot: undefined,

  // Performance
  debounceMs: 100,

  // Internationalization
  locale: undefined,

  // Styling
  className: "",
  unstyled: false,

  // Headless
  theme: undefined,
  classNames: undefined,
  components: undefined,
  labels: undefined,
};
