// Daily view with detailed vertical hourly timeline
// src/components/ey-calendar/components/DayView.tsx

import { useEffect, useRef } from "react";
import { format, isToday } from "date-fns";
import { DEFAULT_TIME_SLOT_CONFIG } from "../../constants";
import { useCallbacks } from "../../context/CallbacksContext";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useView } from "../../context/ViewContext";
import { useEyCalendarLabels } from "../../hooks";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import type { EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import {
  detectConflictGroups,
  hasConflicts,
  resolveConflictGroup,
} from "../../utils/conflictUtils";
import {
  getEventColor,
  getEventsForDate,
  getPastEventColors,
  isMultiDayEvent,
} from "../../utils/eventUtils";
import {
  getEffectivePositionHeight,
  getSlotHeight,
  getTimeSlotsByGranularity,
} from "../../utils/slotUtils";
import { EventBar } from "../events";

/**
 * Interface for DayView props
 */
export interface DayViewProps {
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Daily view with detailed hourly timeline
 */
export function DayView({ className = "" }: DayViewProps) {
  const { state: viewState } = useView();
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const { callbacks } = useCallbacks();
  const labels = useEyCalendarLabels(options.labels, options.locale);

  // Extract from states
  const { currentDate, cellHeight } = viewState;
  const { events } = eventsState;
  const { makeDropTarget } = useDragAndDrop();
  const dayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Full 24h grid according to configured granularity
  const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
  const timeSlots = getTimeSlotsByGranularity(granularity);
  const slotHeight = getSlotHeight(granularity, cellHeight);
  const effectiveSlotHeight = getEffectivePositionHeight(slotHeight);

  /**
   * Handle click on a time slot - trigger callback for event creation
   * Calculates the exact time based on click position
   */
  const handleSlotClick = (e: React.MouseEvent) => {
    // Calculate the clicked time based on Y position
    const rect = dayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeY = e.clientY - rect.top + (scrollContainerRef.current?.scrollTop || 0);
    const slotIndex = Math.floor(relativeY / slotHeight);
    const slot = timeSlots[Math.min(slotIndex, timeSlots.length - 1)];

    if (!slot) return;

    // Create a Date with the calculated time
    const clickedTime = new Date(currentDate);
    clickedTime.setHours(slot.hour, slot.minutes, 0, 0);

    callbacks?.onTimeSlotClick?.(clickedTime, e);
  };

  // Initialize drop target for the entire day view
  useEffect(() => {
    const element = dayRef.current;
    if (element) {
      const cleanup = makeDropTarget(element, {
        targetDate: currentDate,
        targetResourceId: undefined,
        viewMode: "day",
        cellHeight,
      });

      return cleanup;
    }
  }, [currentDate, makeDropTarget, cellHeight]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      // Calculate scroll position (current time minus 2 hours for context)
      const scrollHour = Math.max(0, currentHour - 2);
      const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
      const slotHeight = getSlotHeight(granularity, cellHeight);
      const effectiveSlotHeight = getEffectivePositionHeight(slotHeight);
      const slotsPerHour = granularity === "hour" ? 1 : granularity === "half-hour" ? 2 : 4;
      const minutesPerSlot = 60 / slotsPerHour;

      const scrollPosition =
        (scrollHour * slotsPerHour + currentMinutes / minutesPerSlot) * effectiveSlotHeight;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      });
    }
  }, [cellHeight]);

  // Working hours configuration for visual highlighting
  const workingStartHour = DEFAULT_TIME_SLOT_CONFIG.startHour;
  const workingEndHour = DEFAULT_TIME_SLOT_CONFIG.endHour;

  // Get locale for date formatting
  const locale = options.locale;

  // Get events for the day (including multi-day events that overlap this day)
  const allDayEvents = getEventsForDate(events, currentDate);

  // Separate all-day/multi-day events from timed events
  const allDayOnlyEvents = allDayEvents.filter((e) => e.isAllDay || isMultiDayEvent(e));
  const timedEvents = allDayEvents.filter((e) => !e.isAllDay && !isMultiDayEvent(e));

  // Calculate all-day section height
  const allDayRowHeight = 24;
  const allDayRowGap = 2;
  const hasAllDayEvents = allDayOnlyEvents.length > 0;
  const allDaySectionHeight = hasAllDayEvents
    ? Math.min(allDayOnlyEvents.length, 3) * (allDayRowHeight + allDayRowGap) + 8
    : 0;

  return (
    <div className={cn(getClass("dayView"), className)} data-eycalendar-day-view="">
      {/* All-day events section (sticky) */}
      {hasAllDayEvents && (
        <div
          className={cn(
            getClass("dayAllDaySection"),
            "sticky top-0 z-20 border-b bg-white dark:bg-gray-900"
          )}
          data-eycalendar-allday-section=""
          style={{ minHeight: allDaySectionHeight }}
        >
          <div className="flex">
            {/* Label column */}
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-gray-200 text-xs text-gray-500 dark:border-gray-700">
              <span>{labels.viewHeadStatic}</span>
            </div>
            {/* All-day events */}
            <div className="relative flex-1 p-1">
              {allDayOnlyEvents.slice(0, 3).map((event, idx) => (
                <DayAllDayEventBar
                  key={event.id}
                  event={event}
                  locale={locale}
                  rowHeight={allDayRowHeight}
                  rowIndex={idx}
                  rowGap={allDayRowGap}
                />
              ))}
              {allDayOnlyEvents.length > 3 && (
                <div className="mt-1 text-xs text-gray-500">
                  +{allDayOnlyEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline and events */}
      <div
        ref={scrollContainerRef}
        className={getClass("dayContent")}
        data-eycalendar-day-content=""
      >
        <div className={getClass("dayGrid")} data-eycalendar-day-grid="">
          {/* Hours column */}
          <div className={getClass("dayTimeColumn")} data-eycalendar-time-column="">
            {timeSlots
              .filter((slot) => slot.minutes === 0) // Show only full hours
              .map((slot) => (
                <div
                  key={slot.index}
                  className={getClass("dayTimeSlot")}
                  style={{ height: `${cellHeight}px` }}
                >
                  <span className={getClass("dayTimeSlotText")}>
                    {slot.hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
          </div>

          {/* Main column with events */}
          <div
            ref={dayRef}
            className={getClass("dayMainColumn")}
            onClick={handleSlotClick}
            data-eycalendar-day-main=""
            data-drop-target="true"
            data-testid="day-column"
          >
            {/* Time slots grid */}
            {timeSlots.map((slot) => (
              <div
                key={slot.index}
                className={cn(
                  getClass("daySlotCell"),
                  slot.minutes === 0 && getClass("daySlotCellHour"), // Full hour cells
                  slot.hour >= workingStartHour &&
                    slot.hour < workingEndHour &&
                    getClass("dayWorkingHours")
                )}
                data-eycalendar-slot=""
                data-hour={slot.hour}
                data-minutes={slot.minutes}
                style={{ height: `${slotHeight}px` }}
              />
            ))}

            {/* Events container */}
            <div className={getClass("dayEventsContainer")} data-eycalendar-events-container="">
              {(() => {
                // Filter unique timed events (all-day and multi-day are shown in sticky header)
                const uniqueEvents = timedEvents.filter((event, index, array) => {
                  return array.findIndex((e) => e.id === event.id) === index;
                });

                // Detect and resolve conflicts
                const conflictGroups = detectConflictGroups(uniqueEvents);
                const resolvedGroups = conflictGroups.map((group) =>
                  resolveConflictGroup(group, undefined, "day")
                );

                // Create a map of events with their new positions
                const eventColumnMap = new Map();
                resolvedGroups.forEach((group) => {
                  group.columns.forEach((column, columnIndex) => {
                    column.events.forEach((event) => {
                      eventColumnMap.set(event.id, {
                        columnIndex,
                        columnCount: group.columns.length,
                        columnWidth: column.width,
                        columnX: column.x,
                      });
                    });
                  });
                });

                return uniqueEvents.map((event) => {
                  // Detect conflicts for this event
                  const eventHasConflicts = hasConflicts(event, uniqueEvents);

                  // Get column info if event is in conflict
                  const columnInfo = eventColumnMap.get(event.id);

                  // Calculate position for day view
                  const startDate = new Date(event.start);
                  const endDate = new Date(event.end);

                  // Calculate effective start/end times for this day
                  // For multi-day events, clamp to day boundaries
                  const dayStart = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    0,
                    0,
                    0
                  );
                  const dayEnd = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    23,
                    59,
                    59
                  );

                  // Effective start: max of event start or day start
                  const effectiveStart = startDate < dayStart ? dayStart : startDate;
                  // Effective end: min of event end or next day start
                  const nextDayStart = new Date(dayEnd.getTime() + 1);
                  const effectiveEnd = endDate > nextDayStart ? nextDayStart : endDate;

                  const startHour = effectiveStart.getHours();
                  const startMinutes = effectiveStart.getMinutes();
                  const endHour =
                    effectiveEnd.getHours() +
                    (effectiveEnd.getDate() !== currentDate.getDate() ? 24 : 0);
                  const endMinutes = effectiveEnd.getMinutes();

                  // Position in pixels - Using absolute hours in the 24h grid
                  const slotsPerHour =
                    granularity === "hour" ? 1 : granularity === "half-hour" ? 2 : 4;
                  const minutesPerSlot = 60 / slotsPerHour;

                  const top =
                    (startHour * slotsPerHour + startMinutes / minutesPerSlot) *
                    effectiveSlotHeight;
                  const height =
                    (endHour * slotsPerHour +
                      endMinutes / minutesPerSlot -
                      (startHour * slotsPerHour + startMinutes / minutesPerSlot)) *
                    slotHeight;

                  // Calculate z-index: shorter events on top (more visible)
                  // Normalized range 1-100, hover adds +20 (calendar uses isolation: isolate)
                  const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
                  const maxDuration = 24 * 60; // 1440 minutes max (24h)
                  // Normalize to 1-100: shorter = higher z-index
                  const chronologicalZIndex = Math.max(
                    1,
                    Math.floor(100 - (durationMinutes / maxDuration) * 99)
                  );

                  // Detect if event is in a single column (no conflicts)
                  const isInSingleColumn = !eventHasConflicts;

                  // Position and conflict management
                  let position;

                  if (columnInfo && eventHasConflicts) {
                    // Event in conflict: adjust width and position
                    const leftPercent = columnInfo.columnX;
                    const widthPercent = columnInfo.columnWidth;

                    position = {
                      x: 0,
                      y: top,
                      width: 200,
                      height: Math.max(height, 30),
                      top,
                      left: 0,
                    };

                    const wrapperStyleWithPosition = {
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: "0",
                      bottom: "0",
                    };

                    return (
                      <div
                        key={event.id}
                        className={getClass("dayEventWrapper")}
                        style={wrapperStyleWithPosition}
                      >
                        <EventBar
                          event={event}
                          position={position}
                          viewMode="day"
                          isInConflict={eventHasConflicts}
                          chronologicalZIndex={chronologicalZIndex}
                          isInSingleColumn={isInSingleColumn}
                        />
                      </div>
                    );
                  } else {
                    // Normal event: default position
                    position = {
                      x: 0,
                      y: top,
                      width: 200,
                      height: Math.max(height, 30),
                      top,
                      left: 0,
                    };

                    return (
                      <div key={event.id} className={getClass("dayEventWrapper")}>
                        <EventBar
                          event={event}
                          position={position}
                          viewMode="day"
                          isInConflict={eventHasConflicts}
                          chronologicalZIndex={chronologicalZIndex}
                          isInSingleColumn={isInSingleColumn}
                        />
                      </div>
                    );
                  }
                });
              })()}
            </div>

            {/* Current time line if today */}
            {isToday(currentDate) && <CurrentTimeLine />}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Current time indicator line
 */
function CurrentTimeLine() {
  const { state: viewState } = useView();
  const { options } = useOptions();
  const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
  const slotHeight = getSlotHeight(granularity, viewState.cellHeight);
  const effectiveSlotHeight = getEffectivePositionHeight(slotHeight);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Position in pixels - Using absolute hours in the 24h grid
  const slotsPerHour = granularity === "hour" ? 1 : granularity === "half-hour" ? 2 : 4;
  const minutesPerSlot = 60 / slotsPerHour;

  const top =
    (currentHour * slotsPerHour + Math.floor(currentMinutes / minutesPerSlot)) *
      effectiveSlotHeight +
    (currentMinutes % minutesPerSlot) * (effectiveSlotHeight / minutesPerSlot);

  return (
    <div
      className={getClass("dayCurrentTimeLine")}
      style={{ top: `${top}px` }}
      data-eycalendar-current-time=""
    >
      <div className={getClass("dayCurrentTimeLineInner")}>
        <div className={getClass("dayCurrentTimeLineDot")} />
        <div className={getClass("dayCurrentTimeLineBar")} />
      </div>
    </div>
  );
}

/**
 * Interface for DayAllDayEventBar props
 */
interface DayAllDayEventBarProps {
  event: EyCalendarEvent;
  locale?: import("date-fns").Locale;
  rowHeight: number;
  rowIndex: number;
  rowGap: number;
}

/**
 * All-day event bar in the day view header
 */
function DayAllDayEventBar({ event, locale, rowHeight, rowIndex, rowGap }: DayAllDayEventBarProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Initialize drag & drop
  useEffect(() => {
    const element = eventRef.current;
    if (element) {
      const cleanup = makeDraggable(element, event);

      return cleanup;
    }
  }, [event, makeDraggable]);

  // Event handlers
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    callbacks?.onEventClick?.(event, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    callbacks?.onEventDoubleClick?.(event, e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Row positioning
  const topOffset = rowIndex * (rowHeight + rowGap);

  // Event color
  const eventColor = getEventColor(event);

  // Check if event is in the past
  const isPastEvent = event.end < new Date();

  // Get computed colors (handles past event lightening)
  const computedColors = getPastEventColors(eventColor, event?.isStriped, isPastEvent);

  return (
    <div
      ref={eventRef}
      className={cn(
        getClass("dayAllDayEventBar"),
        isPastEvent && getClass("eventPast"),
        "absolute right-0 left-0 cursor-pointer rounded",
        "flex items-center truncate px-2 text-xs font-medium",
        "transition-opacity hover:opacity-90"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-allday-event=""
      data-event-id={event.id}
      style={{
        top: topOffset,
        height: rowHeight,
        background: computedColors.background,
        color: computedColors.color,
        ...(event?.isStriped && {
          borderColor: computedColors.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP", { locale })} - ${format(new Date(event.end), "PP", { locale })}\n${event.description || ""}`}
    >
      <span className="truncate">{event.title}</span>
    </div>
  );
}

/**
 * Default export
 */
export default DayView;
