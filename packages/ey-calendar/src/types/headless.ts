// Headless pattern types for the Calendar component
// src/components/ey-calendar/types/headless.ts

import type React from "react";
import type { DefaultBadgeProps, DefaultButtonProps, IconProps } from "./components";

/**
 * All available class keys for the calendar.
 * These correspond to the structural and theme classes.
 */
export type EyCalendarClassKey =
  // Root
  | "root"
  // Toolbar
  | "toolbar"
  | "toolbarNavigation"
  | "toolbarTitle"
  | "toolbarViewSelector"
  // Buttons
  | "button"
  | "buttonNav"
  | "buttonToday"
  | "buttonView"
  | "buttonViewActive"
  // View Container
  | "viewContainer"
  // Week View
  | "weekView"
  | "weekViewContainer"
  | "weekHeader"
  | "weekHeaderGrid"
  | "weekHeaderDay"
  | "weekHeaderDayName"
  | "weekHeaderDayNumber"
  | "weekHeaderDayNumberToday"
  | "weekHeaderDayClickable"
  | "weekGrid"
  | "weekGridInner"
  | "weekTimeColumn"
  | "weekTimeSlot"
  | "weekTimeSlotText"
  | "weekDayColumn"
  | "weekDayColumnHidden"
  | "weekHourCell"
  | "weekEventsContainer"
  | "weekEventWrapper"
  | "weekEventWrapperConflict"
  | "weekAllDaySection"
  | "weekAllDayLabel"
  | "weekAllDayColumn"
  | "weekAllDayColumnHidden"
  | "weekAllDayEventBar"
  | "weekAllDayEventBarStart"
  | "weekAllDayEventBarEnd"
  | "weekAllDayEventBarMiddle"
  | "weekAllDayEventBarFull"
  | "weekAllDayEventBarContent"
  | "weekDayColumnInner"
  // Day View
  | "dayView"
  | "dayHeader"
  | "dayContent"
  | "dayGrid"
  | "dayTimeColumn"
  | "dayTimeSlot"
  | "dayTimeSlotText"
  | "dayMainColumn"
  | "daySlotCell"
  | "daySlotCellHour"
  | "dayEventsContainer"
  | "dayEventWrapper"
  | "dayAllDaySection"
  | "dayAllDayLayout"
  | "dayAllDayLabel"
  | "dayAllDayContent"
  | "dayAllDayMore"
  | "dayAllDayEventBar"
  | "dayAllDayTitle"
  | "dayCurrentTimeLine"
  | "dayCurrentTimeLineInner"
  | "dayCurrentTimeLineDot"
  | "dayCurrentTimeLineBar"
  // Month View
  | "monthView"
  | "monthHeader"
  | "monthHeaderGrid"
  | "monthHeaderDay"
  | "monthHeaderDayText"
  | "monthHeaderDayBorder"
  | "monthGrid"
  | "monthDayCell"
  | "monthDayNumber"
  | "monthDayNumberClickable"
  | "monthEventsContainer"
  | "monthEventsDesktop"
  | "monthEventsList"
  | "monthEventsListInner"
  | "monthEventItem"
  | "monthEventDot"
  | "monthEventDotMobile"
  | "monthEventContent"
  | "monthEventTime"
  | "monthEventTimeText"
  | "monthEventTitle"
  | "monthMoreEvents"
  | "monthWeekRow"
  | "monthWeekNumberCell"
  | "monthWeekNumber"
  | "monthHeaderWeekNumberCell"
  | "monthEventBar"
  | "monthEventBarTime"
  | "monthEventBarTitle"
  | "monthEventsLayer"
  | "monthSingleDayEventsContainer"
  | "monthEventItemWrapper"
  | "monthEventItemDot"
  | "monthEventItemTime"
  | "monthEventItemTitle"
  // Planning View
  | "planningView"
  | "planningScrollContainer"
  | "planningContent"
  | "planningDateGroup"
  | "planningDateHeader"
  | "planningDateHeaderTitle"
  | "planningDateHeaderSubtitle"
  | "planningEventsList"
  | "planningNoEvents"
  | "planningEmpty"
  | "planningEmptyContainer"
  | "planningEmptyIcon"
  | "planningEmptyTitle"
  | "planningEmptyText"
  // Event Bar
  | "eventBar"
  | "eventContent"
  | "eventContentCompact"
  | "eventContentMinimal"
  | "eventContentFull"
  | "eventHeader"
  | "eventTitle"
  | "eventTime"
  | "eventTimeResizing"
  | "eventDescription"
  | "eventLocation"
  | "eventLocationText"
  | "eventResizeHandle"
  | "eventResizeHandleTop"
  | "eventResizeHandleBottom"
  | "eventRecurringIndicator"
  | "eventRecurringIcon"
  | "eventRecurringIconText"
  | "eventConflictIndicator"
  | "eventConflictIndicatorCompact"
  | "eventConflictDot"
  // Event Card
  | "eventCard"
  | "eventCardHeader"
  | "eventCardContent"
  | "eventCardTime"
  | "eventCardTimeText"
  | "eventCardTimePast"
  | "eventCardDuration"
  | "eventCardDurationPast"
  | "eventCardTitle"
  | "eventCardTitlePast"
  | "eventCardIndicators"
  | "eventCardAllDay"
  | "eventCardRecurring"
  | "eventCardDescription"
  | "eventCardDescriptionPast"
  | "eventCardLocation"
  | "eventCardLocationPast"
  | "eventCardLocationIcon"
  | "eventCardLocationText"
  // States
  | "eventSelected"
  | "eventDragging"
  | "eventConflict"
  | "eventHovered"
  | "eventPast"
  | "eventCompact"
  | "eventMinimal"
  | "eventFull"
  // Day States
  | "dayTodayWrapper"
  | "dayToday"
  | "dayCurrent"
  | "dayOutsideMonth"
  | "dayPast"
  | "dayWeekend"
  | "dayWorkingHours"
  // Icons
  | "icon"
  | "iconChevron"
  // Badge
  | "badge"
  | "badgeSm"
  | "badgeLg"
  | "badgeDefault"
  | "badgeInfo"
  | "badgeSuccess"
  | "badgeWarning"
  | "badgeError";

