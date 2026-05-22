// Structural classes for EY Calendar
//
// This file maps class keys to CSS class names.
// All classes use the `ey-cal-` namespace for isolation.
// Actual styles are defined in the CSS files:
// - ey-calendar.structure.css (layout)
// - ey-calendar.theme.css (visual)

// ============================================================================
// NAMESPACED CLASSES - Maps to CSS classes in ey-calendar.*.css
// ============================================================================

export const DEFAULT_CALENDAR_CLASSES = {
  // -------------------------------------------------------------------------
  // ROOT CONTAINER
  // -------------------------------------------------------------------------
  /** Main calendar container */
  root: "ey-cal-root",

  // -------------------------------------------------------------------------
  // TOOLBAR
  // -------------------------------------------------------------------------
  /** Toolbar container */
  toolbar: "ey-cal-toolbar",
  /** Navigation buttons container (left section) */
  toolbarNavigation: "ey-cal-toolbar-navigation",
  /** Title container (center section) */
  toolbarTitle: "ey-cal-toolbar-title",
  /** View selector container (right section) */
  toolbarViewSelector: "ey-cal-toolbar-view-selector",

  // -------------------------------------------------------------------------
  // BUTTONS
  // -------------------------------------------------------------------------
  /** Default button base */
  button: "ey-cal-button",
  /** Navigation button (prev/next arrows) */
  buttonNav: "ey-cal-button-nav",
  /** Today button */
  buttonToday: "ey-cal-button-today",
  /** View button in selector */
  buttonView: "ey-cal-button-view",
  /** Active view button */
  buttonViewActive: "ey-cal-button-view-active",

  // -------------------------------------------------------------------------
  // VIEW CONTAINER
  // -------------------------------------------------------------------------
  /** Container for all views */
  viewContainer: "ey-cal-view-container",

  // -------------------------------------------------------------------------
  // WEEK VIEW
  // -------------------------------------------------------------------------
  /** Week view root */
  weekView: "ey-cal-week-view",
  /** Week view container (for alignment synchronization) */
  weekViewContainer: "ey-cal-week-view-container",
  /** Week header with day names */
  weekHeader: "ey-cal-week-header",
  /** Week header grid */
  weekHeaderGrid: "ey-cal-week-header-grid",
  /** Week header day cell */
  weekHeaderDay: "ey-cal-week-header-day",
  /** Week header day name text */
  weekHeaderDayName: "ey-cal-week-header-day-name",
  /** Week header day number */
  weekHeaderDayNumber: "ey-cal-week-header-day-number",
  /** Week header day number today */
  weekHeaderDayNumberToday: "ey-cal-week-header-day-number",
  /** Week header day clickable (name + number container for navigation) */
  weekHeaderDayClickable: "ey-cal-week-header-day-clickable",
  /** Week grid container (scrollable area) */
  weekGrid: "ey-cal-week-grid",
  /** Week grid inner */
  weekGridInner: "ey-cal-week-grid-inner",
  /** Time column (hours) */
  weekTimeColumn: "ey-cal-week-time-column",
  /** Time slot label */
  weekTimeSlot: "ey-cal-week-time-slot",
  /** Time slot text */
  weekTimeSlotText: "ey-cal-week-time-slot-text",
  /** Day column container */
  weekDayColumn: "ey-cal-week-day-column",
  /** Day column hidden (weekend on mobile) */
  weekDayColumnHidden: "ey-cal-week-day-column",
  /** Hour cell in day column */
  weekHourCell: "ey-cal-week-hour-cell",
  /** Events overlay container */
  weekEventsContainer: "ey-cal-week-events-container",
  /** Event wrapper (normal) */
  weekEventWrapper: "ey-cal-week-event-wrapper",
  /** Event wrapper (in conflict) */
  weekEventWrapperConflict: "ey-cal-week-event-wrapper-conflict",
  /** All-day events section (sticky header) */
  weekAllDaySection: "ey-cal-week-all-day-section",
  /** All-day section label */
  weekAllDayLabel: "ey-cal-week-all-day-label",
  /** All-day column container */
  weekAllDayColumn: "ey-cal-week-all-day-column",
  /** All-day column hidden (weekend on mobile) */
  weekAllDayColumnHidden: "ey-cal-week-all-day-column",
  /** All-day event bar */
  weekAllDayEventBar: "ey-cal-week-all-day-event-bar",
  /** All-day event bar - full (single day) */
  weekAllDayEventBarFull: "ey-cal-week-all-day-event-bar-full",
  /** All-day event bar - start segment */
  weekAllDayEventBarStart: "ey-cal-week-all-day-event-bar-start",
  /** All-day event bar - end segment */
  weekAllDayEventBarEnd: "ey-cal-week-all-day-event-bar-end",
  /** All-day event bar - middle segment */
  weekAllDayEventBarMiddle: "ey-cal-week-all-day-event-bar-middle",
  /** All-day event bar content */
  weekAllDayEventBarContent: "ey-cal-week-all-day-event-bar-content",
  /** Day column inner container */
  weekDayColumnInner: "ey-cal-week-day-column-inner",

  // -------------------------------------------------------------------------
  // DAY VIEW
  // -------------------------------------------------------------------------
  /** Day view root */
  dayView: "ey-cal-day-view",
  /** Day view header */
  dayHeader: "ey-cal-day-header",
  /** Day view content (scrollable) */
  dayContent: "ey-cal-day-content",
  /** Day view grid container */
  dayGrid: "ey-cal-day-grid",
  /** Day time column */
  dayTimeColumn: "ey-cal-day-time-column",
  /** Day time slot */
  dayTimeSlot: "ey-cal-day-time-slot",
  /** Day time slot text */
  dayTimeSlotText: "ey-cal-day-time-slot-text",
  /** Day main column */
  dayMainColumn: "ey-cal-day-main-column",
  /** Day slot cell */
  daySlotCell: "ey-cal-day-slot-cell",
  /** Day slot cell for full hours (minutes === 0) */
  daySlotCellHour: "ey-cal-day-slot-cell-hour",
  /** Day events container */
  dayEventsContainer: "ey-cal-day-events-container",
  /** Day event wrapper (normal) */
  dayEventWrapper: "ey-cal-day-event-wrapper",
  /** Day all-day section (sticky header) */
  dayAllDaySection: "ey-cal-day-all-day-section",
  /** Day all-day section layout row */
  dayAllDayLayout: "ey-cal-day-all-day-layout",
  /** Day all-day label column */
  dayAllDayLabel: "ey-cal-day-all-day-label",
  /** Day all-day content container */
  dayAllDayContent: "ey-cal-day-all-day-content",
  /** Day all-day overflow label */
  dayAllDayMore: "ey-cal-day-all-day-more",
  /** Day all-day event bar */
  dayAllDayEventBar: "ey-cal-day-all-day-event-bar",
  /** Day all-day event title */
  dayAllDayTitle: "ey-cal-day-all-day-title",
  /** Current time line */
  dayCurrentTimeLine: "ey-cal-day-current-time-line",
  /** Current time line inner container */
  dayCurrentTimeLineInner: "ey-cal-day-current-time-line-inner",
  /** Current time line dot */
  dayCurrentTimeLineDot: "ey-cal-day-current-time-line-dot",
  /** Current time line bar */
  dayCurrentTimeLineBar: "ey-cal-day-current-time-line-bar",

  // -------------------------------------------------------------------------
  // MONTH VIEW
  // -------------------------------------------------------------------------
  /** Month view root */
  monthView: "ey-cal-month-view",
  /** Month header with weekday names */
  monthHeader: "ey-cal-month-header",
  /** Month header grid */
  monthHeaderGrid: "ey-cal-month-header-grid",
  /** Month header day cell */
  monthHeaderDay: "ey-cal-month-header-day",
  /** Month header day text */
  monthHeaderDayText: "ey-cal-month-header-day-text",
  /** Month header day border (for all except last) */
  monthHeaderDayBorder: "ey-cal-month-header-day-border",
  /** Month grid */
  monthGrid: "ey-cal-month-grid",
  /** Month day cell */
  monthDayCell: "ey-cal-month-day-cell",
  /** Month day number */
  monthDayNumber: "ey-cal-month-day-number",
  /** Month day number clickable (for navigation) */
  monthDayNumberClickable: "ey-cal-month-day-number-clickable",
  /** Month events container */
  monthEventsContainer: "ey-cal-month-events-container",
  /** Month events desktop wrapper */
  monthEventsDesktop: "ey-cal-month-events-desktop",
  /** Month events list */
  monthEventsList: "ey-cal-month-events-list",
  /** Month events list inner */
  monthEventsListInner: "ey-cal-month-events-list-inner",
  /** Month event item */
  monthEventItem: "ey-cal-month-event-item",
  /** Month event dot */
  monthEventDot: "ey-cal-month-event-dot",
  /** Month event dot mobile (hidden on desktop) */
  monthEventDotMobile: "ey-cal-month-event-dot-mobile",
  /** Month event content wrapper */
  monthEventContent: "ey-cal-month-event-content",
  /** Month event time row */
  monthEventTime: "ey-cal-month-event-time",
  /** Month event time text */
  monthEventTimeText: "ey-cal-month-event-time-text",
  /** Month event title */
  monthEventTitle: "ey-cal-month-event-title",
  /** Month more events indicator */
  monthMoreEvents: "ey-cal-month-more-events",
  /** Month week row (container for a week of days + events) */
  monthWeekRow: "ey-cal-month-week-row",
  /** Month week number cell (left column for week number) */
  monthWeekNumberCell: "ey-cal-month-week-number-cell",
  /** Month week number text */
  monthWeekNumber: "ey-cal-month-week-number",
  /** Month header week number cell (empty placeholder in header) */
  monthHeaderWeekNumberCell: "ey-cal-month-header-week-number-cell",
  /** Month event bar (spanning multi-day event) */
  monthEventBar: "ey-cal-month-event-bar",
  /** Month event bar time (inherits color from parent) */
  monthEventBarTime: "ey-cal-month-event-bar-time",
  /** Month event bar title (inherits color from parent) */
  monthEventBarTitle: "ey-cal-month-event-bar-title",
  /** Month events layer container */
  monthEventsLayer: "ey-cal-month-events-layer",
  /** Month single-day events container */
  monthSingleDayEventsContainer: "ey-cal-month-single-day-events-container",
  /** Month event item wrapper */
  monthEventItemWrapper: "ey-cal-month-event-item-wrapper",
  /** Month event item time */
  monthEventItemTime: "ey-cal-month-event-item-time",
  /** Month event item title */
  monthEventItemTitle: "ey-cal-month-event-item-title",
  /** Month event item dot */
  monthEventItemDot: "ey-cal-month-event-item-dot",

  // -------------------------------------------------------------------------
  // PLANNING VIEW
  // -------------------------------------------------------------------------
  /** Planning view root */
  planningView: "ey-cal-planning-view",
  /** Planning scroll container */
  planningScrollContainer: "ey-cal-planning-scroll-container",
  /** Planning content */
  planningContent: "ey-cal-planning-content",
  /** Planning date group */
  planningDateGroup: "ey-cal-planning-date-group",
  /** Planning date header */
  planningDateHeader: "ey-cal-planning-date-header",
  /** Planning date header title */
  planningDateHeaderTitle: "ey-cal-planning-date-header-title",
  /** Planning date header subtitle */
  planningDateHeaderSubtitle: "ey-cal-planning-date-header-subtitle",
  /** Planning events list */
  planningEventsList: "ey-cal-planning-events-list",
  /** Planning no events message */
  planningNoEvents: "ey-cal-planning-no-events",
  /** Planning empty state */
  planningEmpty: "ey-cal-planning-empty",
  /** Planning empty container */
  planningEmptyContainer: "ey-cal-planning-empty-container",
  /** Planning empty icon */
  planningEmptyIcon: "ey-cal-planning-empty-icon",
  /** Planning empty title */
  planningEmptyTitle: "ey-cal-planning-empty-title",
  /** Planning empty text */
  planningEmptyText: "ey-cal-planning-empty-text",

  // -------------------------------------------------------------------------
  // EVENT BAR
  // -------------------------------------------------------------------------
  /** Event bar container */
  eventBar: "ey-cal-event-bar",
  /** Event bar content wrapper */
  eventContent: "ey-cal-event-content",
  /** Event bar content compact */
  eventContentCompact: "ey-cal-event-content-compact",
  /** Event bar content minimal */
  eventContentMinimal: "ey-cal-event-content-minimal",
  /** Event bar content full */
  eventContentFull: "ey-cal-event-content-full",
  /** Event header (title + indicators) */
  eventHeader: "ey-cal-event-header",
  /** Event title */
  eventTitle: "ey-cal-event-title",
  /** Event time display */
  eventTime: "ey-cal-event-time",
  /** Event time during resize */
  eventTimeResizing: "ey-cal-event-time-resizing",
  /** Event description */
  eventDescription: "ey-cal-event-description",
  /** Event location */
  eventLocation: "ey-cal-event-location",
  /** Event location text */
  eventLocationText: "ey-cal-event-location-text",
  /** Event resize handle */
  eventResizeHandle: "ey-cal-event-resize-handle",
  /** Event resize handle top */
  eventResizeHandleTop: "ey-cal-event-resize-handle-top",
  /** Event resize handle bottom */
  eventResizeHandleBottom: "ey-cal-event-resize-handle-bottom",
  /** Event recurring indicator */
  eventRecurringIndicator: "ey-cal-event-recurring-indicator",
  /** Event recurring icon wrapper */
  eventRecurringIcon: "ey-cal-event-recurring-icon",
  /** Event recurring icon text */
  eventRecurringIconText: "ey-cal-event-recurring-icon-text",
  /** Event conflict indicator */
  eventConflictIndicator: "ey-cal-event-conflict-indicator",
  /** Event conflict indicator compact variant */
  eventConflictIndicatorCompact: "ey-cal-event-conflict-indicator-compact",
  /** Event conflict dot */
  eventConflictDot: "ey-cal-event-conflict-dot",

  // -------------------------------------------------------------------------
  // EVENT CARD (Planning view)
  // -------------------------------------------------------------------------
  /** Event card container */
  eventCard: "ey-cal-event-card",
  /** Event card header */
  eventCardHeader: "ey-cal-event-card-header",
  /** Event card content */
  eventCardContent: "ey-cal-event-card-content",
  /** Event card time */
  eventCardTime: "ey-cal-event-card-time",
  /** Event card time text */
  eventCardTimeText: "ey-cal-event-card-time-text",
  /** Event card time text (past) */
  eventCardTimePast: "ey-cal-event-card-time-past",
  /** Event card duration */
  eventCardDuration: "ey-cal-event-card-duration",
  /** Event card duration (past) */
  eventCardDurationPast: "ey-cal-event-card-duration-past",
  /** Event card title */
  eventCardTitle: "ey-cal-event-card-title",
  /** Event card title (past) */
  eventCardTitlePast: "ey-cal-event-card-title-past",
  /** Event card indicators */
  eventCardIndicators: "ey-cal-event-card-indicators",
  /** Event card all-day badge */
  eventCardAllDay: "ey-cal-event-card-all-day",
  /** Event card recurring icon */
  eventCardRecurring: "ey-cal-event-card-recurring",
  /** Event card description */
  eventCardDescription: "ey-cal-event-card-description",
  /** Event card description (past) */
  eventCardDescriptionPast: "ey-cal-event-card-description-past",
  /** Event card location */
  eventCardLocation: "ey-cal-event-card-location",
  /** Event card location (past) */
  eventCardLocationPast: "ey-cal-event-card-location-past",
  /** Event card location icon */
  eventCardLocationIcon: "ey-cal-event-card-location-icon",
  /** Event card location text */
  eventCardLocationText: "ey-cal-event-card-location-text",

  // -------------------------------------------------------------------------
  // STATES - Now handled via data-attributes in CSS
  // These are kept for backward compatibility but are empty
  // Use data-selected, data-dragging, etc. on elements instead
  // -------------------------------------------------------------------------
  /** Selected event state - use data-selected="true" instead */
  eventSelected: "",
  /** Dragging event state - use data-dragging="true" instead */
  eventDragging: "",
  /** Event in conflict state - use data-conflict="true" instead */
  eventConflict: "",
  /** Hovered event state - use data-hovered="true" instead */
  eventHovered: "",
  /** Past event state - use data-past="true" instead */
  eventPast: "",
  /** Compact event display - use data-size="compact" instead */
  eventCompact: "",
  /** Minimal event display - use data-size="minimal" instead */
  eventMinimal: "",
  /** Full event display - use data-size="full" instead */
  eventFull: "",

  // -------------------------------------------------------------------------
  // DAY STATES - Now handled via data-attributes in CSS
  // -------------------------------------------------------------------------
  /** Today wrapper - use data-today="true" instead */
  dayTodayWrapper: "",
  /** Today indicator - use data-today="true" instead */
  dayToday: "",
  /** Current/selected day - use data-current="true" instead */
  dayCurrent: "",
  /** Day outside current month - use data-outside-month="true" instead */
  dayOutsideMonth: "",
  /** Past day - use data-past="true" instead */
  dayPast: "",
  /** Weekend day - use data-weekend="true" instead */
  dayWeekend: "",
  /** Working hours highlight - use data-working-hours="true" instead */
  dayWorkingHours: "",

  // -------------------------------------------------------------------------
  // ICONS
  // -------------------------------------------------------------------------
  /** Icon container */
  icon: "ey-cal-icon",
  /** Chevron icon */
  iconChevron: "ey-cal-icon-chevron",

  // -------------------------------------------------------------------------
  // BADGE
  // -------------------------------------------------------------------------
  /** Badge base */
  badge: "ey-cal-badge",
  /** Badge small size */
  badgeSm: "ey-cal-badge-sm",
  /** Badge large size */
  badgeLg: "ey-cal-badge-lg",
  /** Badge default variant */
  badgeDefault: "ey-cal-badge-default",
  /** Badge info variant */
  badgeInfo: "ey-cal-badge-info",
  /** Badge success variant */
  badgeSuccess: "ey-cal-badge-success",
  /** Badge warning variant */
  badgeWarning: "ey-cal-badge-warning",
  /** Badge error variant */
  badgeError: "ey-cal-badge-error",
} as const satisfies Record<import("../types").EyCalendarClassKey, string>;

// Re-export types from central types file for convenience
export type { EyCalendarClassKey, EyCalendarClassNames } from "../types";
