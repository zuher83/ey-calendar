// Monthly view with 7x6 grid and multi-day spanning events

import { useMemo } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useViewCurrentDate } from "../../context/ViewContext";
import { useContainerHeight, useTimeCalculations } from "../../hooks";
import type { EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import { isMultiDayEvent } from "../../utils/eventUtils";
import { MonthWeekRow } from "./month/MonthWeekRow";

interface MonthWeekData {
  weekDays: Date[];
  weekEvents: EyCalendarEvent[];
  dayEventsByCol: EyCalendarEvent[][];
  singleDayEventsByCol: EyCalendarEvent[][];
}

function getLocalDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getLocalDayKey(date: Date): number {
  return getLocalDayStart(date).getTime();
}

function calculateMaxEventRows(gridHeight: number, numberOfWeeks: number): number {
  const eventRowHeight = 20;
  const eventRowGap = 2;
  const dayNumberHeight = 24;
  const cellPadding = 8;
  const rowHeight = gridHeight / Math.max(numberOfWeeks, 1);
  const availableHeight = rowHeight - dayNumberHeight - cellPadding;
  const calculatedRows = Math.floor(availableHeight / (eventRowHeight + eventRowGap));

  return Math.max(2, Math.min(8, calculatedRows));
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
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const showWeekends = options.showWeekends !== false;
  const daysPerWeek = showWeekends ? 7 : 5;

  // Extract from states
  const currentDate = useViewCurrentDate();
  const { events } = eventsState;
  const { viewInfo } = useTimeCalculations();

  const getClass = options.getClass;

  // Get locale for date formatting
  const locale = options.locale;

  // Calculate days to display
  const monthDays = viewInfo.visibleDays;

  const weeks = useMemo<MonthWeekData[]>(() => {
    if (monthDays.length === 0) {
      return [];
    }

    const visibleStart = getLocalDayStart(monthDays[0]);
    const visibleEnd = monthDays[monthDays.length - 1];
    const visibleEndTime = new Date(
      visibleEnd.getFullYear(),
      visibleEnd.getMonth(),
      visibleEnd.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    const dayEventsIndex = new Map<number, EyCalendarEvent[]>(
      monthDays.map((day) => [getLocalDayKey(day), []])
    );

    const visibleEvents = events.filter((event) => {
      const eventStart = event.start.getTime();
      const eventEnd = event.end.getTime();

      return eventStart <= visibleEndTime && eventEnd >= visibleStart.getTime();
    });

    visibleEvents.forEach((event) => {
      const overlapStart = new Date(Math.max(getLocalDayKey(event.start), visibleStart.getTime()));
      const overlapEnd = new Date(Math.min(getLocalDayKey(event.end), getLocalDayKey(visibleEnd)));

      let currentDay = overlapStart;
      while (currentDay.getTime() <= overlapEnd.getTime()) {
        dayEventsIndex.get(getLocalDayKey(currentDay))?.push(event);
        currentDay = addDays(currentDay, 1);
      }
    });

    dayEventsIndex.forEach((dayEvents) => {
      dayEvents.sort(
        (leftEvent, rightEvent) => leftEvent.start.getTime() - rightEvent.start.getTime()
      );
    });

    const indexedWeeks: MonthWeekData[] = [];

    for (let index = 0; index < monthDays.length; index += daysPerWeek) {
      const weekDays = monthDays.slice(index, index + daysPerWeek);
      const dayEventsByCol = weekDays.map((day) => dayEventsIndex.get(getLocalDayKey(day)) ?? []);
      const singleDayEventsByCol = dayEventsByCol.map((dayEvents) =>
        dayEvents.filter((event) => !isMultiDayEvent(event) && !event.isAllDay)
      );
      const weekEventsMap = new Map<string, EyCalendarEvent>();

      dayEventsByCol.forEach((dayEvents) => {
        dayEvents.forEach((event) => {
          weekEventsMap.set(event.id, event);
        });
      });

      indexedWeeks.push({
        weekDays,
        weekEvents: Array.from(weekEventsMap.values()),
        dayEventsByCol,
        singleDayEventsByCol,
      });
    }

    return indexedWeeks;
  }, [daysPerWeek, events, monthDays]);

  // Calculate number of rows dynamically - 7-day weeks or 5-day business weeks
  const numberOfWeeks = weeks.length;

  const { containerRef: monthGridRef, height: monthGridHeight } = useContainerHeight({
    enabled: true,
    fallbackHeight: 600,
  });
  // How many events a day cell may show. The available height gives a first
  // budget; `maxEventsPerSlot` caps it further when the consumer wants an
  // explicit per-cell limit (Odoo's `event_limit`). Capping here, at the single
  // source, keeps the rendered events and the "+N more" count in agreement —
  // MonthWeekRow recomputes the overflow from this very number.
  const maxEventRows = useMemo(() => {
    const rowsThatFit = calculateMaxEventRows(monthGridHeight, numberOfWeeks);
    const cap = options.maxEventsPerSlot;

    return cap === undefined ? rowsThatFit : Math.max(0, Math.min(rowsThatFit, cap));
  }, [monthGridHeight, numberOfWeeks, options.maxEventsPerSlot]);

  // Generate weekday headers starting from Monday (weekStartsOn: 1)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1, locale });
  const weekDayHeaders = Array.from({ length: daysPerWeek }, (_, i) => {
    const date = addDays(weekStart, i);

    return format(date, "EEE", { locale });
  });

  return (
    <div className={cn(getClass("monthView"), className)} data-eycalendar-month-view="">
      {/* Weekday headers */}
      <div className={getClass("monthHeader")} data-eycalendar-month-header="">
        <div
          className={getClass("monthHeaderGrid")}
          style={{
            gridTemplateColumns: options.showWeekNumbers
              ? `auto repeat(${daysPerWeek}, minmax(0, 1fr))`
              : `repeat(${daysPerWeek}, minmax(0, 1fr))`,
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
                index < weekDayHeaders.length - 1 && getClass("monthHeaderDayBorder")
              )}
              role="columnheader"
              data-eycalendar-weekday-header=""
            >
              <span className={getClass("monthHeaderDayText")}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weeks grid - rows calculated dynamically based on month */}
      <div
        ref={monthGridRef}
        className={getClass("monthGrid")}
        role="grid"
        aria-label={format(currentDate, "MMMM yyyy", { locale })}
        aria-colcount={daysPerWeek}
        aria-rowcount={numberOfWeeks}
        data-eycalendar-month-grid=""
        style={{ gridTemplateRows: `repeat(${numberOfWeeks}, minmax(0, 1fr))` }}
      >
        {weeks.map((week, weekIndex) => (
          <MonthWeekRow
            key={`week-${weekIndex}`}
            weekDays={week.weekDays}
            weekEvents={week.weekEvents}
            dayEventsByCol={week.dayEventsByCol}
            singleDayEventsByCol={week.singleDayEventsByCol}
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

export default MonthView;
