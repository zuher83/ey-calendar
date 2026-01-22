// Monthly view with 7x6 grid and multi-day spanning events

import { useEffect, useRef, useState } from "react";
import { addDays, format, getWeek, isSameDay, isSameMonth, startOfWeek } from "date-fns";
import { useCallbacks } from "../../context/CallbacksContext";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useView } from "../../context/ViewContext";
import { useTimeCalculations } from "../../hooks";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import type { EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import {
  calculateEventSegments,
  getEventColor,
  getEventDotClasses,
  getEventsForDate as getEventsForDateUtil,
  getEventsForWeek,
  getPastEventColors,
  isMultiDayEvent,
  type EventSegment,
} from "../../utils/eventUtils";

/**
 * Hook to calculate how many event rows can be displayed in a cell
 * Based on actual available height, not just screen width
 */
function useMaxEventRows(numberOfWeeks: number): number {
  const [maxRows, setMaxRows] = useState(3);

  useEffect(() => {
    const updateMaxRows = () => {
      if (typeof window === "undefined") {
        return;
      }

      // Constants matching those in MonthDayCell
      const eventRowHeight = 20;
      const eventRowGap = 2;
      const dayNumberHeight = 24;
      const cellPadding = 8; // Approximate padding

      // Estimate available height for month grid (viewport - toolbar - header - margins)
      const viewportHeight = window.innerHeight;
      const estimatedOverhead = 150; // Toolbar, header, margins
      const gridHeight = viewportHeight - estimatedOverhead;

      // Height per week row
      const rowHeight = gridHeight / numberOfWeeks;

      // Available height for events in each cell
      const availableHeight = rowHeight - dayNumberHeight - cellPadding;

      // Calculate how many events can fit
      const calculatedRows = Math.floor(availableHeight / (eventRowHeight + eventRowGap));

      // Clamp between 2 and 8 rows
      setMaxRows(Math.max(2, Math.min(8, calculatedRows)));
    };

    updateMaxRows();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateMaxRows);

      return () => window.removeEventListener("resize", updateMaxRows);
    }
  }, [numberOfWeeks]);

  return maxRows;
}
/**
 * Interface for MonthView props
 */
export interface MonthViewProps {
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Monthly view with 7x6 grid and spanning multi-day events
 */
export function MonthView({ className = "" }: MonthViewProps) {
  const { state: viewState } = useView();
  const { state: eventsState } = useEvents();
  const { options } = useOptions();

  // Extract from states
  const { currentDate } = viewState;
  const { events } = eventsState;
  const { viewInfo } = useTimeCalculations();

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Get locale for date formatting
  const locale = options.locale;

  // Calculate days to display
  const monthDays = viewInfo.visibleDays;

  // Calculate number of weeks (rows) dynamically - can be 4, 5, or 6 weeks
  const numberOfWeeks = Math.ceil(monthDays.length / 7);

  // Calculate max event rows based on available height
  const maxEventRows = useMaxEventRows(numberOfWeeks);

  // Generate weekday headers starting from Monday (weekStartsOn: 1)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1, locale });
  const weekDayHeaders = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);

