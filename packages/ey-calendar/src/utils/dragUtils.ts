// Pure helpers for drag & drop position calculations
// Extracted from useDragAndDrop.ts to enable independent testing

import { DEFAULT_TIME_SLOT_CONFIG } from "../constants";
import type { DropTarget } from "../types/state";
import type { EyCalendarEvent } from "../types/events";

/**
 * Calculates the target time based on the Y position of the mouse.
 * Applies the initial offset so the event snaps to where it was grabbed.
 */
export function calculateTargetTime(
  mouseY: number,
  containerRect: DOMRect,
  cellHeight: number,
  initialOffset: number = 0
): { hour: number; minutes: number } {
  const mouseYInContainer = mouseY - containerRect.top;
  const eventStartYInContainer = mouseYInContainer - initialOffset;

  const hourFloat = eventStartYInContainer / cellHeight;
  const hour = Math.floor(hourFloat);
  const minutesFraction = hourFloat - hour;

  const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
  const rawMinutes = minutesFraction * 60;

  let snapMinutes: number;
  if (granularity === "hour") {
    snapMinutes = 0;
  } else if (granularity === "half-hour") {
    snapMinutes = Math.round(rawMinutes / 30) * 30;
  } else {
    snapMinutes = Math.round(rawMinutes / 15) * 15;
  }

  let finalHour = hour;
  let finalMinutes = snapMinutes;

  if (finalMinutes >= 60) {
    finalHour += 1;
    finalMinutes = 0;
  }

  return {
    hour: Math.max(0, Math.min(23, finalHour)),
    minutes: Math.max(0, Math.min(59, finalMinutes)),
  };
}

/**
 * Computes new start/end dates for a month-view drop.
 * Preserves original hours/minutes; only changes the calendar date.
 */
export function computeMonthDrop(
  event: EyCalendarEvent,
  targetDate: Date,
  anchorDayOffset: number = 0
): { start: Date; end: Date } {
  const originalStart = new Date(event.start);
  const base = new Date(targetDate);

  const newStart = new Date(base);
  newStart.setDate(newStart.getDate() - Math.max(0, anchorDayOffset));
  newStart.setHours(
    originalStart.getHours(),
    originalStart.getMinutes(),
    originalStart.getSeconds(),
    originalStart.getMilliseconds()
  );

  const duration = event.end.getTime() - event.start.getTime();
  const newEnd = new Date(newStart.getTime() + duration);

  return { start: newStart, end: newEnd };
}

/**
 * Resolves which calendar day is targeted when dropping on a month-view bar segment.
 */
export function computeMonthDropTargetDate(
  baseTargetDate: Date,
  segmentSpan: number,
  relativeX: number,
  width: number
): Date {
  const targetDate = new Date(baseTargetDate);

  if (!Number.isFinite(segmentSpan) || segmentSpan <= 1 || !Number.isFinite(width) || width <= 0) {
    return targetDate;
  }

  const boundedRelativeX = Math.max(0, Math.min(width - 1, relativeX));
  const dayWidth = width / segmentSpan;
  const dayOffset = Math.max(0, Math.min(segmentSpan - 1, Math.floor(boundedRelativeX / dayWidth)));

  targetDate.setDate(targetDate.getDate() + dayOffset);

  return targetDate;
}

/**
 * Computes new start/end dates for a week/day-view drop.
 * Derives the target time from the mouse Y position in the container.
 */
export function computeWeekDayDrop(
  event: EyCalendarEvent,
  baseDate: Date,
  mouseY: number,
  containerRect: DOMRect,
  cellHeight: number,
  initialOffset: number
): { start: Date; end: Date } {
  const targetTime = calculateTargetTime(mouseY, containerRect, cellHeight, initialOffset);

  const newStart = new Date(baseDate);
  newStart.setHours(targetTime.hour, targetTime.minutes, 0, 0);

  const duration = event.end.getTime() - event.start.getTime();
  const newEnd = new Date(newStart.getTime() + duration);

  return { start: newStart, end: newEnd };
}

/**
 * Builds a DropTarget value suitable for the onEventDrop callback.
 */
export function buildDropTarget(
  start: Date,
  end: Date,
  resourceId?: string
): DropTarget {
  return {
    id: `drop-${Date.now()}`,
    type: resourceId ? "resource" : "timeslot",
    dateStart: start,
    dateEnd: end,
    resourceId,
    bounds: new DOMRect(),
    isValid: true,
  };
}
