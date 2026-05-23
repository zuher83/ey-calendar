// Component for rendering an event bar
// src/components/ey-calendar/components/events/EventBar.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbacks } from "../../context/CallbacksContext";
import { useOptions } from "../../context/OptionsContext";
import { useViewCellHeight } from "../../context/ViewContext";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { useEyCalendarComponents } from "../../hooks/useEyCalendarComponents";
import { useEyCalendarLabels } from "../../hooks/useEyCalendarLabels";
import { useEventKeyboardInteractions } from "../../hooks/useEventKeyboardInteractions";
import type { EventPosition, EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import { formatTime } from "../../utils/dateUtils";
import { EventBarContent } from "./EventBarContent";
import {
  computeEventStyles,
  computeResizePreviewPosition,
  type ResizePreviewState,
} from "./eventBarStyles";

/**
 * Interface for EventBar props
 */
export interface EventBarProps {
  /**
   * Event to display
   */
  event: EyCalendarEvent;

  /**
   * Calculated position of the event
   */
  position?: EventPosition;

  /**
   * Indicates if the event is selected
   */
  isSelected?: boolean;

  /**
   * Indicates if the event is being dragged
   */
  isDragging?: boolean;

  /**
   * Indicates if the event is part of a conflict group
   */
  isInConflict?: boolean;

  /**
   * Current calendar view mode
   */
  viewMode?: "month" | "week" | "day" | "planning";

  /**
   * Chronological z-index (newer events on top)
   */
  chronologicalZIndex?: number;

  /**
   * Indicates if the event is in a single column (for right margin)
   */
  isInSingleColumn?: boolean;

  /**
   * Callback when clicking on the event
   */
  onClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;

  /**
   * Callback when double-clicking on the event
   */
  onDoubleClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;

  /**
   * Callback when right-clicking on the event
   */
  onContextMenu?: (event: EyCalendarEvent, e: React.MouseEvent) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Indicates if the event should be displayed in compact mode
   */
  compact?: boolean;
}

/**
 * EventBar Component - Displays an event bar
 */
export function EventBar({
  event,
  position,
  isSelected = false,
  isDragging = false,
  isInConflict = false,
  viewMode = "week",
  chronologicalZIndex = 1,
  isInSingleColumn = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  className = "",
  compact = false,
}: EventBarProps) {
  const { options } = useOptions();
  const { callbacks } = useCallbacks();
  const { makeDraggable, makeResizable } = useDragAndDrop();
  const cellHeight = useViewCellHeight();
  const eventRef = useRef<HTMLDivElement>(null);
  const topResizeRef = useRef<HTMLDivElement>(null);
  const bottomResizeRef = useRef<HTMLDivElement>(null);
  const labels = useEyCalendarLabels(options.labels, options.locale);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Get components from context options (for icons)
  const Components = useEyCalendarComponents(options.components);

  // Get locale from context for date formatting
  const locale = options.locale;

  const [resizePreview, setResizePreview] = useState<ResizePreviewState>({
    isResizing: false,
  });

  const [isHovered, setIsHovered] = useState(false);
  const recurringResizeAllowed = !event.isRecurring || event.custom?.allowDragRecurring === true;
  const resizeAllowed =
    options.enableResize !== false &&
    options.readonly !== true &&
    !event.custom?.readOnly &&
    recurringResizeAllowed;

  // Initialize drag & drop
  useEffect(() => {
    const element = eventRef.current;
    if (element && !isDragging) {
      const cleanup = makeDraggable(element, event);

      return cleanup;
    }
  }, [event, isDragging, makeDraggable]);

  // Setup resize handles (only if not dragging)
  useEffect(() => {
    if (topResizeRef.current && !isDragging) {
      return makeResizable(topResizeRef.current, event, "top", {
        onResizeStart: (eventId, handle) => {
          setResizePreview({
            isResizing: true,
            handle,
          });
        },
        onResize: (eventId, newStart, newEnd, handle) => {
          setResizePreview({
            isResizing: true,
            startTime: newStart,
            endTime: newEnd,
            handle,
          });
        },
        onResizeEnd: () => {
          setResizePreview({
            isResizing: false,
          });
        },
      });
    }
  }, [event, makeResizable, isDragging]);

  useEffect(() => {
    if (bottomResizeRef.current && !isDragging) {
      return makeResizable(bottomResizeRef.current, event, "bottom", {
        onResizeStart: (eventId, handle) => {
          setResizePreview({
            isResizing: true,
            handle,
          });
        },
        onResize: (eventId, newStart, newEnd, handle) => {
          setResizePreview({
            isResizing: true,
            startTime: newStart,
            endTime: newEnd,
            handle,
          });
        },
        onResizeEnd: () => {
          setResizePreview({
            isResizing: false,
          });
        },
      });
    }
  }, [event, makeResizable, isDragging]);

  // Determine display style based on view
  const displayStyle = useMemo(() => {
    if (compact || viewMode === "month") {
      return "compact";
    }
    if (position && position.height < 30) {
      return "minimal";
    }

    return "full";
  }, [compact, viewMode, position]);

  const tempPosition = useMemo(
    () =>
      computeResizePreviewPosition(
        resizePreview,
        position,
        cellHeight,
        options.timeSlots?.granularity
      ),
    [resizePreview, position, cellHeight, options.timeSlots?.granularity]
  );

  // Check if event is in the past (ended before current date)
  const isPastEvent = useMemo(() => {
    const now = new Date();

    return event.end < now;
  }, [event.end]);

  const eventStyles = useMemo(
    () =>
      computeEventStyles({
        event,
        tempPosition,
        viewMode,
        isSelected,
        isDragging,
        isInConflict,
        isResizing: resizePreview.isResizing,
        chronologicalZIndex,
        isInSingleColumn,
        isHovered,
        isPastEvent,
      }),
    [
      event,
      tempPosition,
      isSelected,
      isDragging,
      isInConflict,
      resizePreview.isResizing,
      viewMode,
      chronologicalZIndex,
      isInSingleColumn,
      isHovered,
      isPastEvent,
    ]
  );

  // Event handlers
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(event, e);
      callbacks?.onEventClick?.(event, e);
    },
    [event, onClick, callbacks]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDoubleClick?.(event, e);
      callbacks?.onEventDoubleClick?.(event, e);
    },
    [event, onDoubleClick, callbacks]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(event, e);
    },
    [event, onContextMenu]
  );

  // Hover boost handlers - uses global context
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      setIsHovered(true);
      callbacks?.onEventHover?.(event, e);
    },
    [event, callbacks]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleKeyActivate = useCallback(
    (e: React.KeyboardEvent) => {
      onClick?.(event, e as unknown as React.MouseEvent);
      callbacks?.onEventClick?.(event, e as unknown as React.MouseEvent);
    },
    [callbacks, event, onClick]
  );

  const handleKeyDown = useEventKeyboardInteractions(event, handleKeyActivate);

  const eventClasses = cn(getClass("eventBar"), className);

  return (
    <div
      ref={eventRef}
      className={eventClasses}
      style={{
        ...eventStyles,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      title={`${event.title}\n${formatTime(event.start, locale)} - ${formatTime(event.end, locale)}\n${event.description || ""}`}
      role="button"
      tabIndex={0}
      aria-label={labels.ariaEvent(event.title)}
      aria-selected={isSelected}
      data-eycalendar-event=""
      data-event-id={event.id}
      data-event-striped={event.isStriped ? "true" : undefined}
      data-selected={isSelected ? "true" : undefined}
      data-dragging={isDragging ? "true" : undefined}
      data-conflict={isInConflict ? "true" : undefined}
      data-hovered={isHovered ? "true" : undefined}
      data-past={isPastEvent ? "true" : undefined}
      data-size={displayStyle}
      data-testid={`event-bar-${event.id}`}
    >
      <EventBarContent
        event={event}
        displayStyle={displayStyle}
        position={position}
        viewMode={viewMode}
        resizePreview={resizePreview}
      />

      {/* Resize indicators (full view only) */}
      {/* Resize handles - show for week/day views, always show bottom handle for small events */}
      {(viewMode === "week" || viewMode === "day") && position && resizeAllowed && (
        <>
          {/* Top handle only for events tall enough */}
          {position.height > 40 && (
            <div
              ref={topResizeRef}
              className={cn(getClass("eventResizeHandle"), getClass("eventResizeHandleTop"))}
              data-eycalendar-resize-handle="top"
            />
          )}
          {/* Bottom handle always visible for resizing */}
          <div
            ref={bottomResizeRef}
            className={cn(getClass("eventResizeHandle"), getClass("eventResizeHandleBottom"))}
            data-eycalendar-resize-handle="bottom"
          />
        </>
      )}

      {/* Recurring event indicator */}
      {event.isRecurring && (
        <div className={getClass("eventRecurringIndicator")} data-eycalendar-recurring="">
          <div className={getClass("eventRecurringIcon")}>
            <Components.RecurringIcon className={getClass("eventRecurringIconText")} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Memoized EventBar component for performance optimization
 */
function arePositionsEqual(prev?: EventPosition, next?: EventPosition): boolean {
  if (prev === next) {
    return true;
  }

  if (!prev || !next) {
    return prev === next;
  }

  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.top === next.top &&
    prev.left === next.left
  );
}

export const MemoizedEventBar = React.memo(EventBar, (prevProps, nextProps) => {
  return (
    prevProps.event === nextProps.event &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isInConflict === nextProps.isInConflict &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.chronologicalZIndex === nextProps.chronologicalZIndex &&
    prevProps.isInSingleColumn === nextProps.isInSingleColumn &&
    prevProps.compact === nextProps.compact &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onDoubleClick === nextProps.onDoubleClick &&
    prevProps.onContextMenu === nextProps.onContextMenu &&
    arePositionsEqual(prevProps.position, nextProps.position)
  );
});

MemoizedEventBar.displayName = "MemoizedEventBar";

// Default export
export default EventBar;
