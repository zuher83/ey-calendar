import type { EventPosition, EyCalendarEvent, ViewMode } from "../types";
import { detectConflictGroups, resolveConflictGroup } from "./conflictUtils";

interface EventColumnInfo {
  columnCount: number;
  columnWidth: number;
  columnX: number;
}

export interface PreparedIntradayEventLayout {
  event: EyCalendarEvent;
  isInConflict: boolean;
  isInSingleColumn: boolean;
  chronologicalZIndex: number;
  position: EventPosition;
  columnInfo?: EventColumnInfo;
}

interface PrepareIntradayEventLayoutsOptions {
  date: Date;
  events: EyCalendarEvent[];
  minHeight: number;
  pixelsPerMinute: number;
  viewMode: Extract<ViewMode, "day" | "week">;
}

export function getUniqueEvents(events: EyCalendarEvent[]): EyCalendarEvent[] {
  const seenIds = new Set<string>();

  return events.filter((event) => {
    if (seenIds.has(event.id)) {
      return false;
    }

    seenIds.add(event.id);
    return true;
  });
}

export function prepareIntradayEventLayouts({
  date,
  events,
  minHeight,
  pixelsPerMinute,
  viewMode,
}: PrepareIntradayEventLayoutsOptions): PreparedIntradayEventLayout[] {
  const uniqueEvents = getUniqueEvents(events);
  const conflictGroups = detectConflictGroups(uniqueEvents);
  const resolvedGroups = conflictGroups.map((group) => resolveConflictGroup(group, undefined, viewMode));
  const conflictingEventIds = new Set(conflictGroups.flatMap((group) => group.events.map((event) => event.id)));
  const eventColumnMap = new Map<string, EventColumnInfo>();

  resolvedGroups.forEach((group) => {
    group.columns.forEach((column) => {
      column.events.forEach((event) => {
        eventColumnMap.set(event.id, {
          columnCount: group.columns.length,
          columnWidth: column.width,
          columnX: column.x,
        });
      });
    });
  });

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const nextDayStart = new Date(dayStart);
  nextDayStart.setDate(nextDayStart.getDate() + 1);

  return uniqueEvents.flatMap((event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return [];
    }

    const effectiveStart = startDate < dayStart ? dayStart : startDate;
    const effectiveEnd = endDate > nextDayStart ? nextDayStart : endDate;

    if (effectiveEnd <= effectiveStart) {
      return [];
    }

    const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
    const endMinutes = (effectiveEnd.getTime() - dayStart.getTime()) / 60000;
    const top = startMinutes * pixelsPerMinute;
    const height = Math.max((endMinutes - startMinutes) * pixelsPerMinute, minHeight);
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
    const chronologicalZIndex = Math.max(1, Math.floor(100 - (durationMinutes / (24 * 60)) * 99));
    const isInConflict = conflictingEventIds.has(event.id);

    return [
      {
        event,
        isInConflict,
        isInSingleColumn: !isInConflict,
        chronologicalZIndex,
        position: {
          x: 0,
          y: top,
          width: 200,
          height,
          top,
          left: 0,
        },
        columnInfo: eventColumnMap.get(event.id),
      },
    ];
  });
}
