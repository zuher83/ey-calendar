// Main types export file - Facade for all calendar types
// src/components/ey-calendar/types/index.ts

// Re-export all types from modular files
export type * from "./base";
export type * from "./events";
export type * from "./resources";
export type * from "./time";
export type * from "./views";
export type * from "./conflicts";
export type * from "./state";
export type * from "./props";
export type * from "./headless";
export type * from "./components";

// Also export interfaces (not just types)
export type {
  // Base
  ViewMode,
  TimeFormat,
  GridGranularity,
  ConflictStrategy,
} from "./base";

export type {
  // Events
  EyCalendarEvent,
  EventPosition,
  EventColumn,
  EventFieldMapping,
  EyCalendarEventData,
} from "./events";

export type {
  // Resources
  EyCalendarResource,
  WorkingHours,
  DaySchedule,
  ResourceFieldMapping,
} from "./resources";

export type {
  // Time
  TimeSlotConfig,
  TimeSlot,
} from "./time";

export type {
  // Views
  ViewConfig,
  DateRange,
} from "./views";

export type {
  // Conflicts
  ConflictGroup,
  ConflictResolution,
} from "./conflicts";

export type {
  // State
  EyCalendarState,
  DropTarget,
  PositionCalculation,
  AnimationConfig,
} from "./state";

export type {
  // Props & Options
  EyCalendarOptions,
  EyCalendarColorTheme,
  EyCalendarCallbacks,
  EyCalendarProps,
} from "./props";

export type {
  // Headless
  EyCalendarClassKey,
  EyCalendarClassNames,
  EyCalendarThemeClasses,
  EyCalendarLabels,
  EyCalendarComponents,
} from "./headless";

export type {
  // Components
  DefaultButtonProps,
  DefaultBadgeProps,
  IconProps,
} from "./components";

export type {
  // DnD payloads
  DragMovePayload,
  DragResizePayload,
  DragPayload,
  WeekDayDropPayload,
  MonthDropPayload,
  DropPayload,
} from "./dnd";
