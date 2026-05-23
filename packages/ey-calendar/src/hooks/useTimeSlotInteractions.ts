import type React from "react";
import { addMinutes, format } from "date-fns";
import { DEFAULT_TIME_SLOT_CONFIG } from "../constants";
import { useCallbacks } from "../context/CallbacksContext";
import { useEvents } from "../context/EventsContext";
import { useOptions } from "../context/OptionsContext";
import type { TimeSlot } from "../types";

interface TriggerTimeSlotOptions {
  resourceId?: string;
  slotEnd?: Date;
  slotIndex?: number;
}

function buildTimeSlot(start: Date, end: Date, index: number): TimeSlot {
  const normalizedStart = new Date(start);
  const normalizedEnd = new Date(end);

  return {
    id: `slot-${normalizedStart.getTime()}-${normalizedEnd.getTime()}`,
    start: normalizedStart,
    end: normalizedEnd,
    startTime: format(normalizedStart, "HH:mm"),
    endTime: format(normalizedEnd, "HH:mm"),
    index,
  };
}

export function useTimeSlotInteractions() {
  const { callbacks } = useCallbacks();
  const { addEvent } = useEvents();
  const { options } = useOptions();
  const slotDuration = options.timeSlots?.duration ?? DEFAULT_TIME_SLOT_CONFIG.duration;

  const triggerTimeSlotClick = (
    slotStart: Date,
    e: React.MouseEvent,
    { resourceId, slotEnd, slotIndex = 0 }: TriggerTimeSlotOptions = {}
  ) => {
    callbacks?.onTimeSlotClick?.(slotStart, e, resourceId);

    const createdEvent = callbacks?.onEventCreate?.(
      buildTimeSlot(slotStart, slotEnd ?? addMinutes(slotStart, slotDuration), slotIndex),
      resourceId
    );

    if (createdEvent) {
      addEvent(createdEvent);
    }
  };

  const triggerTimeSlotDoubleClick = (
    slotStart: Date,
    e: React.MouseEvent,
    resourceId?: string
  ) => {
    callbacks?.onTimeSlotDoubleClick?.(slotStart, e, resourceId);
  };

  return {
    triggerTimeSlotClick,
    triggerTimeSlotDoubleClick,
  };
}
