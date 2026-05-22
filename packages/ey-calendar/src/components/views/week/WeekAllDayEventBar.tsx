// All-day event bar spanning multiple days in the week view header

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useOptions } from "../../../context/OptionsContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import type { EventSegment } from "../../../utils/eventUtils";
import { cn } from "../../../utils/cn";
import {
  getEventColor,
  getPastEventColors,
} from "../../../utils/eventUtils";

export interface WeekAllDayEventBarProps {
  segment: EventSegment;
  locale?: import("date-fns").Locale;
  rowHeight: number;
  rowGap: number;
  totalCols: number;
}

export function WeekAllDayEventBar({ segment, locale, rowHeight, rowGap }: WeekAllDayEventBarProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);

  const { event, startCol: _startCol, span, isStart, isEnd, row } = segment;
  void _startCol;

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

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

  const widthPercent = span * 100;
  const topOffset = row * (rowHeight + rowGap) + 4;
  const eventColor = getEventColor(event);
  const isPastEvent = event.end < new Date();
  const computedColors = getPastEventColors(eventColor, event?.isStriped, isPastEvent);

  return (
    <div
      ref={eventRef}
      className={cn(
        getClass("weekAllDayEventBar"),
        isPastEvent && getClass("eventPast"),
        isStart && isEnd && getClass("weekAllDayEventBarFull"),
        isStart && !isEnd && getClass("weekAllDayEventBarStart"),
        !isStart && isEnd && getClass("weekAllDayEventBarEnd"),
        !isStart && !isEnd && getClass("weekAllDayEventBarMiddle")
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-allday-event=""
      data-event-id={event.id}
      style={{
        left: 2,
        width: `calc(${widthPercent}% - 4px)`,
        top: topOffset,
        height: rowHeight,
        background: computedColors.background,
        color: computedColors.color,
        ...(event?.isStriped && {
          borderColor: computedColors.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
        zIndex: 10,
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP", { locale })} - ${format(new Date(event.end), "PP", { locale })}\n${event.description || ""}`}
    >
      <span className={getClass("weekAllDayEventBarContent")}>{event.title}</span>
    </div>
  );
}
