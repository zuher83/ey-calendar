// Planning View - Chronological display of events
// src/components/ey-calendar/components/views/PlanningView.tsx

import { useCallback, useEffect, useMemo, useRef } from "react";
import { format, isSameDay, startOfDay, type Locale } from "date-fns";
import { useEvents } from "../../context/EventsContext";
import { useOptions } from "../../context/OptionsContext";
import { useView } from "../../context/ViewContext";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { useEyCalendarComponents } from "../../hooks/useEyCalendarComponents";
import { useEyCalendarLabels } from "../../hooks/useEyCalendarLabels";
import type { EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import { formatDuration, formatTime } from "../../utils/dateUtils";

/**
 * Interface for PlanningView props
 */
export interface PlanningViewProps {
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Interface for events grouped by date
 */
interface EventsByDate {
  date: Date;
  events: EyCalendarEvent[];
  isToday: boolean;
  isPast: boolean;
}

/**
 * Groups events by date and sorts them chronologically
 */
function groupEventsByDate(events: EyCalendarEvent[]): EventsByDate[] {
  const now = new Date();
  const today = startOfDay(now);

  // Group events by date
  const eventMap = new Map<string, EyCalendarEvent[]>();

  events.forEach((event) => {
    const eventDate = startOfDay(event.start);
    const dateKey = format(eventDate, "yyyy-MM-dd");

    if (!eventMap.has(dateKey)) {
      eventMap.set(dateKey, []);
    }
    eventMap.get(dateKey)!.push(event);
  });

  // Convert to array and sort
  const groupedEvents: EventsByDate[] = Array.from(eventMap.entries())
    .map(([dateKey, dayEvents]) => {
      const date = new Date(dateKey);

      return {
        date,
        events: dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime()),
        isToday: isSameDay(date, today),
        isPast: date < today,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return groupedEvents;
}

/**
 * Planning view
 */
export function PlanningView({ className = "" }: PlanningViewProps) {
  const { state: viewState } = useView();
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Extract from states
  const { currentDate } = viewState;
  const { events } = eventsState;

  // Get class getter from context options
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  // Get labels, components, and locale from context options
  // Labels are automatically deduced from locale if not provided
  const labels = useEyCalendarLabels(options.labels, options.locale);
  const Components = useEyCalendarComponents(options.components);
  const locale = options.locale;

  // Group events by date
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

  // Scroll helper function
  const scrollToToday = useCallback(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayElement = todayRef.current;

      // Calculate position to center "today"
      const containerHeight = container.clientHeight;
      const elementTop = todayElement.offsetTop;
      const scrollPosition = elementTop - containerHeight / 3;

      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    }
  }, []);

  // Auto-scroll to today on mount
  useEffect(() => {
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToToday);
    });
  }, [eventsByDate, scrollToToday]);

  // Scroll to today when "Today" button is clicked
  useEffect(() => {
    const now = new Date();
    const isToday = isSameDay(currentDate, now);

    if (isToday) {
      // Small delay to ensure navigation is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToToday);
      });
    }
  }, [currentDate, scrollToToday]);

  // Format date header
  const formatDateHeader = useCallback(
    (date: Date, isToday: boolean, isPast: boolean) => {
      const dayName = format(date, "EEEE", { locale });
      const dateStr = format(date, "d MMMM yyyy", { locale });

      let status = "";
      if (isToday) {
        status = ` - ${labels.planningToday}`;
      } else if (isPast) {
        status = ` - ${labels.planningPast}`;
      }

      return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateStr}${status}`;
    },
    [labels, locale]
  );

  return (
    <div className={cn(getClass("planningView"), className)} data-eycalendar-planning-view="">
      {/* Scroll container for timeline */}
      <div
        ref={scrollContainerRef}
        className={getClass("planningScrollContainer")}
        data-eycalendar-planning-scroll=""
      >
        <div className={getClass("planningContent")} data-eycalendar-planning-content="">
          {eventsByDate.map((dayGroup) => (
            <div
              key={format(dayGroup.date, "yyyy-MM-dd")}
              className={getClass("planningDateGroup")}
              data-eycalendar-date-group=""
            >
              {/* Sticky header for date */}
              <div
                ref={dayGroup.isToday ? todayRef : undefined}
                className={getClass("planningDateHeader")}
                data-eycalendar-date-header=""
                data-today={dayGroup.isToday ? "true" : undefined}
                data-past={dayGroup.isPast ? "true" : undefined}
              >
                <h3 className={getClass("planningDateHeaderTitle")}>
                  {formatDateHeader(dayGroup.date, dayGroup.isToday, dayGroup.isPast)}
                </h3>
                <p className={getClass("planningDateHeaderSubtitle")}>
                  {labels.planningEventCount(dayGroup.events.length)}
                </p>
              </div>

              {/* Event list for this date */}
              <div className={getClass("planningEventsList")} data-eycalendar-events-list="">
                {dayGroup.events.length === 0 ? (
                  <div className={getClass("planningNoEvents")}>{labels.planningNoEvents}</div>
                ) : (
                  dayGroup.events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isPast={dayGroup.isPast}
                      labels={labels}
                      Components={Components}
                      getClass={getClass}
                      locale={locale}
                    />
                  ))
                )}
              </div>
            </div>
          ))}

          {/* Message if no events */}
          {eventsByDate.length === 0 && (
            <div className={getClass("planningEmpty")} data-eycalendar-empty="">
              <div className={getClass("planningEmptyContainer")}>
                <div className={getClass("planningEmptyIcon")}>
                  <Components.EmptyStateIcon />
                </div>
                <h3 className={getClass("planningEmptyTitle")}>{labels.planningEmptyTitle}</h3>
                <p className={getClass("planningEmptyText")}>{labels.planningEmptyText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Event card component
 */
interface EventCardProps {
  event: EyCalendarEvent;
  isPast: boolean;
  labels: ReturnType<typeof useEyCalendarLabels>;
  Components: ReturnType<typeof useEyCalendarComponents>;
  getClass: ReturnType<typeof useEyCalendarClasses>;
  locale?: Locale;
}

function EventCard({ event, isPast, labels, Components, getClass, locale }: EventCardProps) {
  const startTime = formatTime(event.start, locale);
  const duration = formatDuration(event.start, event.end);

  return (
    <div
      className={getClass("eventCard")}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: event.color || event.backgroundColor || "#3b82f6",
      }}
      data-eycalendar-event-card=""
      data-event-id={event.id}
      data-past={isPast ? "true" : undefined}
    >
      {/* Main line: time, duration, title and indicators */}
      <div className={getClass("eventCardHeader")}>
        {/* Time, duration and title on same line */}
        <div className={getClass("eventCardContent")}>
          <div className={getClass("eventCardTime")}>
            <span
              className={isPast ? getClass("eventCardTimePast") : getClass("eventCardTimeText")}
            >
              {startTime}
            </span>
            <span
              className={isPast ? getClass("eventCardDurationPast") : getClass("eventCardDuration")}
            >
              <Components.SeparatorIcon /> {duration}
            </span>
          </div>

          {/* Event title */}
          <h4 className={isPast ? getClass("eventCardTitlePast") : getClass("eventCardTitle")}>
            {event.title}
          </h4>
        </div>

        {/* Status indicators */}
        <div className={getClass("eventCardIndicators")}>
          {event.isAllDay && <span className={getClass("eventCardAllDay")}>{labels.allDay}</span>}
          {event.isRecurring && (
            <span className={getClass("eventCardRecurring")}>
              <Components.RecurringIcon />
            </span>
          )}
        </div>
      </div>

      {/* Description below if available */}
      {event.description && (
        <p
          className={
            isPast ? getClass("eventCardDescriptionPast") : getClass("eventCardDescription")
          }
        >
          {event.description}
        </p>
      )}

      {/* Location below if available */}
      {event.location && (
        <div className={isPast ? getClass("eventCardLocationPast") : getClass("eventCardLocation")}>
          <span className={getClass("eventCardLocationIcon")}>
            <Components.LocationIcon />
          </span>
          <span className={getClass("eventCardLocationText")}>{event.location}</span>
        </div>
      )}
    </div>
  );
}

export default PlanningView;
