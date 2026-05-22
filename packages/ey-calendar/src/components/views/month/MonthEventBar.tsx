// Multi-day spanning event bar for month view

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useOptions } from "../../../context/OptionsContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import {
  getEventColor,
  getPastEventColors,
  type EventSegment,
} from "../../../utils/eventUtils";

export interface MonthEventBarProps {
  segment: EventSegment;
  segmentStartOffsetDays: number;
  visibleSegmentStartDate: Date;
  locale?: import("date-fns").Locale;
}

export function MonthEventBar({
  segment,
  segmentStartOffsetDays,
  visibleSegmentStartDate,
  locale,
}: MonthEventBarProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDraggable, makeDropTarget } = useDragAndDrop();
  const eventRef = useRef<HTMLDivElement>(null);

  const { event, startCol, span, isStart, isEnd, row } = segment;

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  const isPastEvent = event.end < new Date();

  useEffect(() => {
    const element = eventRef.current;
    if (element) {
      const cleanupDraggable = makeDraggable(element, event);
      const cleanupDropTarget = makeDropTarget(element, {
        targetDate: visibleSegmentStartDate,
        targetResourceId: undefined,
        viewMode: "month",
      });

      return () => {
        cleanupDropTarget();
        cleanupDraggable();
      };
    }
  }, [event, makeDraggable, makeDropTarget, visibleSegmentStartDate]);

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

  const leftPercent = (startCol / 7) * 100;
  const widthPercent = (span / 7) * 100;
  const eventRowHeight = 20;
  const eventRowGap = 2;
  const topOffset = row * (eventRowHeight + eventRowGap);
  const eventColor = getEventColor(event);
  const computedColors = getPastEventColors(eventColor, event?.isStriped, isPastEvent);

  return (
    <div
      ref={eventRef}
      className={getClass("monthEventBar")}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      data-eycalendar-month-event=""
      data-event-id={event.id}
      data-start={isStart ? "true" : "false"}
      data-end={isEnd ? "true" : "false"}
      data-segment-span={span}
      data-segment-start-offset-days={segmentStartOffsetDays}
      data-past={isPastEvent ? "true" : undefined}
      style={{
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        top: topOffset,
        height: eventRowHeight,
        background: computedColors.background,
        color: computedColors.color,
        ...(event?.isStriped && {
          borderColor: computedColors.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
      }}
      title={`${event.title}\n${format(new Date(event.start), "PP HH:mm", { locale })} - ${format(new Date(event.end), "PP HH:mm", { locale })}\n${event.description || ""}`}
    >
      {isStart && (
        <span className={getClass("monthEventBarTime")}>
          {format(new Date(event.start), "HH:mm", { locale })}
        </span>
      )}
      <span className={getClass("monthEventBarTitle")}>{event.title}</span>
    </div>
  );
}
