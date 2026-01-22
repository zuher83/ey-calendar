// Utilities for time slot calculations and grid granularity
// src/components/ey-calendar/utils/slotUtils.ts

import type { GridGranularity } from "../types";

/**
 * Effective height for positioning calculations.
 * Directly uses the cell height without any scaling factor.
 *
 * @param cellHeight - Base cell height in pixels
 * @returns Effective height for positioning calculations
 */
export const getEffectivePositionHeight = (cellHeight: number): number => cellHeight;

/**
 * Calculate time slots based on grid granularity.
 * Returns an array of slots with hour, minutes, and index.
 *
 * @param granularity - Grid granularity ('hour' | 'half-hour' | 'quarter-hour')
 * @returns Array of time slots with hour, minutes, and index
 *
 * @example
 * ```ts
 * const slots = getTimeSlotsByGranularity('quarter-hour');
 * // Returns 96 slots: 0h00, 0h15, 0h30, 0h45, 1h00, ...
 * ```
 */
export function getTimeSlotsByGranularity(
  granularity: GridGranularity
): Array<{ hour: number; minutes: number; index: number }> {
  switch (granularity) {
    case "hour":
      // 24 slots of 1 hour (0h, 1h, 2h, ..., 23h)
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        minutes: 0,
        index: i,
      }));

    case "half-hour":
      // 48 slots of 30 minutes (0h00, 0h30, 1h00, 1h30, ..., 23h30)
      return Array.from({ length: 48 }, (_, i) => ({
        hour: Math.floor(i / 2),
        minutes: (i % 2) * 30,
        index: i,
      }));

    case "quarter-hour":
      // 96 slots of 15 minutes (0h00, 0h15, 0h30, 0h45, 1h00, ...)
      return Array.from({ length: 96 }, (_, i) => ({
        hour: Math.floor(i / 4),
        minutes: (i % 4) * 15,
        index: i,
      }));

    default:
      return getTimeSlotsByGranularity("half-hour");
  }
}

/**
 * Calculate slot height based on granularity.
 * Returns the pixel height for a single slot based on the base cell height.
 *
 * @param granularity - Grid granularity
 * @param baseCellHeight - Base cell height in pixels (typically for 1 hour)
 * @returns Slot height in pixels
 *
 * @example
 * ```ts
 * const height = getSlotHeight('quarter-hour', 64);
 * // Returns 16 (64 / 4)
 * ```
 */
export function getSlotHeight(granularity: GridGranularity, baseCellHeight: number): number {
  switch (granularity) {
    case "hour":
      return baseCellHeight; // 1 hour = full height
    case "half-hour":
      return baseCellHeight / 2; // 30 minutes = half
    case "quarter-hour":
      return baseCellHeight / 4; // 15 minutes = quarter
    default:
      return baseCellHeight / 2;
  }
}
