// Main types export file - Facade for all calendar types
// src/components/ey-calendar/types/index.ts

// Explicit public type surface
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
  // Time
  TimeSlotConfig,
  TimeSlot,
} from "./time";

export type {
  // Views
  DateRange,
} from "./views";

export type {
  // Conflicts
  ConflictGroup,
  ConflictResolution,
} from "./conflicts";

export type {
  // State
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
