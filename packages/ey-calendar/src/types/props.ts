import type React from "react";
import type { Locale } from "date-fns";
import type { ConflictStrategy, ViewMode } from "./base";
import type { EyCalendarEvent } from "./events";
import type {
  EyCalendarClassNames,
  EyCalendarComponents,
  EyCalendarLabels,
  EyCalendarThemeClasses,
} from "./headless";
import type { DropTarget } from "./state";
import type { TimeSlot, TimeSlotConfig } from "./time";
import type { DateRange } from "./views";

/**
 * Calendar configuration options
 */
export interface EyCalendarOptions {
  // Default view
  defaultView?: ViewMode;
  defaultDate?: Date;

  timeSlots?: TimeSlotConfig;

  // Display
  showWeekends?: boolean;
  showToday?: boolean;
  highlightToday?: boolean;
  showWeekNumbers?: boolean;
  showToolbar?: boolean;

  // Layout
  /**
   * Calendar width (default: 100%)
   */
  width?: number | string;

  /**
   * Calendar height (default: 600px)
   */
  height?: string | number;

  /**
   * Automatically detect and use container height instead of requiring a fixed height.
   * When enabled, the calendar will use ResizeObserver to adapt to its parent container.
   * Falls back to the height prop if detection fails.
   * @default false
   */
  autoHeight?: boolean;

  /**
   * Hour cell height in pixels (default: 64px).
   * Used for positioning calculations in week/day views.
   */
  cellHeight?: number;

  /**
   * Detected container height (internal, set by Calendar component).
   * @internal
   */
  detectedHeight?: number;

  // Interactions
  readonly?: boolean;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  enableCreate?: boolean;
  enableDelete?: boolean;

  // Conflicts
  conflictStrategy?: ConflictStrategy;
  allowOverlaps?: boolean;
  maxEventsPerSlot?: number;

  // Performance
  debounceMs?: number;

  // Internationalization
  /**
   * date-fns locale for date formatting.
   * Import from 'date-fns/locale' (e.g., import { fr } from 'date-fns/locale').
   *
   * @example
   * ```tsx
   * import { fr } from 'date-fns/locale';
   * <Calendar locale={fr} />
   * ```
   */
  locale?: Locale;

  // Theme (color palette)
  colorTheme?: EyCalendarColorTheme;
  className?: string;

  // Headless pattern options
  /**
   * Theme to apply for class-based styling. Can be:
   * - 'default' (uses default theme classes)
   * - Custom theme object with partial class overrides
   */
  theme?: string | EyCalendarThemeClasses;

  /**
   * If true, only structural classes are applied (no colors, borders, shadows).
   * Useful when you want complete control over styling.
   */
  unstyled?: boolean;

  /**
   * Custom class overrides for any element.
   * These have the highest priority and will override both
   * structural classes and theme classes.
   */
  classNames?: EyCalendarClassNames;

  /**
   * Custom component overrides to replace default components.
   */
  components?: Partial<EyCalendarComponents>;

  /**
   * Custom labels for internationalization.
   * Provide custom text for calendar strings (Today, No events, etc.).
   */
  labels?: Partial<EyCalendarLabels>;

  // Z-index management
  /**
   * If true (default), creates an isolated stacking context for the calendar.
   * This prevents calendar z-indexes from interfering with parent document
   * z-indexes (e.g., when calendar is inside a Dialog/Modal).
   * Set to false if you need manual control over z-index layering.
   * @default true
   */
  isolateZIndex?: boolean;
}

/**
 * Calendar color theme (semantic colors)
 * @deprecated Use EyCalendarThemeClasses for class-based theming
 */
export interface EyCalendarColorTheme {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
  today?: string;
  weekend?: string;
  selected?: string;
  hover?: string;
  conflict?: string;
  success?: string;
  warning?: string;
  error?: string;
}

/**
 * Event callbacks
 */
export interface EyCalendarCallbacks {
  // Basic events
  onEventClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventDoubleClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventHover?: (event: EyCalendarEvent, e: React.MouseEvent) => void;

  // Drag & Drop
  onEventDrag?: (
    event: EyCalendarEvent,
    newStart: Date,
    newEnd: Date,
    newResourceId?: string
  ) => void;
  onEventResize?: (event: EyCalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventDrop?: (event: EyCalendarEvent, dropTarget: DropTarget) => void;

  // Creation and deletion
  onTimeSlotClick?: (date: Date, e: React.MouseEvent, resourceId?: string) => void;
  onTimeSlotDoubleClick?: (date: Date, e: React.MouseEvent, resourceId?: string) => void;
  onEventCreate?: (timeSlot: TimeSlot, resourceId?: string) => EyCalendarEvent | void;
  onEventUpdate?: (eventId: string, updates: Partial<EyCalendarEvent>) => void;
  onEventDelete?: (eventId: string) => void;

  // Navigation
  onViewChange?: (view: ViewMode, date: Date) => void;
  onDateChange?: (date: Date) => void;
  onDateRangeChange?: (range: DateRange) => void;

  // Month View
  onShowMoreClick?: (
    date: Date,
    hiddenEvents: EyCalendarEvent[],
    allEvents: EyCalendarEvent[]
  ) => void;

  // Performance
  onRenderComplete?: (renderTime: number, eventCount: number) => void;
  onScrollChange?: (position: { x: number; y: number }) => void;
}

/**
 * EyCalendar component props
 */
export interface EyCalendarProps extends EyCalendarOptions, EyCalendarCallbacks {
  // Mandatory data
  events?: EyCalendarEvent[];

  // Layout
  className?: string;
  style?: React.CSSProperties;

  // Options override
  options?: Partial<EyCalendarOptions>;
}
