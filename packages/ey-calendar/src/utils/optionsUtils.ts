// Utilities for merging and handling calendar options

import type { EyCalendarOptions } from "../types";

/**
 * Deep merge calendar options with defaults.
 * User options override defaults, with proper deep merging for nested objects.
 *
 * @param defaults - Default calendar options
 * @param userOptions - User-provided partial options
 * @returns Merged calendar options
 *
 * @example
 * ```ts
 * const options = mergeCalendarOptions(DEFAULT_OPTIONS, {
 *   defaultView: 'day',
 *   timeSlots: { startHour: 9 },
 * });
 * ```
 */
export function mergeCalendarOptions(
  defaults: EyCalendarOptions,
  userOptions?: Partial<EyCalendarOptions>
): EyCalendarOptions {
  if (!userOptions) {
    return { ...defaults };
  }

  // Shallow merge most options
  const merged: EyCalendarOptions = {
    ...defaults,
    ...userOptions,
  };

  // Deep merge nested objects
  if (userOptions.timeSlots) {
    merged.timeSlots = {
      ...defaults.timeSlots,
      ...userOptions.timeSlots,
    };
  }

  if (userOptions.views) {
    merged.views = {
      ...defaults.views,
      ...userOptions.views,
    };
  }

  if (userOptions.components) {
    merged.components = {
      ...defaults.components,
      ...userOptions.components,
    };
  }

  if (userOptions.labels) {
    merged.labels = {
      ...defaults.labels,
      ...userOptions.labels,
    };
  }

  return merged;
}
