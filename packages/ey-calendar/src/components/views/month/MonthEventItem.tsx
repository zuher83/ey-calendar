// Single-day event item for month view (dot + time + title style)

import { useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useOptions } from "../../../context/OptionsContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import { useEyCalendarLabels } from "../../../hooks/useEyCalendarLabels";
import { useEventKeyboardInteractions } from "../../../hooks/useEventKeyboardInteractions";
import type { EyCalendarEvent } from "../../../types";
import { getEventColor } from "../../../utils/eventUtils";

export interface MonthEventItemProps {
  event: EyCalendarEvent;
  locale?: import("date-fns").Locale;
  topOffset: number;
  height: number;
}

export function MonthEventItem({ event, locale, topOffset, height }: MonthEventItemProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);
  const labels = useEyCalendarLabels(options.labels, options.locale);

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  const isPastEvent = event.end < new Date();

  useEffect(() => {
    const element = eventRef.current;
    if (element) {
      return makeDraggable(element, event);
    }
  }, [event, makeDraggable]);

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

  const handleKeyActivate = useCallback(
    (e: React.KeyboardEvent) => {
      callbacks?.onEventClick?.(event, e as unknown as React.MouseEvent);
    },
    [callbacks, event]
  );

  const handleKeyDown = useEventKeyboardInteractions(event, handleKeyActivate);

  const eventColor = getEventColor(event);

  return (
    <div
      ref={eventRef}
      className={getClass("monthEventItemWrapper")}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={labels.ariaEvent(event.title)}
      data-eycalendar-month-event-item=""
      data-event-id={event.id}
      data-past={isPastEvent ? "true" : undefined}
      style={{ top: topOffset, height }}
      title={`${event.title}\n${format(new Date(event.start), "PP HH:mm", { locale })} - ${format(new Date(event.end), "PP HH:mm", { locale })}\n${event.description || ""}`}
    >
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
      <span className={getClass("monthEventItemTime")}>
        {format(new Date(event.start), "HH:mm", { locale })}
      </span>
      <span className={getClass("monthEventItemTitle")}>{event.title}</span>
    </div>
  );
}
