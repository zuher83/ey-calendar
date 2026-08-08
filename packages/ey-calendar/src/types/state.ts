import type { EventPosition } from "./events";

/**
 * Drop zone for drag & drop
 */
export interface DropTarget {
  id: string;
  type: "timeslot" | "resource" | "day";
  dateStart: Date;
  dateEnd: Date;
  resourceId?: string;
  bounds: DOMRect;
  isValid: boolean;
}

/**
 * Result of a position calculation
 */
export interface PositionCalculation {
  position: EventPosition;
  conflicts: string[];
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
}
