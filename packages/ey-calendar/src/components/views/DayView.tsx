// Daily view with detailed vertical hourly timeline
// src/components/ey-calendar/components/DayView.tsx

import { useCallback, useEffect, useMemo, useRef } from "react";
import { format, isToday } from "date-fns";
import { DEFAULT_TIME_SLOT_CONFIG } from "../../constants";
import { useCallbacks } from "../../context/CallbacksContext";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useViewCellHeight, useViewCurrentDate } from "../../context/ViewContext";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEventKeyboardInteractions } from "../../hooks/useEventKeyboardInteractions";
import { useTimeSlotInteractions } from "../../hooks/useTimeSlotInteractions";
import type { EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import {
  getEventColor,
  getEventsForDate,
  getPastEventColors,
  isMultiDayEvent,
} from "../../utils/eventUtils";
import { prepareIntradayEventLayouts } from "../../utils/intradayEventLayout";
import {
  getEffectivePositionHeight,
  getSlotHeight,
  getTimeSlotsByGranularity,
} from "../../utils/slotUtils";
import { MemoizedEventBar } from "../events";

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
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const labels = options.labels;
  const timeSlotConfig = options.timeSlots ?? DEFAULT_TIME_SLOT_CONFIG;
  const creationEnabled = options.enableCreate !== false && options.readonly !== true;
  const showToday = options.showToday !== false;

  // Extract from states
  const currentDate = useViewCurrentDate();
  const cellHeight = useViewCellHeight();
  const { events } = eventsState;
  const { makeDropTarget } = useDragAndDrop();
  const { triggerTimeSlotClick, triggerTimeSlotDoubleClick } = useTimeSlotInteractions();
  const dayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getClass = options.getClass;

  // Full 24h grid according to configured granularity
  const granularity = timeSlotConfig.granularity;
  const timeSlots = getTimeSlotsByGranularity(granularity);
  const slotHeight = getSlotHeight(granularity, cellHeight);

  /**
   * Handle click on a time slot - trigger callback for event creation
   * Calculates the exact time based on click position
   */
  const handleSlotClick = (e: React.MouseEvent) => {
    if (!creationEnabled) return;

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

    triggerTimeSlotClick(clickedTime, e, { slotIndex: slot.index });
  };

  const handleSlotDoubleClick = (e: React.MouseEvent) => {
    if (!creationEnabled) return;

    const rect = dayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeY = e.clientY - rect.top + (scrollContainerRef.current?.scrollTop || 0);
    const slotIndex = Math.floor(relativeY / slotHeight);
    const slot = timeSlots[Math.min(slotIndex, timeSlots.length - 1)];

    if (!slot) return;

    const clickedTime = new Date(currentDate);
    clickedTime.setHours(slot.hour, slot.minutes, 0, 0);

    triggerTimeSlotDoubleClick(clickedTime, e);
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
      const granularity = timeSlotConfig.granularity;
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
  }, [cellHeight, timeSlotConfig.granularity]);

  // Working hours configuration for visual highlighting
  const workingStartHour = timeSlotConfig.startHour;
  const workingEndHour = timeSlotConfig.endHour;

  // Get locale for date formatting
  const locale = options.locale;

  const { allDayOnlyEvents, timedEventLayouts } = useMemo(() => {
    const visibleEvents = getEventsForDate(events, currentDate);
    const allDayOnlyEvents = visibleEvents.filter(
      (event) => event.isAllDay || isMultiDayEvent(event)
    );
    const timedEvents = visibleEvents.filter((event) => !event.isAllDay && !isMultiDayEvent(event));

    return {
      allDayOnlyEvents,
      timedEventLayouts: prepareIntradayEventLayouts({
        date: currentDate,
        events: timedEvents,
        minHeight: 30,
        pixelsPerMinute: cellHeight / 60,
        viewMode: "day",
      }),
    };
  }, [events, currentDate, cellHeight]);

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
          className={getClass("dayAllDaySection")}
          data-eycalendar-allday-section=""
          style={{ minHeight: allDaySectionHeight }}
        >
          <div className={getClass("dayAllDayLayout")}>
            {/* Label column */}
            <div className={getClass("dayAllDayLabel")}>
              <span>{labels.viewHeadStatic}</span>
            </div>
            {/* All-day events */}
            <div className={getClass("dayAllDayContent")}>
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
                <div className={getClass("dayAllDayMore")}>+{allDayOnlyEvents.length - 3} more</div>
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
            onDoubleClick={handleSlotDoubleClick}
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
              {timedEventLayouts.map(
                ({
                  event,
                  isInConflict,
                  isInSingleColumn,
                  chronologicalZIndex,
                  position,
                  columnInfo,
                }) => (
                  <div
                    key={event.id}
                    className={getClass("dayEventWrapper")}
                    style={
                      columnInfo && isInConflict
                        ? {
                            left: `${columnInfo.columnX}%`,
                            width: `${columnInfo.columnWidth}%`,
                            top: "0",
                            bottom: "0",
                          }
                        : undefined
                    }
                  >
                    <MemoizedEventBar
                      event={event}
                      position={position}
                      viewMode="day"
                      isInConflict={isInConflict}
                      chronologicalZIndex={chronologicalZIndex}
                      isInSingleColumn={isInSingleColumn}
                    />
                  </div>
                )
              )}
            </div>

            {/* Current time line if today */}
            {showToday && isToday(currentDate) && <CurrentTimeLine />}
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
  const { options } = useOptions();
  const granularity = (options.timeSlots ?? DEFAULT_TIME_SLOT_CONFIG).granularity;
  const cellHeight = useViewCellHeight();
  const slotHeight = getSlotHeight(granularity, cellHeight);
  const effectiveSlotHeight = getEffectivePositionHeight(slotHeight);
  const getClass = options.getClass;

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
  const labels = options.labels;
  const getClass = options.getClass;

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

  const handleKeyActivate = useCallback(
    (e: React.KeyboardEvent) => {
      callbacks?.onEventClick?.(event, e);
    },
    [callbacks, event]
  );

  const handleKeyDown = useEventKeyboardInteractions(event, handleKeyActivate);

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
      className={cn(getClass("dayAllDayEventBar"), isPastEvent && getClass("eventPast"))}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={labels.ariaEvent(event.title)}
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
      <span className={getClass("dayAllDayTitle")}>{event.title}</span>
    </div>
  );
}

/**
 * Default export
 */
export default DayView;
