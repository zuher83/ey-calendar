// Event-related types for the Calendar component
// src/components/ey-calendar/types/events.ts

/**
 * Calendar event with rendering metadata
 */
export interface EyCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;

  // Optional fields
  description?: string;
  location?: string;
  resourceId?: string;
  attendees?: string[];
  category?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  url?: string;

  // Colors
  backgroundColor?: string;
  textColor?: string;
  color?: string;
  isFilled?: boolean;
  isStriped?: boolean;

  // Rendering metadata (calculated)
  position?: EventPosition;
  conflictGroup?: string;
  column?: number;
  totalColumns?: number;
  zIndex?: number;

  // Custom data
  custom?: Record<string, any>;
}

/**
 * Calculated position of an event in the grid
 */
export interface EventPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

/**
 * Event column for conflict management
 */
export interface EventColumn {
  id: string;
  events: EyCalendarEvent[];
  width: number;
  x: number;
}

/**
 * Field mapping for data transformation
 */
export interface EventFieldMapping {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  resourceId?: string;
  category?: string;
  color?: string;
}

/**
 * Custom calendar event data
 */
export interface EyCalendarEventData<T = any> {
  event: EyCalendarEvent;
  source: "user" | "system" | "external";
  data?: T;
}
