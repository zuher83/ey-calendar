// Utility for merging class names
// src/utils/cn.ts

import { clsx, type ClassValue } from "clsx";

/**
 * Merges class names conditionally using clsx.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, etc.)
 * @returns Merged class string
 *
 * @example
 * cn('ey-cal-button', isActive && 'active', { 'disabled': isDisabled })
 * // Returns: 'ey-cal-button active' when isActive is true, isDisabled is false
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