    return format(date, "EEE", { locale });
  });

  // Split monthDays into weeks (arrays of 7 days)
  const weeks: Date[][] = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  return (
    <div className={cn(getClass("monthView"), className)} data-eycalendar-month-view="">
      {/* Weekday headers */}
      <div className={getClass("monthHeader")} data-eycalendar-month-header="">
        <div
          className={getClass("monthHeaderGrid")}
          style={{
            gridTemplateColumns: options.showWeekNumbers
              ? "auto repeat(7, minmax(0, 1fr))"
              : "repeat(7, minmax(0, 1fr))",
          }}
        >
          {/* Week number header placeholder */}
          {options.showWeekNumbers && (
            <div
              className={getClass("monthHeaderWeekNumberCell")}
              data-eycalendar-week-number-header=""
            />
          )}
          {weekDayHeaders.map((day, index) => (
            <div
              key={day}
              className={cn(
                getClass("monthHeaderDay"),
                index < 6 && getClass("monthHeaderDayBorder")
              )}
              data-eycalendar-weekday-header=""
            >
              <span className={getClass("monthHeaderDayText")}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weeks grid - rows calculated dynamically based on month */}
      <div
        className={getClass("monthGrid")}
        data-eycalendar-month-grid=""
        style={{ gridTemplateRows: `repeat(${numberOfWeeks}, minmax(0, 1fr))` }}
      >
        {weeks.map((weekDays, weekIndex) => (
          <MonthWeekRow
            key={`week-${weekIndex}`}
            weekDays={weekDays}
            events={events}
            currentDate={currentDate}
            locale={locale}
            maxEventRows={maxEventRows}
            showWeekNumbers={options.showWeekNumbers}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Interface for MonthWeekRow props
 */
interface MonthWeekRowProps {
  weekDays: Date[];
  events: EyCalendarEvent[];
  currentDate: Date;
  locale?: import("date-fns").Locale;
  maxEventRows: number;
  showWeekNumbers?: boolean;
}

/**
 * A week row in the month view containing day cells and spanning event bars
 */
function MonthWeekRow({
  weekDays,
  events,
  currentDate,
  locale,
  maxEventRows,
  showWeekNumbers,
}: MonthWeekRowProps) {
  const { options } = useOptions();

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Calculate week number from the first day of this week
  const weekNumber = getWeek(weekDays[0], { weekStartsOn: 1, locale });

  // Get events for this week
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const weekEvents = getEventsForWeek(events, weekStart, weekEnd);

  // Separate multi-day events from single-day events
  const multiDayEvents = weekEvents.filter((e) => isMultiDayEvent(e) || e.isAllDay);

  // Calculate event segments only for multi-day events (bars)
  const segments = calculateEventSegments(multiDayEvents, weekDays, maxEventRows);

  // Group single-day events by day column (not filtered by week, get ALL single-day events for each day)
  const singleDayEventsByCol: EyCalendarEvent[][] = weekDays.map((day) => {
    const dayEvents = getEventsForDateUtil(events, day);

    return dayEvents
      .filter((e) => !isMultiDayEvent(e) && !e.isAllDay)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  // Calculate overflow for each day
  const overflowCounts = weekDays.map((day, dayIndex) => {
    // Count multi-day segments that cover this day
    // Count multi-day segments that cover this day
    const segmentsCoveringDay = segments.filter(
      (seg) => seg.startCol <= dayIndex && seg.endCol >= dayIndex
    );
    const multiDayOccupiedRows = segmentsCoveringDay.length;

    // Available rows for single-day events
    const availableRowsForSingleDay = Math.max(0, maxEventRows - multiDayOccupiedRows);

    // Number of single-day events for this day
    const singleDayCount = singleDayEventsByCol[dayIndex].length;

    // Check if we need to show "+more" - if so, reserve one row for it
    const wouldOverflow = singleDayCount > availableRowsForSingleDay;
    const effectiveAvailableRows = wouldOverflow
      ? Math.max(0, availableRowsForSingleDay - 1)
      : availableRowsForSingleDay;

    // How many single-day events can actually be displayed
    const displayedSingleDayCount = Math.min(singleDayCount, effectiveAvailableRows);

    // Overflow = single-day events not shown
    return Math.max(0, singleDayCount - displayedSingleDayCount);
  });

  // Height per event row (in pixels)
  const dayNumberHeight = 24; // Space for day number
  // Width of week number column (matches w-8 = 32px)
  const weekNumberColumnWidth = 32;

  return (
    <div
      className={cn(getClass("monthWeekRow"))}
      data-eycalendar-week-row=""
      style={{
        gridTemplateColumns: showWeekNumbers
          ? "auto repeat(7, minmax(0, 1fr))"
          : "repeat(7, minmax(0, 1fr))",
      }}
    >
      {/* Week number cell */}
      {showWeekNumbers && (
        <div className={getClass("monthWeekNumberCell")} data-eycalendar-week-number="">
          <span className={getClass("monthWeekNumber")}>{weekNumber}</span>
        </div>
      )}
      {/* Day cells (background) */}
      {weekDays.map((day, colIndex) => {
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());
        const overflowCount = overflowCounts[colIndex];

        // Get single-day events for this day (after multi-day bars)
        const daySingleEvents = singleDayEventsByCol[colIndex];
        // Get which rows are occupied by multi-day segments
        const segmentsInDay = segments.filter(
          (seg) => seg.startCol <= colIndex && seg.endCol >= colIndex
        );
        const occupiedRows = segmentsInDay.map((s) => s.row);

        return (
          <MonthDayCell
            key={day.toISOString()}
            date={day}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday}
            overflowCount={overflowCount}
            locale={locale}
            singleDayEvents={daySingleEvents}
            maxEventRows={maxEventRows}
            occupiedRows={occupiedRows}
          />
        );
      })}

      {/* Multi-day event bars (absolute positioned, spanning multiple columns) */}
      <div
        className={getClass("monthEventsLayer")}
        style={{
          top: dayNumberHeight,
          left: showWeekNumbers ? weekNumberColumnWidth : 0,
        }}
        data-eycalendar-events-layer=""
      >
        {segments.map((segment) => (
          <MonthEventBar
            key={`${segment.event.id}-${segment.startCol}`}
            segment={segment}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Interface for MonthDayCell props
 */
interface MonthDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  overflowCount: number;
  locale?: import("date-fns").Locale;
  singleDayEvents: EyCalendarEvent[];
  maxEventRows: number;
  occupiedRows: number[];
}

/**
 * Day cell in the monthly view (background, day number, and single-day events)
 */
function MonthDayCell({
  date,
  isCurrentMonth,
  isToday,
  overflowCount,
  locale,
  singleDayEvents,
  maxEventRows,
  occupiedRows,
}: MonthDayCellProps) {
  const { setCurrentDate, setViewMode } = useView();
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { state: eventsState } = useEvents();
  const { events } = eventsState;
  const { makeDropTarget } = useDragAndDrop();
  const dayRef = useRef<HTMLDivElement>(null);

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Initialize drop target
  useEffect(() => {
    const element = dayRef.current;
    if (element) {
      const cleanup = makeDropTarget(element, {
        targetDate: date,
        targetResourceId: undefined,
        viewMode: "month",
      });

      return cleanup;
    }
  }, [date, makeDropTarget]);

  // Check if the day is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateToCompare = new Date(date);
  dateToCompare.setHours(0, 0, 0, 0);
  const isPast = dateToCompare < today;

  /**
   * Handle click on day number - navigate to week view (cascade: month → week → day)
   */
  const handleDayNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(date);
    setViewMode("week"); // Cascade: month → week (not directly to day)
  };

  /**
   * Handle click on the cell background - trigger time slot callback for event creation
   */
  const handleCellClick = (e: React.MouseEvent) => {
    // Only trigger if clicking on the cell itself, not on events or day number
    callbacks?.onTimeSlotClick?.(date, e);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dayEvents = getEventsForDateUtil(events, date);
    callbacks?.onShowMoreClick?.(date, dayEvents.slice(-overflowCount), dayEvents);
  };

  // Calculate how many single-day events can be shown
  // Available rows = maxEventRows - occupied rows by multi-day segments
  const availableRowsCount = Math.max(0, maxEventRows - occupiedRows.length);

  // If there's overflow, reserve last row for "+X more" indicator
  const hasOverflow = overflowCount > 0;
  const maxVisibleEvents = hasOverflow ? Math.max(0, availableRowsCount - 1) : availableRowsCount;
  const visibleSingleDayEvents = singleDayEvents.slice(0, maxVisibleEvents);

  // Height per event row
  const eventRowHeight = 20;
  const eventRowGap = 2;
  const dayNumberHeight = 24;

  // Calculate the row index for "+more" indicator
  // It should be placed right after the last visible event
  const getMoreIndicatorRow = () => {
    // We need to find the actual row index (accounting for occupied rows by multi-day events)
    let rowIndex = 0;
    let availableRowsFound = 0;

    // Find the row after displaying maxVisibleEvents
    while (rowIndex < maxEventRows && availableRowsFound < maxVisibleEvents) {
      if (!occupiedRows.includes(rowIndex)) {
        availableRowsFound++;
      }
      rowIndex++;
    }

    // Skip any occupied rows to find the next available row for "+more"
    while (rowIndex < maxEventRows && occupiedRows.includes(rowIndex)) {
      rowIndex++;
    }

    return rowIndex;
  };

  return (
    <div
      ref={dayRef}
      className={getClass("monthDayCell")}
      onClick={handleCellClick}
      data-eycalendar-day-cell=""
      data-today={isToday ? "true" : undefined}
      data-outside-month={!isCurrentMonth ? "true" : undefined}
      data-current-month={isCurrentMonth ? "true" : "false"}
    >
      {/* Day number - clickable for navigation (month → week) */}
      <span
        className={cn(getClass("monthDayNumber"), getClass("monthDayNumberClickable"))}
        onClick={handleDayNumberClick}
        data-eycalendar-day-number=""
        data-today={isToday ? "true" : undefined}
        data-past={isPast ? "true" : undefined}
      >
        {format(date, "d")}
      </span>

      {/* Single-day events (styled like Google Calendar - dot + text) */}
      <div className={getClass("monthSingleDayEventsContainer")} style={{ top: dayNumberHeight }}>
        {visibleSingleDayEvents.map((event, idx) => {
          // Find the first available row (not occupied by multi-day segments)
          let rowIndex = 0;
          let availableRowsFound = 0;
          while (rowIndex < maxEventRows && availableRowsFound <= idx) {
            if (!occupiedRows.includes(rowIndex)) {
              if (availableRowsFound === idx) {
                break;
              }
              availableRowsFound++;
            }
            rowIndex++;
          }

          const topOffset = rowIndex * (eventRowHeight + eventRowGap);

          return (
            <MonthEventItem
              key={event.id}
              event={event}
              locale={locale}
              topOffset={topOffset}
              height={eventRowHeight}
            />
          );
        })}
      </div>

      {/* Overflow indicator - positioned at the last available row */}
      {overflowCount > 0 && availableRowsCount > 0 && (
        <div
          className={cn(getClass("monthMoreEvents"))}
          style={{
            top: dayNumberHeight + getMoreIndicatorRow() * (eventRowHeight + eventRowGap),
            height: eventRowHeight,
          }}
          onClick={handleMoreClick}
        >
          +{overflowCount} more
        </div>
      )}

      {/* Mobile: Colored dot for events */}
      <MobileDot date={date} />
    </div>
  );
}

/**
 * Mobile dot indicator for events
 */
function MobileDot({ date }: { date: Date }) {
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const { events } = eventsState;

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  const dayEvents = getEventsForDateUtil(events, date);

  if (dayEvents.length === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        getClass("monthEventDot"),
        getClass("monthEventDotMobile"),
        getEventDotClasses(getEventColor(dayEvents[0]))
      )}
    />
  );
}

/**
 * Interface for MonthEventItem props (single-day events)
 */
interface MonthEventItemProps {
  event: EyCalendarEvent;
  locale?: import("date-fns").Locale;
  topOffset: number;
  height: number;
}

/**
 * Single-day event displayed with dot + time + title (Google Calendar style)
 */
function MonthEventItem({ event, locale, topOffset, height }: MonthEventItemProps) {
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

  // Check if event is in the past
  const isPastEvent = event.end < new Date();

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

  const eventColor = getEventColor(event);

  return (
    <div
      ref={eventRef}
      className={getClass("monthEventItemWrapper")}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-month-event-item=""
      data-event-id={event.id}
      data-past={isPastEvent ? "true" : undefined}
      style={{
        top: topOffset,
        height: height,
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP HH:mm", { locale })} - ${format(new Date(event.end), "PP HH:mm", { locale })}\n${event.description || ""}`}
    >
      {/* Colored dot */}
      <span
        className={getClass("monthEventItemDot")}
        style={{
          backgroundColor: event?.isFilled ? eventColor : "transparent",
          borderColor: eventColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
        data-eycalendar-event-dot=""
      />
      {/* Time */}
      <span className={getClass("monthEventItemTime")}>
        {format(new Date(event.start), "HH:mm", { locale })}
      </span>
      {/* Title */}
      <span className={getClass("monthEventItemTitle")}>{event.title}</span>
    </div>
  );
}

/**
 * Interface for MonthEventBar props
 */
interface MonthEventBarProps {
  segment: EventSegment;
  locale?: import("date-fns").Locale;
}

/**
 * Event bar that spans multiple days in the month view
 */
function MonthEventBar({ segment, locale }: MonthEventBarProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);

  const { event, startCol, span, isStart, isEnd, row } = segment;

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Check if event is in the past
  const isPastEvent = event.end < new Date();

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

  // Calculate position as percentages
  const leftPercent = (startCol / 7) * 100;
  const widthPercent = (span / 7) * 100;

  // Row positioning
  const eventRowHeight = 20;
  const eventRowGap = 2;
  const topOffset = row * (eventRowHeight + eventRowGap);

  // Event color
  const eventColor = getEventColor(event);

  // Get computed colors (handles past event lightening)
  const computedColors = getPastEventColors(eventColor, event?.isStriped, isPastEvent);

  return (
    <div
      ref={eventRef}
      className={cn(
        getClass("monthEventBar"),
        // Rounded corners based on segment position
        isStart && isEnd && "rounded",
        isStart && !isEnd && "rounded-l",
        !isStart && isEnd && "rounded-r",
        !isStart && !isEnd && "rounded-none"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-month-event=""
      data-event-id={event.id}
      data-past={isPastEvent ? "true" : undefined}
      style={{
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        top: topOffset,
        height: eventRowHeight,
        background: computedColors.background,
        color: computedColors.color,
        ...(event?.isStriped && {
          borderColor: computedColors.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP HH:mm", { locale })} - ${format(new Date(event.end), "PP HH:mm", { locale })}\n${event.description || ""}`}
    >
      {/* Show time only on first segment */}
      {isStart && (
        <span className={getClass("monthEventBarTime")}>
          {format(new Date(event.start), "HH:mm", { locale })}
        </span>
      )}
      <span className={getClass("monthEventBarTitle")}>{event.title}</span>
    </div>
  );
}

/**
 * Default export
 */
export default MonthView;
