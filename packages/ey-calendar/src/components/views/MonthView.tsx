// Monthly view with 7x6 grid and multi-day spanning events

import { useMemo } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useViewCurrentDate } from "../../context/ViewContext";
import { useContainerHeight, useTimeCalculations } from "../../hooks";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { cn } from "../../utils/cn";
import { MonthWeekRow } from "./month/MonthWeekRow";

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

  // Extract from states
  const currentDate = useViewCurrentDate();
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

  const { containerRef: monthGridRef, height: monthGridHeight } = useContainerHeight({
    enabled: true,
    fallbackHeight: 600,
  });
  const maxEventRows = useMemo(
    () => calculateMaxEventRows(monthGridHeight, numberOfWeeks),
    [monthGridHeight, numberOfWeeks]
  );

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
        ref={monthGridRef}
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

export default MonthView;
