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
export * from "./hooks";

// Types - Export all types
export type * from "./types";

// Utils
export { cn } from "./utils/cn";
export * from "./utils/dateUtils";
export * from "./utils/eventUtils";
export * from "./utils/conflictUtils";
export * from "./utils/slotUtils";

// Themes
export * from "./themes";

// Locales
export { enCalendar, enLabels, frCalendar, frLabels, deCalendar, deLabels } from "./locales";
