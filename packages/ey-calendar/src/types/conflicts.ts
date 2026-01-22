// Conflict-related types for the Calendar component
// src/components/ey-calendar/types/conflicts.ts

import type { ConflictStrategy } from "./base";
import type { EventColumn, EyCalendarEvent } from "./events";
import type { TimeSlot } from "./time";

/**
 * Group of conflicting events
 */
export interface ConflictGroup {
  id: string;
  events: EyCalendarEvent[];
  timeSlot: TimeSlot;
  resourceId?: string;
  columns: EventColumn[];
  strategy: ConflictStrategy;
  resolved: boolean;
}

/**
 * Conflict resolution result
 */
export interface ConflictResolution {
  groupId: string;
  strategy: ConflictStrategy;
  columns: EventColumn[];
  affectedEvents: string[];
  timestamp: Date;
}
