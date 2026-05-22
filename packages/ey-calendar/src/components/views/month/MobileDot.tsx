// Mobile event dot indicator for month view cells

import { useEvents } from "../../../context/EventsContext";
import { useOptions } from "../../../context/OptionsContext";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import { cn } from "../../../utils/cn";
import { getEventColor, getEventsForDate } from "../../../utils/eventUtils";

export function MobileDot({ date }: { date: Date }) {
  const { state: eventsState } = useEvents();
  const { options } = useOptions();
  const { events } = eventsState;

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  const dayEvents = getEventsForDate(events, date);

  if (dayEvents.length === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        getClass("monthEventDot"),
        getClass("monthEventDotMobile")
      )}
      style={{ backgroundColor: getEventColor(dayEvents[0]) }}
    />
  );
}
