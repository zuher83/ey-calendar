// Day cell in the monthly view: background, day number, and single-day events

import { useCallback, useEffect, useRef } from "react";
import { endOfDay, format } from "date-fns";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useOptions } from "../../../context/OptionsContext";
import { useViewActions } from "../../../context/ViewContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useTimeSlotInteractions } from "../../../hooks/useTimeSlotInteractions";
import type { EyCalendarEvent } from "../../../types";
import { cn } from "../../../utils/cn";
import { moveFocusByOffset, moveFocusToBoundary } from "../../../utils/focusNavigation";
import { MobileDot } from "./MobileDot";
import { MonthEventItem } from "./MonthEventItem";

export interface MonthDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  overflowCount: number;
  locale?: import("date-fns").Locale;
  dayEvents: EyCalendarEvent[];
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
  dayEvents,
  singleDayEvents,
  maxEventRows,
  occupiedRows,
}: MonthDayCellProps) {
  const { setCurrentDate, setViewMode } = useViewActions();
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDropTarget } = useDragAndDrop();
  const { triggerTimeSlotClick, triggerTimeSlotDoubleClick } = useTimeSlotInteractions();
  const dayRef = useRef<HTMLDivElement>(null);
  const creationEnabled = options.enableCreate !== false && options.readonly !== true;
  const todayHighlighted = options.highlightToday !== false && isToday;
  const daysPerWeek = options.showWeekends !== false ? 7 : 5;
  const labels = options.labels;
  const getClass = options.getClass;

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
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setCurrentDate(date);
      setViewMode("week");
    },
    [date, setCurrentDate, setViewMode]
  );

  const handleCellClick = useCallback(
    (e: React.MouseEvent) => {
      if (!creationEnabled) return;

      triggerTimeSlotClick(date, e, { slotEnd: endOfDay(date) });
    },
    [date, creationEnabled, triggerTimeSlotClick]
  );

  const handleCellDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!creationEnabled) return;

      triggerTimeSlotDoubleClick(date, e);
    },
    [date, creationEnabled, triggerTimeSlotDoubleClick]
  );

  const availableRowsCount = Math.max(0, maxEventRows - occupiedRows.length);
  const hasOverflow = overflowCount > 0;
  const maxVisibleEvents = hasOverflow ? Math.max(0, availableRowsCount - 1) : availableRowsCount;
  const visibleSingleDayEvents = singleDayEvents.slice(0, maxVisibleEvents);
  const hiddenSingleDayEvents = singleDayEvents.slice(maxVisibleEvents);

  const handleMoreClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      callbacks?.onShowMoreClick?.(date, hiddenSingleDayEvents, dayEvents);
    },
    [callbacks, date, dayEvents, hiddenSingleDayEvents]
  );

  const handleDayNumberKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDayNumberClick(e);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveFocusByOffset(e.currentTarget, "[data-eycalendar-month-day-trigger]", -1);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveFocusByOffset(e.currentTarget, "[data-eycalendar-month-day-trigger]", 1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveFocusByOffset(e.currentTarget, "[data-eycalendar-month-day-trigger]", -daysPerWeek);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveFocusByOffset(e.currentTarget, "[data-eycalendar-month-day-trigger]", daysPerWeek);
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        moveFocusToBoundary(e.currentTarget, "[data-eycalendar-month-day-trigger]", "start");
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        moveFocusToBoundary(e.currentTarget, "[data-eycalendar-month-day-trigger]", "end");
      }
    },
    [daysPerWeek, handleDayNumberClick]
  );

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
      onDoubleClick={handleCellDoubleClick}
      role="gridcell"
      aria-label={format(date, "EEEE d MMMM yyyy", { locale })}
      data-eycalendar-day-cell=""
      data-today={todayHighlighted ? "true" : undefined}
      data-outside-month={!isCurrentMonth ? "true" : undefined}
      data-current-month={isCurrentMonth ? "true" : "false"}
      aria-current={isToday ? "date" : undefined}
    >
      <span
        className={cn(getClass("monthDayNumber"), getClass("monthDayNumberClickable"))}
        onClick={handleDayNumberClick}
        onKeyDown={handleDayNumberKeyDown}
        role="button"
        tabIndex={0}
        aria-label={format(date, "EEEE d MMMM yyyy", { locale })}
        data-eycalendar-day-number=""
        data-eycalendar-month-day-trigger=""
        data-today={todayHighlighted ? "true" : undefined}
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
              handleMoreClick(e);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={labels.ariaMoreEvents(overflowCount)}
        >
          +{overflowCount} more
        </div>
      )}

      <MobileDot dayEvents={dayEvents} />
    </div>
  );
}
