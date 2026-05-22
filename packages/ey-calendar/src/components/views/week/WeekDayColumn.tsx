// Day column in the weekly view with event layout and conflict resolution

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCallbacks } from "../../../context/CallbacksContext";
import { useOptions } from "../../../context/OptionsContext";
import { useViewCellHeight } from "../../../context/ViewContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useEyCalendarClasses } from "../../../hooks/useEyCalendarClasses";
import type { EyCalendarEvent } from "../../../types";
import { cn } from "../../../utils/cn";
import { prepareIntradayEventLayouts } from "../../../utils/intradayEventLayout";
import { MemoizedEventBar } from "../../events/EventBar";

export interface WeekDayColumnProps {
  date: Date;
  events: EyCalendarEvent[];
  hours: number[];
}

export function WeekDayColumn({ date, events, hours }: WeekDayColumnProps) {
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const { makeDropTarget } = useDragAndDrop();
  const dayRef = useRef<HTMLDivElement>(null);
  const cellHeight = useViewCellHeight();

  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });

  useEffect(() => {
    const element = dayRef.current;
    if (element) {
      return makeDropTarget(element, {
        targetDate: date,
        targetResourceId: undefined,
        viewMode: "week",
        cellHeight,
      });
    }
  }, [date, makeDropTarget, cellHeight]);

  const handleSlotClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = dayRef.current?.getBoundingClientRect();
      if (!rect) return;

      const relativeY = e.clientY - rect.top;
      const hourIndex = Math.floor(relativeY / cellHeight);
      const minuteFraction = (relativeY % cellHeight) / cellHeight;
      const minutes = Math.floor((minuteFraction * 60) / 15) * 15;

      const clickedTime = new Date(date);
      clickedTime.setHours(hourIndex, minutes, 0, 0);

      callbacks?.onTimeSlotClick?.(clickedTime, e);
    },
    [date, cellHeight, callbacks]
  );

  const eventLayouts = useMemo(
    () =>
      prepareIntradayEventLayouts({
        date,
        events,
        minHeight: 20,
        pixelsPerMinute: cellHeight / 60,
        viewMode: "week",
      }),
    [date, events, cellHeight]
  );

  return (
    <div
      ref={dayRef}
      className={getClass("weekDayColumnInner")}
      onClick={handleSlotClick}
      data-eycalendar-day-column=""
      data-drop-target="true"
      data-testid="day-column"
    >
      {hours.map((hour, index) => (
        <div
          key={hour}
          className={getClass("weekHourCell")}
          id={`hour-${hour}`}
          data-eycalendar-hour-cell=""
          data-hour={hour}
          data-position={index * cellHeight}
          style={{ position: "relative", height: `${cellHeight}px` }}
        />
      ))}

      <div className={getClass("weekEventsContainer")} data-eycalendar-events-container="">
        {eventLayouts.map(
          ({
            event,
            isInConflict,
            isInSingleColumn,
            chronologicalZIndex,
            position,
            columnInfo,
          }) => {
            if (columnInfo && isInConflict) {
              return (
                <div
                  key={event.id}
                  className={getClass("weekEventWrapperConflict")}
                  style={{
                    left: `${columnInfo.columnX}%`,
                    width: `${columnInfo.columnWidth}%`,
                    top: "0",
                    bottom: "0",
                  }}
                >
                  <MemoizedEventBar
                    event={event}
                    position={position}
                    viewMode="week"
                    isInConflict={isInConflict}
                    chronologicalZIndex={chronologicalZIndex}
                    isInSingleColumn={isInSingleColumn}
                  />
                </div>
              );
            }

            return (
              <div key={event.id} className={cn(getClass("weekEventWrapper"))}>
                <MemoizedEventBar
                  event={event}
                  position={position}
                  viewMode="week"
                  isInConflict={isInConflict}
                  chronologicalZIndex={chronologicalZIndex}
                  isInSingleColumn={isInSingleColumn}
                />
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
