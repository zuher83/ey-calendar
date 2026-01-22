// Main Calendar component with Provider and view routing
// src/components/ey-calendar/components/Calendar.tsx

import React from "react";
import { DEFAULT_HOUR_CELL_HEIGHT, DEFAULT_OPTIONS } from "../constants";
import { EyCalendarProvider } from "../context/CompositeEyCalendarContext";
import { useOptions } from "../context/OptionsContext";
import { useView } from "../context/ViewContext";
import { useContainerHeight } from "../hooks/useContainerHeight";
import { useEyCalendarClasses } from "../hooks/useEyCalendarClasses";
import type {
  EyCalendarCallbacks,
  EyCalendarClassNames,
  EyCalendarComponents,
  EyCalendarEvent,
  EyCalendarOptions,
  EyCalendarThemeClasses,
  ViewMode,
} from "../types";
import { mergeCalendarOptions } from "../utils/optionsUtils";
import EyCalendarToolbar from "./EyCalendarToolbar";
import DayView from "./views/DayView";
import MonthView from "./views/MonthView";
import PlanningView from "./views/PlanningView";
import WeekView from "./views/WeekView";

/**
 * Interface for Calendar component props
 */
export interface EyCalendarProps extends EyCalendarCallbacks {
  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Inline style for the container
   */
  style?: React.CSSProperties;

  /**
   * Show or hide the toolbar
   */
  showToolbar?: boolean;

  /**
   * Calendar height (default: 600px)
   */
  height?: number | string;

  /**
   * Calendar width (default: 100%)
   */
  width?: number | string;

  /**
   * Events to display
   */
  events?: EyCalendarEvent[];

  /**
   * Configuration options
   */
  options?: Partial<EyCalendarOptions>;

  /**
   * Default view mode
   */
  defaultView?: ViewMode;

  /**
   * Default date
   */
  defaultDate?: Date;

  /**
   * Hour cell height in pixels (default: 64px)
   * Used for positioning calculations in week/day views
   */
  cellHeight?: number;

  /**
   * Automatically detect and use container height instead of requiring a fixed height.
   * When enabled, the calendar will use ResizeObserver to adapt to its parent container.
   * Falls back to the height prop if detection fails.
   * @default false
   */
  autoHeight?: boolean;

  // -------------------------------------------------------------------------
  // HEADLESS PROPS
  // -------------------------------------------------------------------------

  /**
   * Theme to apply. Can be 'default' or a custom theme object.
   * Visual classes (colors, borders, shadows) from the theme.
   */
  theme?: string | EyCalendarThemeClasses;

  /**
   * If true, only structural classes are applied (no visual styling).
   * Use this for complete custom styling.
   */
  unstyled?: boolean;

  /**
   * Custom class overrides for any element.
   * These have highest priority and will override structural and theme classes.
   */
  classNames?: EyCalendarClassNames;

  /**
   * Custom component overrides for replaceable elements.
   */
  components?: Partial<EyCalendarComponents>;

  /**
   * If true (default), creates an isolated stacking context for the calendar.
   * This prevents calendar z-indexes from interfering with parent document
   * z-indexes (e.g., when calendar is inside a Dialog/Modal).
   * @default true
   */
  isolateZIndex?: boolean;

  /**
   * Sets the data-theme attribute on the calendar root element.
   * Use "light" or "dark" to force a specific theme, or omit to use system preference.
   * This overrides the CSS prefers-color-scheme detection.
   */
  dataTheme?: "light" | "dark";
}

/**
 * Main Calendar component with view management and Provider
 */
