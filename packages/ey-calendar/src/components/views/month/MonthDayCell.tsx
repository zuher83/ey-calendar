// Day cell in the monthly view: background, day number, and single-day events

import { useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useEvents } from "../../../context/EventsContext";
import { useOptions } from "../../../context/OptionsContext";
import { useViewActions } from "../../../context/ViewContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import type { EyCalendarEvent } from "../../../types";
import { cn } from "../../../utils/cn";
import { getEventsForDate } from "../../../utils/eventUtils";
import { MobileDot } from "./MobileDot";
import { MonthEventItem } from "./MonthEventItem";

export interface MonthDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  overflowCount: number;
  locale?: import("date-fns").Locale;
  singleDayEvents: EyCalendarEvent[];
  maxEventRows: number;
  occupiedRows: number[];
}

export function MonthDayCell({
  date,
  isCurrentMonth,
  isToday,
  overflowCount,
  locale,
  singleDayEvents,
  maxEventRows,
  occupiedRows,
}: MonthDayCellProps) {
  const { setCurrentDate, setViewMode } = useViewActions();
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { state: eventsState } = useEvents();
  const { events } = eventsState;
  const { makeDropTarget } = useDragAndDrop();
  const dayRef = useRef<HTMLDivElement>(null);

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  useEffect(() => {
    const element = dayRef.current;
    if (element) {
      return makeDropTarget(element, {
        targetDate: date,
        targetResourceId: undefined,
        viewMode: "month",
      });
    }
  }, [date, makeDropTarget]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateToCompare = new Date(date);
  dateToCompare.setHours(0, 0, 0, 0);
  const isPast = dateToCompare < today;

  const handleDayNumberClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentDate(date);
      setViewMode("week");
    },
    [date, setCurrentDate, setViewMode]
  );

  const handleCellClick = useCallback(
    (e: React.MouseEvent) => {
      callbacks?.onTimeSlotClick?.(date, e);
    },
    [date, callbacks]
  );

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const dayEvents = getEventsForDate(events, date);
      callbacks?.onShowMoreClick?.(date, dayEvents.slice(-overflowCount), dayEvents);
    },
    [date, events, overflowCount, callbacks]
  );

  const availableRowsCount = Math.max(0, maxEventRows - occupiedRows.length);
  const hasOverflow = overflowCount > 0;
  const maxVisibleEvents = hasOverflow ? Math.max(0, availableRowsCount - 1) : availableRowsCount;
  const visibleSingleDayEvents = singleDayEvents.slice(0, maxVisibleEvents);

  const eventRowHeight = 20;
  const eventRowGap = 2;
  const dayNumberHeight = 24;

  const getMoreIndicatorRow = () => {
    let rowIndex = 0;
    let availableRowsFound = 0;

    while (rowIndex < maxEventRows && availableRowsFound < maxVisibleEvents) {
      if (!occupiedRows.includes(rowIndex)) {
        availableRowsFound++;
      }
      rowIndex++;
    }

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
      aria-current={isToday ? "date" : undefined}
    >
      <span
        className={cn(getClass("monthDayNumber"), getClass("monthDayNumberClickable"))}
        onClick={handleDayNumberClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleDayNumberClick(e as unknown as React.MouseEvent);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={format(date, "EEEE d MMMM yyyy")}
        data-eycalendar-day-number=""
        data-today={isToday ? "true" : undefined}
        data-past={isPast ? "true" : undefined}
      >
        {format(date, "d")}
      </span>

      <div className={getClass("monthSingleDayEventsContainer")} style={{ top: dayNumberHeight }}>
        {visibleSingleDayEvents.map((event, idx) => {
          let rowIndex = 0;
          let availableRowsFound = 0;
          while (rowIndex < maxEventRows && availableRowsFound <= idx) {
            if (!occupiedRows.includes(rowIndex)) {
              if (availableRowsFound === idx) break;
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

      {overflowCount > 0 && availableRowsCount > 0 && (
        <div
          className={cn(getClass("monthMoreEvents"))}
          style={{
            top: dayNumberHeight + getMoreIndicatorRow() * (eventRowHeight + eventRowGap),
            height: eventRowHeight,
          }}
          onClick={handleMoreClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMoreClick(e as unknown as React.MouseEvent);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Show ${overflowCount} more events`}
        >
          +{overflowCount} more
        </div>
      )}

      <MobileDot date={date} />
    </div>
  );
}
