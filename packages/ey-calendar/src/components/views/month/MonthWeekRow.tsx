// A week row in the month view: day cells + spanning event bars

import { getWeek, isSameDay, isSameMonth } from "date-fns";
import { useOptions } from "../../../context/OptionsContext";
import type { EyCalendarEvent } from "../../../types";
import { cn } from "../../../utils/cn";
import { calculateEventSegments, isMultiDayEvent } from "../../../utils/eventUtils";
import { MonthDayCell } from "./MonthDayCell";
import { MonthEventBar } from "./MonthEventBar";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface MonthWeekRowProps {
  weekDays: Date[];
  weekEvents: EyCalendarEvent[];
  dayEventsByCol: EyCalendarEvent[][];
  singleDayEventsByCol: EyCalendarEvent[][];
  currentDate: Date;
  locale?: import("date-fns").Locale;
  maxEventRows: number;
  showWeekNumbers?: boolean;
}

export function MonthWeekRow({
  weekDays,
  weekEvents,
  dayEventsByCol,
  singleDayEventsByCol,
  currentDate,
  locale,
  maxEventRows,
  showWeekNumbers,
}: MonthWeekRowProps) {
  const { options } = useOptions();
  const visibleDayCount = weekDays.length;
  const getClass = options.getClass;

  const weekNumber = getWeek(weekDays[0], { weekStartsOn: 1, locale });

  const multiDayEvents = weekEvents.filter((e) => isMultiDayEvent(e) || e.isAllDay);
  const segments = calculateEventSegments(multiDayEvents, weekDays, maxEventRows);

  const overflowCounts = weekDays.map((_, dayIndex) => {
    const segmentsCoveringDay = segments.filter(
      (seg) => seg.startCol <= dayIndex && seg.endCol >= dayIndex
    );
    const multiDayOccupiedRows = segmentsCoveringDay.length;
    const availableRowsForSingleDay = Math.max(0, maxEventRows - multiDayOccupiedRows);
    const singleDayCount = singleDayEventsByCol[dayIndex].length;
    const wouldOverflow = singleDayCount > availableRowsForSingleDay;
    const effectiveAvailableRows = wouldOverflow
      ? Math.max(0, availableRowsForSingleDay - 1)
      : availableRowsForSingleDay;
    const displayedSingleDayCount = Math.min(singleDayCount, effectiveAvailableRows);
    return Math.max(0, singleDayCount - displayedSingleDayCount);
  });

  const dayNumberHeight = 24;
  const weekNumberColumnWidth = 32;

  return (
    <div
      className={cn(getClass("monthWeekRow"))}
      role="row"
      data-eycalendar-week-row=""
      style={{
        gridTemplateColumns: showWeekNumbers
          ? `auto repeat(${visibleDayCount}, minmax(0, 1fr))`
          : `repeat(${visibleDayCount}, minmax(0, 1fr))`,
      }}
    >
      {showWeekNumbers && (
        <div
          className={getClass("monthWeekNumberCell")}
          role="rowheader"
          data-eycalendar-week-number=""
        >
          <span className={getClass("monthWeekNumber")}>{weekNumber}</span>
        </div>
      )}

      {weekDays.map((day, colIndex) => {
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());
        const overflowCount = overflowCounts[colIndex];
        const daySingleEvents = singleDayEventsByCol[colIndex];
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
            dayEvents={dayEventsByCol[colIndex]}
            singleDayEvents={daySingleEvents}
            maxEventRows={maxEventRows}
            occupiedRows={occupiedRows}
          />
        );
      })}

      <div
        className={getClass("monthEventsLayer")}
        style={{
          top: dayNumberHeight,
          left: showWeekNumbers ? weekNumberColumnWidth : 0,
        }}
        data-eycalendar-events-layer=""
      >
        {segments.map((segment) =>
          (() => {
            const eventStartDay = new Date(
              segment.event.start.getFullYear(),
              segment.event.start.getMonth(),
              segment.event.start.getDate()
            );
            const visibleSegmentStartDay = new Date(
              weekDays[segment.startCol].getFullYear(),
              weekDays[segment.startCol].getMonth(),
              weekDays[segment.startCol].getDate()
            );
            const segmentStartOffsetDays = Math.max(
              0,
              Math.round((visibleSegmentStartDay.getTime() - eventStartDay.getTime()) / DAY_IN_MS)
            );

            return (
              <MonthEventBar
                key={`${segment.event.id}-${segment.startCol}`}
                segment={segment}
                totalColumns={visibleDayCount}
                segmentStartOffsetDays={segmentStartOffsetDays}
                visibleSegmentStartDate={visibleSegmentStartDay}
                locale={locale}
              />
            );
          })()
        )}
      </div>
    </div>
  );
}
