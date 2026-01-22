// Component for rendering an event bar
// src/components/ey-calendar/components/events/EventBar.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_TIME_SLOT_CONFIG } from "../../constants";
import { useCallbacks } from "../../context/CallbacksContext";
import { useDragDrop } from "../../context/DragDropContext";
import { useOptions } from "../../context/OptionsContext";
import { useView } from "../../context/ViewContext";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { useEyCalendarComponents } from "../../hooks/useEyCalendarComponents";
import type { EventPosition, EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import { formatDuration, formatTime } from "../../utils/dateUtils";
import {
  desaturateColor,
  getEventDisplayTitle,
  getEventStyles,
  getOptimalTextColor,
  getStripedBackground,
  parseColorToRgb,
} from "../../utils/eventUtils";

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
  const { state: dragState, setHoveredEvent } = useDragDrop();
  const { state: viewState } = useView();
  const { options } = useOptions();
  const { callbacks } = useCallbacks();
  const { makeDraggable, makeResizable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);
  const topResizeRef = useRef<HTMLDivElement>(null);
  const bottomResizeRef = useRef<HTMLDivElement>(null);

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

  // Local state for resize preview
  const [resizePreview, setResizePreview] = useState<{
    isResizing: boolean;
    startTime?: Date;
    endTime?: Date;
    handle?: "top" | "bottom";
  }>({
    isResizing: false,
  });

  // Hover boost state (overlapping events) - uses global context
  const isHovered = dragState.hoveredEventId === event.id;
  const isOtherEventHovered = dragState.hoveredEventId && dragState.hoveredEventId !== event.id;

  // Track if this event is hidden by another event being hovered
  const _wasHidden = isOtherEventHovered && !isHovered;
  void _wasHidden; // Reserved for future animation use

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

  // Calculate temporary position during resize
  const tempPosition = useMemo(() => {
    if (
      !resizePreview.isResizing ||
      !resizePreview.startTime ||
      !resizePreview.endTime ||
      !position
    ) {
      return position;
    }

    // Utiliser la même logique que dans les vues pour calculer la position
    const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
    const cellHeight = viewState.cellHeight || 64;

    // Calculer les nouveaux top et height selon la granularité
    const startDate = resizePreview.startTime;
    const endDate = resizePreview.endTime;

    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinutes = endDate.getMinutes();

    let newTop: number;
    let newHeight: number;

    if (granularity === "hour") {
      newTop = startHour * cellHeight;
      newHeight = (endHour - startHour) * cellHeight;
    } else if (granularity === "half-hour") {
      const slotsPerHour = 2;
      const slotHeight = cellHeight / slotsPerHour;
      newTop = (startHour * slotsPerHour + startMinutes / 30) * slotHeight;
      newHeight =
        (endHour * slotsPerHour +
          endMinutes / 30 -
          (startHour * slotsPerHour + startMinutes / 30)) *
        slotHeight;
    } else {
      // quarter-hour
      const slotsPerHour = 4;
      const slotHeight = cellHeight / slotsPerHour;
      newTop = (startHour * slotsPerHour + startMinutes / 15) * slotHeight;
      newHeight =
        (endHour * slotsPerHour +
          endMinutes / 15 -
          (startHour * slotsPerHour + startMinutes / 15)) *
        slotHeight;
    }

    return {
      ...position,
      top: newTop,
      height: Math.max(newHeight, 20), // Minimum height
    };
  }, [resizePreview, position, viewState.cellHeight]);

  // Check if event is in the past (ended before current date)
  const isPastEvent = useMemo(() => {
    const now = new Date();

    return event.end < now;
  }, [event.end]);

  // Generate CSS styles with resize preview
  const eventStyles = useMemo(() => {
    // Use full width for week and day views
    const useFullWidth = viewMode === "week" || viewMode === "day";
    const baseStyles = getEventStyles(event, tempPosition, {
      useFullWidth,
      isInSingleColumn,
      isPastEvent,
    });

    // Add striped pattern for tentative/needsAction events
    const isStriped = event?.isStriped === true;
    const baseColor = event.color || "#3b82f6";

    if (isStriped && (viewMode === "week" || viewMode === "day")) {
      // For past events, desaturate the striped pattern colors
      const effectiveColor = isPastEvent
        ? desaturateColor(event.backgroundColor || baseColor, 50, 20)
        : event.backgroundColor || baseColor;
      const effectiveBorderColor = isPastEvent ? desaturateColor(baseColor, 40, 10) : baseColor;

      baseStyles.background = getStripedBackground(effectiveColor);
      baseStyles.borderColor = effectiveBorderColor;
      baseStyles.borderWidth = "1px";
      baseStyles.borderStyle = "solid";

      // Recalculate text color based on the effective background
      // For past events, use muted gray instead of pure black/white
      const optimalColor = getOptimalTextColor(effectiveColor);
      if (isPastEvent) {
        // Use muted gray for past events
        baseStyles.color = optimalColor === "#000000" ? "rgb(80, 80, 80)" : "rgb(240, 240, 240)";
      } else {
        baseStyles.color = optimalColor;
      }
    }

    // During resize, adjust opacity and add visual effect
    const isCurrentlyResizing = resizePreview.isResizing;

    // Z-index with hover boost for overlapping events
    // Note: Using +20 instead of +9999 because calendar root uses isolation: isolate
    // which creates a new stacking context, so lower values are sufficient
    const finalZIndex = isHovered ? chronologicalZIndex + 20 : chronologicalZIndex;

    // Get event color for harmonized shadows and borders
    const eventColor = event.color || "#3b82f6";
    const colorRgb = parseColorToRgb(eventColor);
    const shadowColor = colorRgb ? `${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}` : "59, 130, 246";

    return {
      ...baseStyles,
      zIndex: finalZIndex,
      opacity: isDragging ? 0.6 : isCurrentlyResizing ? 0.8 : 1,
      boxShadow: isSelected
        ? `0 0 0 2px rgba(${shadowColor}, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)`
        : isCurrentlyResizing
          ? `0 0 0 2px rgba(${shadowColor}, 0.6), 0 4px 12px rgba(${shadowColor}, 0.2)`
          : isHovered
            ? "0 8px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)"
            : isInConflict
              ? "0 2px 8px rgba(0, 0, 0, 0.1)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
      // Smoother and differentiated transitions
      transition:
        isDragging || isCurrentlyResizing ? "none" : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      borderWidth: isCurrentlyResizing ? "2px" : "1px",
      borderColor: isCurrentlyResizing ? eventColor : undefined,
    };
  }, [
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
  ]);

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
      setHoveredEvent(event.id);
      callbacks?.onEventHover?.(event, e);
    },
    [setHoveredEvent, event, callbacks]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredEvent(undefined);
  }, [setHoveredEvent]);

  // Render based on display style
  const renderEventContent = () => {
    const title = getEventDisplayTitle(event, displayStyle === "compact" ? 15 : 40);

    // For week/day views, show time before title when event is too small to show time on second line
    // Threshold: events smaller than 50px can't display time info properly below title
    const isSmallEvent = position && position.height < 50;
    const showTimePrefix =
      (viewMode === "week" || viewMode === "day") &&
      (displayStyle === "compact" || displayStyle === "minimal" || isSmallEvent);
    const timePrefix = showTimePrefix ? formatTime(event.start, locale) : "";

    switch (displayStyle) {
      case "compact":
        return (
          <div className={cn(getClass("eventContent"), getClass("eventContentCompact"))}>
            <span className={getClass("eventTitle")}>
              {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
              {title}
            </span>
          </div>
        );

      case "minimal":
        return (
          <div className={cn(getClass("eventContent"), getClass("eventContentMinimal"))}>
            <span className={getClass("eventTitle")}>
              {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
              {title}
            </span>
          </div>
        );

      case "full":
      default:
        return (
          <div className={cn(getClass("eventContent"), getClass("eventContentFull"))}>
            <div className={getClass("eventHeader")}>
              <h3 className={getClass("eventTitle")}>
                {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
                {title}
              </h3>
            </div>

            {/* Time information - only show if event is tall enough */}
            {!isSmallEvent && (
              <div className={getClass("eventTime")}>
                {resizePreview.isResizing && resizePreview.startTime && resizePreview.endTime ? (
                  <>
                    <span className={getClass("eventTimeResizing")}>
                      {formatTime(resizePreview.startTime, locale)}
                    </span>
                    <Components.SeparatorIcon />
                    <span className={getClass("eventTimeResizing")}>
                      {formatDuration(resizePreview.startTime, resizePreview.endTime)}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{formatTime(event.start, locale)}</span>
                    <Components.SeparatorIcon />
                    <span>{formatDuration(event.start, event.end)}</span>
                  </>
                )}
              </div>
            )}

            {/* Description (if space available) */}
            {position && position.height > 60 && event.description && (
              <p className={getClass("eventDescription")}>
                {event.description.substring(0, 50)}
                {event.description.length > 50 ? "..." : ""}
              </p>
            )}

            {/* Location (if space available) */}
            {position && position.height > 80 && event.location && (
              <div className={getClass("eventLocation")}>
                <Components.LocationIcon />
                <span className={getClass("eventLocationText")}>{event.location}</span>
              </div>
            )}
          </div>
        );
    }
  };

  // Dynamic CSS classes using headless system
  // States are now handled via data-attributes, not CSS classes
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
      title={`${event.title}\n${formatTime(event.start, locale)} - ${formatTime(event.end, locale)}\n${event.description || ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}`}
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
      {renderEventContent()}

      {/* Resize indicators (full view only) */}
      {/* Resize handles - show for week/day views, always show bottom handle for small events */}
      {(viewMode === "week" || viewMode === "day") && position && (
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
export const MemoizedEventBar = React.memo(EventBar, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isInConflict === nextProps.isInConflict &&
    prevProps.viewMode === nextProps.viewMode &&
    JSON.stringify(prevProps.position) === JSON.stringify(nextProps.position)
  );
});

MemoizedEventBar.displayName = "MemoizedEventBar";

// Default export
export default EventBar;