/**
 * Type for custom class overrides.
 * Allows partial overrides of any structural class.
 */
export type EyCalendarClassNames = Partial<Record<EyCalendarClassKey, string>>;

/**
 * Type for theme class overrides.
 * Allows partial overrides of any visual style class.
 */
export type EyCalendarThemeClasses = Partial<Record<EyCalendarClassKey, string>>;

/**
 * Type for custom label overrides.
 * Users can provide their own labels for internationalization.
 */
export interface EyCalendarLabels {
  // Planning View
  planningToday: string;
  planningPast: string;
  planningNoEvents: string;
  planningEmptyTitle: string;
  planningEmptyText: string;
  planningEventCount: (count: number) => string;

  // Event Display
  allDay: string;
  eventBullet: string;

  // Time & Duration
  timeFormat: string;
  durationSeparator: string;

  // Days
  today: string;
  past: string;

  // General
  noEvents: string;
  viewHeadStatic: string;

  // Navigation
  navNextMonth: string;
  navPreviousMonth: string;
  navNextWeek: string;
  navPreviousWeek: string;
  navNextDay: string;
  navPreviousDay: string;
  navNextPeriod: string;
  navPreviousPeriod: string;
  navToday: string;

  // View Labels
  viewMonth: string;
  viewWeek: string;
  viewDay: string;
  viewPlanning: string;
}

/**
 * Type for custom component overrides.
 * Users can provide their own components to replace defaults (icons, buttons, etc.).
 */
export interface EyCalendarComponents {
  // Buttons & Badges (existing)
  Button?: React.ComponentType<DefaultButtonProps>;
  Badge?: React.ComponentType<DefaultBadgeProps>;

  // Planning & Empty States
  EmptyStateIcon?: React.ComponentType<IconProps>;

  // Event Icons
  LocationIcon?: React.ComponentType<IconProps>;
  RecurringIcon?: React.ComponentType<IconProps>;
  AllDayIcon?: React.ComponentType<IconProps>;

  // Time & Duration
  TimeIcon?: React.ComponentType<IconProps>;
  DurationIcon?: React.ComponentType<IconProps>;

  // Conflict Indicators
  ConflictIcon?: React.ComponentType<IconProps>;
  ConflictDotIcon?: React.ComponentType<IconProps>;

  // Bullet & Separators
  BulletIcon?: React.ComponentType<IconProps>;
  SeparatorIcon?: React.ComponentType<IconProps>;
}
