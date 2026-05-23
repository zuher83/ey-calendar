// Resource-related types for the Calendar component
// src/components/ey-calendar/types/resources.ts

import type { TimeSlot } from "./time";

/**
 * Resource (person, room, equipment)
 */
export interface EyCalendarResource {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  department?: string;
  isAvailable?: boolean;
  workingHours?: WorkingHours;
  custom?: Record<string, unknown>;
}

/**
 * Working hours of a resource
 */
export interface WorkingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/**
 * Schedule for a single day
 */
export interface DaySchedule {
  isWorkingDay: boolean;
  startTime?: string; // Format HH:mm
  endTime?: string; // Format HH:mm
  breaks?: TimeSlot[];
}

/**
 * Mapping fields for resources
 */
export interface ResourceFieldMapping {
  id?: string;
  name?: string;
  email?: string;
  department?: string;
  color?: string;
}
