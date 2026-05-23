// Tailwind CSS Theme for EY Calendar
//
// IMPORTANT: Requires Tailwind CSS to be installed and configured in your project.

import type { EyCalendarClassKey } from "@emoory/ey-calendar";

// ============================================================================
// TAILWIND THEME - Visual styles using Tailwind classes
// ============================================================================

export const tailwindTheme: Partial<Record<EyCalendarClassKey, string>> = {
  // -------------------------------------------------------------------------
  // ROOT CONTAINER
  // -------------------------------------------------------------------------
  root: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",

  // -------------------------------------------------------------------------
  // TOOLBAR
  // -------------------------------------------------------------------------
  toolbar: "p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50",
  toolbarNavigation: "",
  toolbarTitle: "text-lg font-semibold text-gray-900 dark:text-gray-100",
  toolbarViewSelector:
    "bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 rounded",

  // -------------------------------------------------------------------------
  // BUTTONS
  // -------------------------------------------------------------------------
  button:
    "rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer",
  buttonNav:
    "h-8 w-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors cursor-pointer",
  buttonToday: "px-3 py-1 text-sm cursor-pointer",
  buttonView:
    "px-3 py-1 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-l last:rounded-r transition-colors",
  buttonViewActive: "bg-indigo-500 text-white hover:bg-indigo-600",

  // -------------------------------------------------------------------------
  // VIEW CONTAINER
  // -------------------------------------------------------------------------
  viewContainer: "",

  // -------------------------------------------------------------------------
  // WEEK VIEW
  // -------------------------------------------------------------------------
  weekView: "",
  weekViewContainer: "",
  weekHeader: "border-b border-gray-200 dark:border-gray-700",
  weekHeaderGrid: "",
  weekHeaderDay:
    "gap-1.5 p-1.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0 sm:gap-2 sm:p-2 capitalize",
  weekHeaderDayName: "text-xs",
  weekHeaderDayNumber: "h-6 w-6 text-xs",
  weekHeaderDayNumberToday: "text-white bg-indigo-600 font-semibold",
  weekHeaderDayClickable: "transition-colors",
  weekGrid: "",
  weekGridInner: "",
  weekTimeColumn: "border-r border-gray-200 dark:border-gray-700",
  weekTimeSlot: "border-b border-gray-200 dark:border-gray-700 pt-1 pr-0.5 sm:pr-1",
  weekTimeSlotText: "text-xs text-gray-500 dark:text-gray-400",
  weekDayColumn: "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
  weekDayColumnHidden: "",
  weekHourCell:
    "border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
  weekEventsContainer: "border-r border-gray-200 dark:border-gray-700 last:border-r-0 px-1",
  weekEventWrapper: "px-1",
  weekEventWrapperConflict: "px-0.5",
  weekAllDaySection: "border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
  weekAllDayLabel: "text-xs text-gray-500 dark:text-gray-400",
  weekAllDayColumn: "",
  weekAllDayColumnHidden: "",
  weekAllDayEventBar: "px-2 text-xs font-medium transition-opacity hover:opacity-90",
  weekAllDayEventBarFull: "",
  weekAllDayEventBarStart: "",
  weekAllDayEventBarEnd: "",
  weekAllDayEventBarMiddle: "",
  weekAllDayEventBarContent: "",
  weekDayColumnInner: "",

  // -------------------------------------------------------------------------
  // DAY VIEW
  // -------------------------------------------------------------------------
  dayView: "",
  dayHeader: "p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
  dayContent: "",
  dayGrid: "",
  dayTimeColumn: "border-r border-gray-200 dark:border-gray-700",
  dayTimeSlot: "border-b border-gray-200 dark:border-gray-700 pt-1 pr-1",
  dayTimeSlotText: "text-xs text-gray-500 dark:text-gray-400",
  dayMainColumn: "",
  daySlotCell: "",
  daySlotCellHour:
    "border-t border-gray-300 dark:border-gray-600 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
  dayEventsContainer: "px-2",
  dayEventWrapper: "",
  dayAllDaySection: "border-b border-gray-200 dark:border-gray-700",
  dayAllDayEventBar: "shadow-sm",
  dayCurrentTimeLine: "",
  dayCurrentTimeLineInner: "bg-indigo-300",
  dayCurrentTimeLineDot: "h-[2px] w-3 rounded-full bg-indigo-300",
  dayCurrentTimeLineBar: "h-[2px] bg-indigo-300",

  // -------------------------------------------------------------------------
  // MONTH VIEW
  // -------------------------------------------------------------------------
  monthView: "",
  monthHeader: "border-l border-gray-200 dark:border-gray-700",
  monthHeaderGrid:
    "divide-gray-200 border-b border-gray-200 dark:divide-gray-700 dark:border-gray-700",
  monthHeaderDay: "p-2.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0 sm:flex-row",
  monthHeaderDayText: "text-sm font-medium text-gray-500 dark:text-gray-300",
  monthHeaderDayBorder: "border-r border-gray-200 dark:border-gray-700",
  monthGrid: "border-t border-l border-gray-200 dark:border-gray-700",
  monthDayCell:
    "px-2 py-1 border-r border-b border-gray-200 dark:border-gray-700 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800/20 max-lg:items-center",
  monthDayNumber: "h-5 w-5 rounded-full text-xs font-semibold",
  monthDayNumberClickable: "hover:ring-2 hover:ring-indigo-500/50 transition-shadow",
  monthEventsContainer: "mt-1",
  monthEventsDesktop: "",
  monthEventsList: "",
  monthEventsListInner: "space-y-1",
  monthEventItem:
    "min-h-[20px] max-h-[20px] rounded px-1 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
  monthEventItemTime: "text-gray-500 dark:text-gray-400",
  monthEventItemTitle: "text-gray-900 dark:text-gray-100",
  monthEventDot: "mt-0.5 h-2 w-2 rounded-full",
  monthEventDotMobile: "sm:hidden",
  monthEventContent: "",
  monthEventTime: "text-xs font-medium",
  monthEventTimeText: "text-gray-600 dark:text-gray-400",
  monthEventTitle: "text-gray-500 dark:text-gray-400",
  monthMoreEvents: "mt-auto pt-1 pl-3.5 text-xs text-gray-400 dark:text-gray-500",
  monthWeekRow: "border-b border-gray-100 dark:border-gray-700 last:border-b-0",
  monthWeekNumberCell:
    "w-8 pt-1 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
  monthWeekNumber: "text-xs text-gray-400 dark:text-gray-500 font-medium",
  monthHeaderWeekNumberCell:
    "w-8 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
  monthEventBar: "px-1 text-xs font-medium shadow-sm transition-opacity hover:opacity-90",
  monthEventBarTime: "opacity-80",
  monthEventBarTitle: "",
  monthEventsLayer: "",
  monthSingleDayEventsContainer: "",
  monthEventItemWrapper:
    "right-0.5 left-0.5 rounded px-1 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
  monthEventItemDot: "h-2 w-2",

  // -------------------------------------------------------------------------
  // PLANNING VIEW
  // -------------------------------------------------------------------------
  planningView: "",
  planningScrollContainer: "bg-gray-50 dark:bg-gray-900",
  planningContent: "",
  planningDateGroup: "",
  planningDateHeader:
    "px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800",
  planningDateHeaderTitle: "text-sm font-medium text-gray-900 dark:text-gray-100",
  planningDateHeaderSubtitle: "text-xs text-gray-500 dark:text-gray-400",
  planningEventsList: "space-y-2 px-6 py-3",
  planningNoEvents: "text-sm text-gray-500 dark:text-gray-400 italic",
  planningEmpty: "h-64",
  planningEmptyContainer: "text-center",
  planningEmptyIcon: "mb-4 text-6xl text-gray-400 dark:text-gray-600",
  planningEmptyTitle: "mb-2 text-lg font-medium text-gray-900 dark:text-gray-100",
  planningEmptyText: "text-gray-500 dark:text-gray-400",

  // -------------------------------------------------------------------------
  // EVENT BAR
  // -------------------------------------------------------------------------
  eventBar:
    "rounded-md border border-current/20 hover:brightness-110 active:brightness-95 transition-all duration-200 ease-in-out",
  eventContent: "p-0 gap-1",
  eventContentCompact: "px-1",
  eventContentMinimal: "px-2 py-0.5 items-start",
  eventContentFull: "p-1",
  eventHeader: "",
  eventTitle: "text-xs font-semibold",
  eventTime: "text-xs",
  eventTimeResizing: "font-semibold text-green-600 dark:text-green-400",
  eventDescription: "text-xs",
  eventLocation: "text-xs",
  eventLocationText: "",
  eventResizeHandle: "h-1 bg-current opacity-0 hover:opacity-50",
  eventResizeHandleTop: "cursor-n-resize",
  eventResizeHandleBottom: "cursor-s-resize",
  eventRecurringIndicator: "top-1 right-1",
  eventRecurringIcon: "h-3 w-3 bg-current opacity-60",
  eventRecurringIconText: "text-[8px] font-bold",
  eventConflictIndicator: "ml-2",
  eventConflictIndicatorCompact: "h-2 w-2 bg-current opacity-75",
  eventConflictDot: "h-2 w-2 bg-yellow-400",

  // -------------------------------------------------------------------------
  // EVENT CARD (Planning view)
  // -------------------------------------------------------------------------
  eventCard:
    "rounded-lg border border-gray-200 dark:border-gray-700 p-3 transition-all hover:shadow-md bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
  eventCardHeader: "",
  eventCardContent: "space-x-3",
  eventCardTime: "space-x-2 text-sm",
  eventCardTimeText: "font-medium text-gray-900 dark:text-gray-100",
  eventCardTimePast: "font-medium text-gray-500 dark:text-gray-400",
  eventCardDuration: "ml-2 text-xs text-gray-500 dark:text-gray-400",
  eventCardDurationPast: "ml-2 text-xs text-gray-400 dark:text-gray-500",
  eventCardTitle: "ml-3 font-medium text-gray-900 dark:text-gray-100",
  eventCardTitlePast: "ml-3 font-medium text-gray-600 dark:text-gray-500",
  eventCardIndicators: "ml-2 space-x-1",
  eventCardAllDay:
    "rounded bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200",
  eventCardRecurring: "text-sm text-gray-400 dark:text-gray-500",
  eventCardDescription: "mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400",
  eventCardDescriptionPast: "mt-2 line-clamp-2 text-sm text-gray-400 dark:text-gray-500",
  eventCardLocation: "mt-2 text-sm text-gray-500 dark:text-gray-400",
  eventCardLocationPast: "mt-2 line-clamp-2 text-sm text-gray-400 dark:text-gray-500",
  eventCardLocationIcon: "mr-1",
  eventCardLocationText: "",

  // -------------------------------------------------------------------------
  // STATES
  // -------------------------------------------------------------------------
  eventSelected: "ring-2 ring-blue-500 ring-opacity-50",
  eventDragging: "shadow-lg z-50 opacity-60",
  eventConflict: "ring-1 ring-yellow-400/50",
  eventHovered: "shadow-md",
  eventPast:
    "[&>*:not([data-eycalendar-resize-handle]):not([data-eycalendar-recurring])]:opacity-70",
  eventCompact: "min-h-[20px]",
  eventMinimal: "min-h-[24px]",
  eventFull: "min-h-[32px]",

  // -------------------------------------------------------------------------
  // DAY STATES
  // -------------------------------------------------------------------------
  dayTodayWrapper: "",
  dayToday: "bg-indigo-600 text-white font-medium",
  dayCurrent: "text-gray-900 dark:text-gray-100",
  dayOutsideMonth: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  dayPast: "opacity-75",
  dayWeekend: "",
  dayWorkingHours: "bg-gray-50 dark:bg-gray-900",

  // -------------------------------------------------------------------------
  // ICONS
  // -------------------------------------------------------------------------
  icon: "",
  iconChevron: "",
};

export default tailwindTheme;