export function EyCalendar(props: EyCalendarProps) {
  // Destructure props for easier access
  const {
    className = "",
    style,
    events = [],
    options: userOptions = {},
    dataTheme,
    // Callbacks
    onEventClick,
    onEventDoubleClick,
    onEventHover,
    onEventDrag,
    onEventResize,
    onEventDrop,
    onTimeSlotClick,
    onTimeSlotDoubleClick,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onViewChange,
    onDateChange,
    onDateRangeChange,
    onResourceSelect,
    onResourceAvailabilityCheck,
    onConflictDetected,
    onConflictResolved,
    onRenderComplete,
    onScrollChange,
    onShowMoreClick,
  } = props;

  // Merge user options with defaults (single source of truth)
  // Props-level options (showToolbar, height, etc.) can override both defaults and options object
  const mergedOptions = mergeCalendarOptions(DEFAULT_OPTIONS, {
    // Options object from props
    ...userOptions,
    // Individual props override everything (backward compatibility)
    ...(props.showToolbar !== undefined && { showToolbar: props.showToolbar }),
    ...(props.height !== undefined && { height: props.height }),
    ...(props.width !== undefined && { width: props.width }),
    ...(props.defaultView !== undefined && { defaultView: props.defaultView }),
    ...(props.defaultDate !== undefined && { defaultDate: props.defaultDate }),
    ...(props.cellHeight !== undefined && { cellHeight: props.cellHeight }),
    ...(props.autoHeight !== undefined && { autoHeight: props.autoHeight }),
    ...(props.theme !== undefined && { theme: props.theme }),
    ...(props.unstyled !== undefined && { unstyled: props.unstyled }),
    ...(props.classNames !== undefined && { classNames: props.classNames }),
    ...(props.components !== undefined && { components: props.components }),
    ...(props.isolateZIndex !== undefined && { isolateZIndex: props.isolateZIndex }),
  });

  // Extract final values from merged options
  const {
    showToolbar = true,
    height = 600,
    width = "100%",
    defaultView = "week",
    defaultDate = new Date(),
    cellHeight = DEFAULT_HOUR_CELL_HEIGHT,
    autoHeight = false,
    theme,
    unstyled = false,
    classNames,
    components,
    isolateZIndex = true,
  } = mergedOptions;
  // Initialize the class getter with headless options
  const getClass = useEyCalendarClasses({ theme, unstyled, classNames });

  // Auto-height detection - detect the height of the calendar container
  const { containerRef, height: detectedContainerHeight } = useContainerHeight({
    enabled: autoHeight,
    fallbackHeight: typeof height === "number" ? height : 600,
    debounceMs: 100,
  });

  // Build options object for the provider
  const calendarOptions: Partial<EyCalendarOptions> = {
    ...mergedOptions,
    detectedHeight: detectedContainerHeight, // Pass detected height to context
  };

  // Build callbacks object for the provider
  const calendarCallbacks: EyCalendarCallbacks = {
    onEventClick,
    onEventDoubleClick,
    onEventHover,
    onEventDrag,
    onEventResize,
    onEventDrop,
    onTimeSlotClick,
    onTimeSlotDoubleClick,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onViewChange,
    onDateChange,
    onDateRangeChange,
    onResourceSelect,
    onResourceAvailabilityCheck,
    onConflictDetected,
    onConflictResolved,
    onRenderComplete,
    onScrollChange,
    onShowMoreClick,
  };

  // Container styles (dimensional only, visual classes handled by getClass)
  // When autoHeight is enabled, use 100% height to fill parent container
  // Otherwise, use the explicit height prop
  // When isolateZIndex is false, remove isolation to allow manual z-index control
  const containerStyle: React.CSSProperties = {
    width,
    height: autoHeight ? "100%" : height,
    ...(isolateZIndex === false && { isolation: "auto" }), // Override isolate class
    ...style,
  };

  // Build root className - isolation is in structural classes by default
  // When isolateZIndex is false, we override via inline style above
  const rootClassName = getClass("root") + (className ? ` ${className}` : "");

  return (
    <EyCalendarProvider
      initialEvents={events}
      initialView={defaultView}
      initialDate={defaultDate}
      initialCellHeight={cellHeight}
      options={calendarOptions}
      callbacks={calendarCallbacks}
    >
      <div
        ref={containerRef}
        className={rootClassName}
        style={containerStyle}
        data-eycalendar-root=""
        data-theme={dataTheme}
        data-isolate-zindex={isolateZIndex}
        data-testid="calendar-container"
      >
        {showToolbar && <EyCalendarToolbar />}
        <EyCalendarViewRouter />
      </div>
    </EyCalendarProvider>
  );
}

/**
 * Internal component to route views based on current state
 */
function EyCalendarViewRouter() {
  const { state: viewState } = useView();
  const { options } = useOptions();

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  return (
    <div
      className={getClass("viewContainer")}
      data-eycalendar-view-container=""
      data-testid="calendar-view-container"
    >
      {viewState.currentView === "month" && <MonthView />}
      {viewState.currentView === "week" && <WeekView />}
      {viewState.currentView === "day" && <DayView />}
      {viewState.currentView === "planning" && <PlanningView />}
    </div>
  );
}

/**
 * Default export of Calendar component
 */
export default EyCalendar;
