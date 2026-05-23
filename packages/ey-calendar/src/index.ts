// Main Components
export {
  Calendar as EyCalendar,
  CalendarToolbar as EyCalendarToolbar,
  DayView,
  WeekView,
  MonthView,
  PlanningView,
} from "./components";

export type {
  EyCalendarProps,
  CalendarToolbarProps,
  DayViewProps,
  WeekViewProps,
  MonthViewProps,
  PlanningViewProps,
} from "./components";

// Default Components
export { DefaultButton, DefaultBadge } from "./components/defaults";

// Contexts
export { EyCalendarProvider } from "./context/CompositeEyCalendarContext";
export { EventsProvider } from "./context/EventsContext";
export { ViewProvider } from "./context/ViewContext";
export { OptionsProvider } from "./context/OptionsContext";
export { CallbacksProvider } from "./context/CallbacksContext";
export { DragDropProvider } from "./context/DragDropContext";

// Hooks
export {
  useEyCalendarView,
  useTimeCalculations,
  useDragAndDrop,
  useContainerHeight,
  useEyCalendarClasses,
  useEyCalendarLabels,
  useEyCalendarComponents,
} from "./hooks";

export type {
  UseContainerHeightOptions,
  UseContainerHeightResult,
  UseEyCalendarClassesOptions,
  GetEyCalendarClass,
} from "./hooks";

// Types
export type {
  ViewMode,
  TimeFormat,
  GridGranularity,
  ConflictStrategy,
  EyCalendarEvent,
  EventPosition,
  EventColumn,
  EventFieldMapping,
  EyCalendarEventData,
  TimeSlotConfig,
  TimeSlot,
  DateRange,
  ConflictGroup,
  ConflictResolution,
  DropTarget,
  PositionCalculation,
  AnimationConfig,
  EyCalendarActivationEvent,
  EyCalendarOptions,
  EyCalendarColorTheme,
  EyCalendarCallbacks,
  EyCalendarClassKey,
  EyCalendarClassNames,
  EyCalendarThemeClasses,
  EyCalendarLabels,
  EyCalendarComponents,
  DefaultButtonProps,
  DefaultBadgeProps,
  IconProps,
  DragMovePayload,
  DragResizePayload,
  DragPayload,
  WeekDayDropPayload,
  MonthDropPayload,
  DropPayload,
} from "./types";

// Utils
export { cn } from "./utils/cn";

// Themes
export { DEFAULT_CALENDAR_THEME, EMPTY_CALENDAR_THEME, resolveTheme } from "./themes";

// Locales
export { enCalendar, enLabels, frCalendar, frLabels, deCalendar, deLabels } from "./locales";
