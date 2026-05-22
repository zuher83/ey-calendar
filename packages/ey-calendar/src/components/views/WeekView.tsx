// Weekly view with hourly timeline and precise positioning
// src/components/ey-calendar/components/views/WeekView.tsx

import { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { useOptions } from "../../context/OptionsContext";
import { useViewActions, useViewCellHeight } from "../../context/ViewContext";
import { useEvents } from "../../context/EventsContext";
import { useEyCalendarLabels, useTimeCalculations } from "../../hooks";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { cn } from "../../utils/cn";
import {
  calculateEventSegments,
  getEventsForDate,
  getEventsForWeek,
  isMultiDayEvent,
} from "../../utils/eventUtils";
import { WeekAllDayEventBar } from "./week/WeekAllDayEventBar";
import { WeekDayColumn } from "./week/WeekDayColumn";

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
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const { viewInfo } = useTimeCalculations();
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollbarGutter, setScrollbarGutter] = useState(0);
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
  const cellHeight = useViewCellHeight();
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

  useEffect(() => {
    const updateScrollbarGutter = () => {
      const element = scrollContainerRef.current;
      if (!element) return;

      setScrollbarGutter(element.offsetWidth - element.clientWidth);
    };

    updateScrollbarGutter();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", updateScrollbarGutter);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateScrollbarGutter())
        : undefined;

    if (observer && scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScrollbarGutter);
      observer?.disconnect();
    };
  }, [isDesktop]);

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
              marginInlineEnd: `${scrollbarGutter}px`,
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
                marginInlineEnd: `${scrollbarGutter}px`,
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
  const { setCurrentDate, setViewMode } = useViewActions();
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
  const handleDayHeaderClick = (e: React.MouseEvent | React.KeyboardEvent) => {
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleDayHeaderClick(e);
        }
      }}
      role="columnheader"
      tabIndex={0}
      aria-current={isToday(day) ? "date" : undefined}
      aria-label={format(day, "EEEE d MMMM yyyy", { locale })}
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
 * Default export
 */
export default WeekView;
