import type { ConflictStrategy, ViewMode } from "./base";
import type { ConflictGroup } from "./conflicts";
import type { EventPosition, EyCalendarEvent } from "./events";
import type { EyCalendarResource } from "./resources";
import type { TimeSlot } from "./time";
import type { DateRange, ViewConfig } from "./views";

/**
 * Global calendar state
 */
export interface EyCalendarState {
  // Data
  events: EyCalendarEvent[];
  resources: EyCalendarResource[];

  // View and navigation
  currentView: ViewMode;
  currentDate: Date;
  dateRange: DateRange;
  viewConfig: ViewConfig;

  // Layout configuration
  cellHeight: number; // Hour cell height in pixels

  // Selection and interaction
  selectedEventIds: string[];
  selectedDate?: Date;
  selectedResourceId?: string;
  selectedTimeSlot?: TimeSlot;

  // Conflicts and positioning
  conflictGroups: Map<string, ConflictGroup>;
  eventPositions: Map<string, EventPosition>;
  conflictStrategy: ConflictStrategy;

  // Event hover (for synchronized animations)
  hoveredEventId?: string;

  // UI and performance
  isLoading: boolean;
  scrollPosition: { x: number; y: number };
  virtualizedRanges: {
    startIndex: number;
    endIndex: number;
    overscan: number;
  };

  // Drag & Drop
  isDragging: boolean;
  draggedEventId?: string;
  tempEventPosition?: EventPosition;
  dropTargets: DropTarget[];
}

/**
 * Drop zone for drag & drop
 */
export interface DropTarget {
  id: string;
  type: "timeslot" | "resource" | "day";
  dateStart: Date;
  dateEnd: Date;
  resourceId?: string;
  bounds: DOMRect;
  isValid: boolean;
}

/**
 * Result of a position calculation
 */
export interface PositionCalculation {
  position: EventPosition;
  conflicts: string[];
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
}
