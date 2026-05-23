// Day column in the weekly view with event layout and conflict resolution

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useOptions } from "../../../context/OptionsContext";
import { useViewCellHeight } from "../../../context/ViewContext";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import { useTimeSlotInteractions } from "../../../hooks/useTimeSlotInteractions";
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
  const { options } = useOptions();
  const { makeDropTarget } = useDragAndDrop();
  const { triggerTimeSlotClick, triggerTimeSlotDoubleClick } = useTimeSlotInteractions();
  const dayRef = useRef<HTMLDivElement>(null);
  const cellHeight = useViewCellHeight();
  const creationEnabled = options.enableCreate !== false && options.readonly !== true;
  const slotStepMinutes = options.timeSlots?.stepMinutes ?? options.timeSlots?.duration ?? 15;
  const getClass = options.getClass;

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
      if (!creationEnabled) return;

      const rect = dayRef.current?.getBoundingClientRect();
      if (!rect) return;

      const relativeY = e.clientY - rect.top;
      const hourIndex = Math.floor(relativeY / cellHeight);
      const minuteFraction = (relativeY % cellHeight) / cellHeight;
      const minutes = Math.floor((minuteFraction * 60) / slotStepMinutes) * slotStepMinutes;

      const clickedTime = new Date(date);
      clickedTime.setHours(hourIndex, minutes, 0, 0);

      triggerTimeSlotClick(clickedTime, e);
    },
    [date, cellHeight, creationEnabled, slotStepMinutes, triggerTimeSlotClick]
  );

  const handleSlotDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!creationEnabled) return;

      const rect = dayRef.current?.getBoundingClientRect();
      if (!rect) return;

      const relativeY = e.clientY - rect.top;
      const hourIndex = Math.floor(relativeY / cellHeight);
      const minuteFraction = (relativeY % cellHeight) / cellHeight;
      const minutes = Math.floor((minuteFraction * 60) / slotStepMinutes) * slotStepMinutes;

      const clickedTime = new Date(date);
      clickedTime.setHours(hourIndex, minutes, 0, 0);

      triggerTimeSlotDoubleClick(clickedTime, e);
    },
    [date, cellHeight, creationEnabled, slotStepMinutes, triggerTimeSlotDoubleClick]
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
      onDoubleClick={handleSlotDoubleClick}
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
