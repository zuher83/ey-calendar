// Weekly view with hourly timeline and precise positioning
// src/components/ey-calendar/components/views/WeekView.tsx

import { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { useCallbacks } from "../../context/CallbacksContext";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useView } from "../../context/ViewContext";
import { useEyCalendarLabels, useTimeCalculations } from "../../hooks";
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
  calculateEventSegments,
  getEventColor,
  getEventsForDate,
  getEventsForWeek,
  getPastEventColors,
  isMultiDayEvent,
  type EventSegment,
} from "../../utils/eventUtils";
import { EventBar } from "../events/EventBar";

/**
 * Interface for WeekView props
 */
export interface WeekViewProps {
  className?: string;
}

/**
 * Weekly view with hourly timeline
 */
export function WeekView({ className = "" }: WeekViewProps) {
  const { state: viewState } = useView();
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const { viewInfo } = useTimeCalculations();
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const labels = useEyCalendarLabels(options.labels, options.locale);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Get locale for date formatting
  const locale = options.locale;

  // Extract from states
  const cellHeight = viewState.cellHeight;
  const events = eventsState.events;

  // Get week days
  const weekDays = viewInfo.visibleDays;

  // Hook to detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== "undefined") {
        setIsDesktop(window.innerWidth >= 640);
      }
    };

    checkScreenSize();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkScreenSize);

      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      // Calculate scroll position (current time minus 2 hours for context)
      const scrollHour = Math.max(0, currentHour - 2);
      const scrollPosition = (scrollHour + currentMinutes / 60) * cellHeight;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      });
    }
  }, [cellHeight]);

  // Full 24h grid (0h to 23h)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Separate all-day/multi-day events from timed events
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  const weekEvents = getEventsForWeek(events, weekStart, weekEnd);

  // All-day and multi-day events go in the sticky header
  const allDayEvents = weekEvents.filter((e) => e.isAllDay || isMultiDayEvent(e));

  // Calculate segments for all-day events (like MonthView)
  const maxAllDayRows = 3;
  const allDaySegments = calculateEventSegments(allDayEvents, weekDays, maxAllDayRows);

  // Function to get TIMED events for a day (excluding all-day and multi-day)
  const getTimedEventsForDay = (date: Date) => {
    const dayEvents = getEventsForDate(events, date);

    return dayEvents.filter((e) => !e.isAllDay && !isMultiDayEvent(e));
  };

  // Calculate all-day section height
  const allDayRowHeight = 24;
  const allDayRowGap = 2;
  const hasAllDayEvents = allDaySegments.length > 0;
  const maxRowUsed = hasAllDayEvents ? Math.max(...allDaySegments.map((s) => s.row)) + 1 : 0;
  const allDaySectionHeight = hasAllDayEvents
    ? maxRowUsed * (allDayRowHeight + allDayRowGap) + 8
    : 0;

  return (
    <div className={cn(getClass("weekView"), className)} data-eycalendar-week-view="">
      {/* Container for alignment synchronization */}
      <div className={getClass("weekViewContainer")}>
        {/* Header with weekday names */}
        <div className={getClass("weekHeader")} data-eycalendar-week-header="">
          <div
            className={getClass("weekHeaderGrid")}
            style={{
              gridTemplateColumns: isDesktop
                ? "48px repeat(7, minmax(0, 1fr))"
                : "48px repeat(5, minmax(0, 1fr))",
            }}
          >
            {/* Empty column for hours */}
            <div className={getClass("weekTimeColumn")} />

            {/* Day headers - clickable for navigation (week → day) */}
            {weekDays.map((day, index) => (
              <WeekDayHeader
                key={day.toISOString()}
                day={day}
                locale={locale}
                isHidden={!isDesktop && index >= 5}
              />
            ))}
          </div>
        </div>

        {/* All-day events section (sticky) */}
        {hasAllDayEvents && (
          <div
            className={getClass("weekAllDaySection")}
            data-eycalendar-allday-section=""
            style={{ minHeight: allDaySectionHeight }}
          >
            {/* Use same grid structure as header for perfect alignment */}
            <div
              className={getClass("weekHeaderGrid")}
              style={{
                gridTemplateColumns: isDesktop
                  ? "48px repeat(7, minmax(0, 1fr))"
                  : "48px repeat(5, minmax(0, 1fr))",
                height: allDaySectionHeight,
              }}
            >
              {/* Empty column for alignment */}
              <div className={cn(getClass("weekTimeColumn"), getClass("weekAllDayLabel"))}>
                <span>{labels.viewHeadStatic}</span>
              </div>

              {/* Day columns with events */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    getClass("weekAllDayColumn"),
                    !isDesktop && dayIndex >= 5 && getClass("weekAllDayColumnHidden")
                  )}
                >
                  {/* Render segments that START in this column */}
                  {allDaySegments
                    .filter((s) => s.startCol === dayIndex)
                    .map((segment) => (
                      <WeekAllDayEventBar
                        key={`${segment.event.id}-${segment.startCol}`}
                        segment={segment}
                        locale={locale}
                        rowHeight={allDayRowHeight}
                        rowGap={allDayRowGap}
                        totalCols={isDesktop ? 7 : 5}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hours and events grid */}
        <div ref={scrollContainerRef} className={getClass("weekGrid")} data-eycalendar-week-grid="">
          <div
            className={getClass("weekGridInner")}
            style={{
              gridTemplateColumns: isDesktop
                ? "48px repeat(7, minmax(0, 1fr))"
                : "48px repeat(5, minmax(0, 1fr))",
            }}
          >
            {/* Hours column */}
            <div className={getClass("weekTimeColumn")} data-eycalendar-time-column="">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={getClass("weekTimeSlot")}
                  style={{ height: `${cellHeight}px` }}
                >
                  <span className={getClass("weekTimeSlotText")}>
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={cn(
                  getClass("weekDayColumn"),
                  !isDesktop && index >= 5 && getClass("weekDayColumnHidden")
                )}
              >
                <WeekDayColumn date={day} events={getTimedEventsForDay(day)} hours={hours} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interface for WeekDayHeader props
 */
interface WeekDayHeaderProps {
  day: Date;
  locale?: import("date-fns").Locale;
  isHidden: boolean;
}

/**
 * Day header in the weekly view - clickable for navigation (week → day)
 */
function WeekDayHeader({ day, locale, isHidden }: WeekDayHeaderProps) {
  const { setCurrentDate, setViewMode } = useView();
  const { options } = useOptions();

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  /**
   * Handle click on day header (name + number) - navigate to day view (cascade: week → day)
   */
  const handleDayHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(day);
    setViewMode("day"); // Cascade: week → day
  };

  return (
    <div
      className={cn(
        getClass("weekHeaderDay"),
        getClass("weekHeaderDayClickable"),
        isHidden && getClass("weekDayColumnHidden")
      )}
      onClick={handleDayHeaderClick}
      data-eycalendar-day-header=""
      data-today={isToday(day) ? "true" : undefined}
    >
      <span className={getClass("weekHeaderDayName")}>{format(day, "EEE", { locale })}</span>
      <span
        className={getClass("weekHeaderDayNumber")}
        data-eycalendar-day-number=""
        data-today={isToday(day) ? "true" : undefined}
      >
        {format(day, "d", { locale })}
      </span>
    </div>
  );
}

/**
 * Interface for WeekDayColumn props
 */
interface WeekDayColumnProps {
  date: Date;
  events: EyCalendarEvent[];
  hours: number[];
}

/**
 * Day column in the weekly view
 */
function WeekDayColumn({ date, events, hours }: WeekDayColumnProps) {
  const { state: viewState } = useView();
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDropTarget } = useDragAndDrop();
  const dayRef = useRef<HTMLDivElement>(null);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Cell configuration
  const cellHeight = viewState.cellHeight;

  // Initialize drop target
  useEffect(() => {
    const element = dayRef.current;
    if (element) {
      const cleanup = makeDropTarget(element, {
        targetDate: date,
        targetResourceId: undefined,
        viewMode: "week",
        cellHeight,
      });

      return cleanup;
    }
  }, [date, makeDropTarget, cellHeight]);

  /**
   * Handle click on a time slot - trigger callback for event creation
   * Calculates the exact time based on click position
   */
  const handleSlotClick = (e: React.MouseEvent) => {
    // Calculate the clicked time based on Y position
    const rect = dayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeY = e.clientY - rect.top;
    const hourIndex = Math.floor(relativeY / cellHeight);
    const minuteFraction = (relativeY % cellHeight) / cellHeight;
    const minutes = Math.floor((minuteFraction * 60) / 15) * 15; // Round to 15-minute increments

    // Create a Date with the calculated time
    const clickedTime = new Date(date);
    clickedTime.setHours(hourIndex, minutes, 0, 0);

    callbacks?.onTimeSlotClick?.(clickedTime, e);
  };

  return (
    <div
      ref={dayRef}
      className={getClass("weekDayColumnInner")}
      onClick={handleSlotClick}
      data-eycalendar-day-column=""
      data-drop-target="true"
      data-testid="day-column"
    >
      {/* Hours grid */}
      {hours.map((hour, index) => (
        <div
          key={hour}
          className={getClass("weekHourCell")}
          id={`hour-${hour}`}
          data-eycalendar-hour-cell=""
          data-hour={hour}
          data-position={index * cellHeight}
          style={{
            position: "relative",
            height: `${cellHeight}px`,
          }}
        />
      ))}

      {/* Events container */}
      <div className={getClass("weekEventsContainer")} data-eycalendar-events-container="">
        {(() => {
          // Filter unique events
          const uniqueEvents = events.filter((event, index, array) => {
            return array.findIndex((e) => e.id === event.id) === index;
          });

          // Detect and resolve conflicts
          const conflictGroups = detectConflictGroups(uniqueEvents);
          const resolvedGroups = conflictGroups.map((group) =>
            resolveConflictGroup(group, undefined, "week")
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
            // Calculate position for week view
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);

            // Ensure these are valid dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              return null;
            }

            // Detect conflicts for this event
            const eventHasConflicts = hasConflicts(event, uniqueEvents);

            // Get column info if event is in conflict
            const columnInfo = eventColumnMap.get(event.id);

            // Calculate effective start/end times for this day
            // For multi-day events, clamp to day boundaries
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            const dayEnd = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
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
              effectiveEnd.getHours() + (effectiveEnd.getDate() !== date.getDate() ? 24 : 0);
            const endMinutes = effectiveEnd.getMinutes();

            // Position in pixels - Preserve perfect vertical alignment
            const top = (startHour + startMinutes / 60) * cellHeight;
            const height =
              (endHour + endMinutes / 60 - (startHour + startMinutes / 60)) * cellHeight;

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

            // Full position for EventBar with conflict management
            let position;

            if (columnInfo && eventHasConflicts) {
              // Event in conflict: adjust width and position
              const leftPercent = columnInfo.columnX;
              const widthPercent = columnInfo.columnWidth;

              position = {
                x: 0,
                y: top,
                width: 200,
                height: Math.max(height, 20),
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
                  className={getClass("weekEventWrapperConflict")}
                  style={wrapperStyleWithPosition}
                >
                  <EventBar
                    event={event}
                    position={position}
                    viewMode="week"
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
                height: Math.max(height, 20),
                top,
                left: 0,
              };

              return (
                <div key={event.id} className={getClass("weekEventWrapper")}>
                  <EventBar
                    event={event}
                    position={position}
                    viewMode="week"
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
    </div>
  );
}

/**
 * Interface for WeekAllDayEventBar props
 */
interface WeekAllDayEventBarProps {
  segment: EventSegment;
  locale?: import("date-fns").Locale;
  rowHeight: number;
  rowGap: number;
  totalCols: number;
}

/**
 * All-day event bar that spans multiple days in the week view header
 */
function WeekAllDayEventBar({ segment, locale, rowHeight, rowGap }: WeekAllDayEventBarProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);

  const { event, startCol: _startCol, span, isStart, isEnd, row } = segment;
  void _startCol; // Used for key generation, not positioning

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

  // Calculate position - now relative to the starting cell
  // Width spans multiple columns (100% per column)
  const widthPercent = span * 100;

  // Row positioning
  const topOffset = row * (rowHeight + rowGap) + 4; // +4 for top padding

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
        getClass("weekAllDayEventBar"),
        isPastEvent && getClass("eventPast"),
        // Rounded corners based on segment position
        isStart && isEnd && getClass("weekAllDayEventBarFull"),
        isStart && !isEnd && getClass("weekAllDayEventBarStart"),
        !isStart && isEnd && getClass("weekAllDayEventBarEnd"),
        !isStart && !isEnd && getClass("weekAllDayEventBarMiddle")
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-allday-event=""
      data-event-id={event.id}
      style={{
        left: 2,
        width: `calc(${widthPercent}% - 4px)`,
        top: topOffset,
        height: rowHeight,
        background: computedColors.background,
        color: computedColors.color,
        ...(event?.isStriped && {
          borderColor: computedColors.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
        zIndex: 10, // Ensure bars appear above column backgrounds
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP", { locale })} - ${format(new Date(event.end), "PP", { locale })}\n${event.description || ""}`}
    >
      <span className={getClass("weekAllDayEventBarContent")}>{event.title}</span>
    </div>
  );
}

/**
 * Default export
 */
export default WeekView;
