// Strict payload types for drag & drop operations
// These types replace the loose Record<string, unknown> bases used previously.

import type { EventPosition, EyCalendarEvent } from "./events";

/**
 * Payload attached to a draggable event element (move operation)
 */
export interface DragMovePayload {
  type: "calendar-event";
  eventId: string;
  event: EyCalendarEvent;
  originalPosition?: EventPosition;
}

/**
 * Payload attached to a resize handle element
 */
export interface DragResizePayload {
  type: "calendar-event-resize";
  eventId: string;
  event: EyCalendarEvent;
  resizeHandle: "top" | "bottom";
}

/**
 * Discriminated union covering all drag payloads
 */
export type DragPayload = DragMovePayload | DragResizePayload;

/**
 * Data attached to a week/day drop target (time-based positioning)
 */
export interface WeekDayDropPayload {
  viewMode: "week" | "day";
  cellHeight: number;
  targetDate: Date;
  targetResourceId?: string;
}

/**
 * Data attached to a month drop target (date-only positioning)
 */
export interface MonthDropPayload {
  viewMode: "month";
  targetDate: Date;
  targetResourceId?: string;
}

/**
 * Discriminated union covering all drop target payloads
 */
export type DropPayload = WeekDayDropPayload | MonthDropPayload;
