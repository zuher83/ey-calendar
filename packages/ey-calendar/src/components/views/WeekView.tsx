// Weekly view with hourly timeline and precise positioning
// src/components/ey-calendar/components/views/WeekView.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useViewActions, useViewCellHeight } from "../../context/ViewContext";
import { useTimeCalculations } from "../../hooks";
import { cn } from "../../utils/cn";
import { calculateEventSegments, getEventsForWeek, isMultiDayEvent } from "../../utils/eventUtils";
import { moveFocusByOffset, moveFocusToBoundary } from "../../utils/focusNavigation";
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
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth >= 640;
  });
  const [scrollbarGutter, setScrollbarGutter] = useState(0);
  const weekViewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const labels = options.labels;

  const getClass = options.getClass;

  // Get locale for date formatting
  const locale = options.locale;

  // Extract from states
  const cellHeight = useViewCellHeight();
  const events = eventsState.events;

  // Get week days
  const weekDays = viewInfo.visibleDays;
  const desktopColumnCount = weekDays.length;
  const compactColumnCount = Math.min(5, weekDays.length);
  const visibleColumnCount = isDesktop ? desktopColumnCount : compactColumnCount;

  useEffect(() => {
    const updateLayoutMetrics = () => {
      const weekViewElement = weekViewRef.current;
      const scrollContainerElement = scrollContainerRef.current;

      if (weekViewElement) {
        const containerWidth = weekViewElement.getBoundingClientRect().width;

        if (containerWidth > 0) {
          setIsDesktop(containerWidth >= 640);
        } else if (typeof window !== "undefined") {
          setIsDesktop(window.innerWidth >= 640);
        }
      }

      if (scrollContainerElement) {
        setScrollbarGutter(scrollContainerElement.offsetWidth - scrollContainerElement.clientWidth);
      }
    };

    updateLayoutMetrics();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateLayoutMetrics();
      });

      if (weekViewRef.current) {
        observer.observe(weekViewRef.current);
      }

      if (scrollContainerRef.current) {
        observer.observe(scrollContainerRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateLayoutMetrics);

      return () => window.removeEventListener("resize", updateLayoutMetrics);
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

  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  const maxAllDayRows = 3;
  const { allDaySegments, timedEventsByDay } = useMemo(() => {
    const weekEvents = getEventsForWeek(events, weekStart, weekEnd);
    const spanningEvents: typeof events = [];
    const groupedTimedEvents = new Map<string, typeof events>();

    weekDays.forEach((day) => {
      groupedTimedEvents.set(format(day, "yyyy-MM-dd"), []);
    });

    weekEvents.forEach((event) => {
      if (event.isAllDay || isMultiDayEvent(event)) {
        spanningEvents.push(event);
        return;
      }

      const eventDayKey = format(event.start, "yyyy-MM-dd");
      groupedTimedEvents.get(eventDayKey)?.push(event);
    });

    const timedEventsByDay = weekDays.map((day) => {
      const dayEvents = groupedTimedEvents.get(format(day, "yyyy-MM-dd")) ?? [];

      return [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
    });

    return {
      allDaySegments: calculateEventSegments(spanningEvents, weekDays, maxAllDayRows),
      timedEventsByDay,
    };
  }, [events, maxAllDayRows, weekDays, weekStart, weekEnd]);

  // Calculate all-day section height
  const allDayRowHeight = 24;
  const allDayRowGap = 2;
  const hasAllDayEvents = allDaySegments.length > 0;
  const maxRowUsed = hasAllDayEvents ? Math.max(...allDaySegments.map((s) => s.row)) + 1 : 0;
  const allDaySectionHeight = hasAllDayEvents
    ? maxRowUsed * (allDayRowHeight + allDayRowGap) + 8
    : 0;

  return (
    <div
      ref={weekViewRef}
      className={cn(getClass("weekView"), className)}
      data-eycalendar-week-view=""
    >
      {/* Container for alignment synchronization */}
      <div className={getClass("weekViewContainer")}>
        {/* Header with weekday names */}
        <div className={getClass("weekHeader")} data-eycalendar-week-header="">
          <div
            className={getClass("weekHeaderGrid")}
            style={{
              gridTemplateColumns: `48px repeat(${visibleColumnCount}, minmax(0, 1fr))`,
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
                isHidden={!isDesktop && index >= compactColumnCount}
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
                gridTemplateColumns: `48px repeat(${visibleColumnCount}, minmax(0, 1fr))`,
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
                    !isDesktop &&
                      dayIndex >= compactColumnCount &&
                      getClass("weekAllDayColumnHidden")
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
                        totalCols={visibleColumnCount}
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
              gridTemplateColumns: `48px repeat(${visibleColumnCount}, minmax(0, 1fr))`,
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
                  !isDesktop && index >= compactColumnCount && getClass("weekDayColumnHidden")
                )}
              >
                <WeekDayColumn date={day} events={timedEventsByDay[index] ?? []} hours={hours} />
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
  const todayHighlighted = options.highlightToday !== false && isToday(day);
  const getClass = options.getClass;

  /**
   * Handle click on day header (name + number) - navigate to day view (cascade: week → day)
   */
  const handleDayHeaderClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrentDate(day);
    setViewMode("day"); // Cascade: week → day
  };

  const handleDayHeaderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDayHeaderClick(e);
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocusByOffset(e.currentTarget, "[data-eycalendar-day-header]", -1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocusByOffset(e.currentTarget, "[data-eycalendar-day-header]", 1);
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      moveFocusToBoundary(e.currentTarget, "[data-eycalendar-day-header]", "start");
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      moveFocusToBoundary(e.currentTarget, "[data-eycalendar-day-header]", "end");
    }
  };

  return (
    <div
      className={cn(
        getClass("weekHeaderDay"),
        getClass("weekHeaderDayClickable"),
        isHidden && getClass("weekDayColumnHidden")
      )}
      onClick={handleDayHeaderClick}
      onKeyDown={handleDayHeaderKeyDown}
      role="columnheader"
      tabIndex={0}
      aria-current={isToday(day) ? "date" : undefined}
      aria-label={format(day, "EEEE d MMMM yyyy", { locale })}
      data-eycalendar-day-header=""
      data-today={todayHighlighted ? "true" : undefined}
    >
      <span className={getClass("weekHeaderDayName")}>{format(day, "EEE", { locale })}</span>
      <span
        className={getClass("weekHeaderDayNumber")}
        data-eycalendar-day-number=""
        data-today={todayHighlighted ? "true" : undefined}
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
