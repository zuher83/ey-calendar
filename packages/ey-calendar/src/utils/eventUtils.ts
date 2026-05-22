import type { EventPosition, EyCalendarEvent } from "../types";
import { doDateRangesOverlap } from "./dateUtils";

// ============================================================================
// EVENT FILTERING AND SORTING
// ============================================================================

/**
 * Filter visible events within a date range
 */
export function getEventsInDateRange(
  events: EyCalendarEvent[],
  startDate: Date,
  endDate: Date
): EyCalendarEvent[] {
  return events.filter((event) =>
    doDateRangesOverlap({ start: event.start, end: event.end }, { start: startDate, end: endDate })
  );
}

/**
 * Filters events for a specific date
 */
export function getEventsForDate(events: EyCalendarEvent[], date: Date): EyCalendarEvent[] {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  return getEventsInDateRange(events, dayStart, dayEnd);
}

/**
 * Sort events by start time
 */
export function sortEventsByStartTime(events: EyCalendarEvent[]): EyCalendarEvent[] {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

// ============================================================================
// OVERLAP DETECTION
// ============================================================================

/**
 * Checks if two events overlap
 */
export function doEventsOverlap(event1: EyCalendarEvent, event2: EyCalendarEvent): boolean {
  return doDateRangesOverlap(
    { start: event1.start, end: event1.end },
    { start: event2.start, end: event2.end }
  );
}

/**
 * Finds all events that overlap with a given event
 */
export function getOverlappingEvents(
  targetEvent: EyCalendarEvent,
  allEvents: EyCalendarEvent[]
): EyCalendarEvent[] {
  return allEvents.filter(
    (event) => event.id !== targetEvent.id && doEventsOverlap(targetEvent, event)
  );
}

/**
 * Group overlapping events together
 */
export function groupOverlappingEvents(events: EyCalendarEvent[]): EyCalendarEvent[][] {
  const sortedEvents = sortEventsByStartTime(events);
  const groups: EyCalendarEvent[][] = [];
  const processed = new Set<string>();

  for (const event of sortedEvents) {
    if (processed.has(event.id)) continue;

    const group = [event];
    processed.add(event.id);

    // Find all events that overlap with those in the group
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;

      for (const candidate of sortedEvents) {
        if (processed.has(candidate.id)) continue;

        // Check whether the candidate overlaps with at least one event in the group
        const overlapsWithGroup = group.some((groupEvent) =>
          doEventsOverlap(candidate, groupEvent)
        );

        if (overlapsWithGroup) {
          group.push(candidate);
          processed.add(candidate.id);
          hasChanges = true;
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Generates a short title for an event
 */
export function getEventDisplayTitle(event: EyCalendarEvent, maxLength: number = 30): string {
  if (event.title.length <= maxLength) {
    return event.title;
  }

  return event.title.substring(0, maxLength - 3) + "...";
}

/**
 * Gets event color or default color
 */
export function getEventColor(event: EyCalendarEvent): string {
  return event.color || event.backgroundColor || "#3b82f6"; // blue-500 by default
}

/**
 * Determines the optimum text color for a given background
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const rgb = parseColorToRgb(backgroundColor);
  if (!rgb) return "#ffffff";

  // Luminance calculation
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return black or white depending on luminance
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Parses a color string (hex, rgb, or rgba) to RGB object
 */
export function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  // Handle hex format
  const hexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (hexResult) {
    return {
      r: parseInt(hexResult[1], 16),
      g: parseInt(hexResult[2], 16),
      b: parseInt(hexResult[3], 16),
    };
  }

  // Handle short hex format (#abc)
  const shortHexResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
  if (shortHexResult) {
    return {
      r: parseInt(shortHexResult[1] + shortHexResult[1], 16),
      g: parseInt(shortHexResult[2] + shortHexResult[2], 16),
      b: parseInt(shortHexResult[3] + shortHexResult[3], 16),
    };
  }

  // Handle rgb() and rgba() format
  const rgbResult = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (rgbResult) {
    return {
      r: parseInt(rgbResult[1], 10),
      g: parseInt(rgbResult[2], 10),
      b: parseInt(rgbResult[3], 10),
    };
  }

  return null;
}

/**
 * Converts hex color to RGB object
 * @deprecated Use parseColorToRgb instead for broader format support
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  return parseColorToRgb(hex);
}

/**
 * Adjusts color brightness
 * @param color - Color in any format (hex, rgb, rgba)
 * @param percent - Positive to lighten, negative to darken (-100 to 100)
 */
export function adjustColorBrightness(color: string, percent: number): string {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;

  const adjust = (value: number) => {
    const adjusted = value + (percent / 100) * 255;

    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts RGB to HSL color space
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to RGB color space
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGB object with r, g, b (0-255)
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Desaturates a color to make it more muted/grayed (like Google Calendar past events)
 * @param color - Color in any format (hex, rgb, rgba)
 * @param amount - Desaturation amount (0-100, where 100 = fully gray)
 * @param lightenAmount - Optional lightening (0-100)
 * @returns Desaturated color as rgb string
 */
export function desaturateColor(
  color: string,
  amount: number = 40,
  lightenAmount: number = 15
): string {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Reduce saturation
  const newSaturation = Math.max(0, hsl.s * (1 - amount / 100));

  // Increase lightness slightly to wash out the color
  const newLightness = Math.min(95, hsl.l + lightenAmount);

  const newRgb = hslToRgb(hsl.h, newSaturation, newLightness);

  return `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`;
}

/**
 * Calculates accessible colors for events, with optional desaturation for past events.
 * Past events get muted/grayed colors similar to Google Calendar.
 * @param baseColor - Base event color (hex, rgb, or rgba format)
 * @param isStriped - Whether the event uses striped pattern
 * @param isPastEvent - Whether the event is in the past (applies desaturation)
 * @returns Object with background, color, and borderColor styles
 */
export function getPastEventColors(
  baseColor: string,
  isStriped: boolean = false,
  isPastEvent: boolean = true
): { background: string; color: string; borderColor: string } {
  // For current events, use base color without modification
  if (!isPastEvent) {
    const background = isStriped ? getStripedBackground(baseColor) : baseColor;

    return {
      background,
      color: getOptimalTextColor(baseColor),
      borderColor: baseColor,
    };
  }

  // For past events, desaturate and lighten (muted/washed out look)
  const mutedBg = desaturateColor(baseColor, 50, 20);

  let background: string;
  if (isStriped) {
    background = getStripedBackground(mutedBg);
  } else {
    background = mutedBg;
  }

  // Calculate optimal text color for muted background
  // For past events, use a muted gray instead of pure black/white
  const baseTextColor = getOptimalTextColor(mutedBg);

  // Convert pure black/white to muted gray for past events
  let mutedTextColor: string;
  const textRgb = parseColorToRgb(baseTextColor);
  if (textRgb) {
    if (textRgb.r > 128) {
      // White text → light gray (still readable on darker backgrounds)
      mutedTextColor = "rgb(240, 240, 240)";
    } else {
      // Black text → dark gray (softer than pure black)
      mutedTextColor = "rgb(80, 80, 80)";
    }
  } else {
    mutedTextColor = baseTextColor;
  }

  return {
    background,
    color: mutedTextColor,
    borderColor: desaturateColor(baseColor, 40, 10),
  };
}

/**
 * Generates a striped background pattern with subtle tone variations
 * Uses two shades of the same color instead of transparent stripes
 * @param baseColor - Base hex color
 * @returns CSS background property value
 */
export function getStripedBackground(baseColor: string): string {
  const lighterColor = adjustColorBrightness(baseColor, 5);
  const darkerColor = adjustColorBrightness(baseColor, 0);

  return `repeating-linear-gradient(
    -45deg,
    ${lighterColor},
    ${lighterColor} 5px,
    ${darkerColor} 5px,
    ${darkerColor} 10px
  )`;
}

/**
 * Generates CSS styles for an event
 */
export function getEventStyles(
  event: EyCalendarEvent,
  position?: EventPosition,
  options?: { useFullWidth?: boolean; isInSingleColumn?: boolean; isPastEvent?: boolean }
): React.CSSProperties {
  // Check for striped pattern from custom data
  const isStriped = event?.isStriped === true;
  const isFilled = event?.isFilled !== false; // Default to filled if not specified
  const isPast = options?.isPastEvent === true;

  const baseColor = event.color || "#3b82f6";
  const bgColor = event.backgroundColor || baseColor;

  // For past events, desaturate and lighten (muted look like Google Calendar)
  const effectiveBgColor = isPast ? desaturateColor(bgColor, 50, 20) : bgColor;

  let backgroundStyle: React.CSSProperties["background"];

  if (isStriped) {
    // Diagonal stripes pattern with subtle tone variations
    backgroundStyle = getStripedBackground(effectiveBgColor);
  } else {
    backgroundStyle = effectiveBgColor;
  }

  // Calculate text color based on effective background
  let textColor =
    event.textColor || getOptimalTextColor(isFilled ? effectiveBgColor : "transparent");

  // For past events, use muted gray instead of pure black/white
  if (isPast && !event.textColor) {
    const textRgb = parseColorToRgb(textColor);
    if (textRgb) {
      if (textRgb.r > 128) {
        // White text → light gray
        textColor = "rgb(240, 240, 240)";
      } else {
        // Black text → dark gray (softer than pure black)
        textColor = "rgb(80, 80, 80)";
      }
    }
  }

  const baseStyles: React.CSSProperties = {
    background: backgroundStyle,
    color: textColor,
    borderColor: isPast ? desaturateColor(baseColor, 40, 10) : baseColor,
    borderWidth: "1px",
    borderStyle: "solid",
  };

  // const baseStyles: React.CSSProperties = {
  //   backgroundColor: event.backgroundColor || event.color || '#3b82f6',
  //   color: event.textColor || getOptimalTextColor(event.backgroundColor || event.color || '#3b82f6'),
  //   borderColor: event.color || '#3b82f6',
  // };

  if (position) {
    const styles: React.CSSProperties = {
      ...baseStyles,
      position: "absolute",
      left: `${(position.left || 0) + 2}px`, // Small space on left (2px)
      top: `${position.top}px`,
      height: `${Math.max(position.height - 2, 18)}px`, // Small space at bottom (2px) with min. height
      zIndex: event.zIndex || 1,
    };

    // If useFullWidth is enabled, we let the CSS container control the width
    if (!options?.useFullWidth) {
      styles.width = `${Math.max(position.width - 4, 40)}px`; // Width reduced to compensate for space on left
    } else {
      // For a single column, also add a space to the right
      const rightMargin = options?.isInSingleColumn ? "4px" : "2px";
      styles.width = `calc(100% - ${rightMargin} - 2px)`; // Left space + right space if single column
      styles.marginLeft = "2px";
    }

    return styles;
  }

  return baseStyles;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates that an event has the minimum required data
 */
export function validateEvent(event: Partial<EyCalendarEvent>): boolean {
  return !!(event.id && event.title && event.start && event.end && event.start < event.end);
}

/**
 * Cleans and normalizes event data
 */
export function normalizeEvent(event: Partial<EyCalendarEvent>): EyCalendarEvent | null {
  if (!validateEvent(event)) {
    return null;
  }

  return {
    id: event.id!,
    title: event.title!.trim(),
    start: new Date(event.start!),
    end: new Date(event.end!),
    description: event.description?.trim() || "",
    location: event.location?.trim() || "",
    resourceId: event.resourceId || undefined,
    attendees: event.attendees || [],
    category: event.category || "",
    color: event.color || "#3b82f6",
    backgroundColor: event.backgroundColor || event.color || "#3b82f6",
    textColor: event.textColor || undefined,
    isAllDay: Boolean(event.isAllDay),
    isRecurring: Boolean(event.isRecurring),
    url: event.url || "",
    custom: event.custom || {},
  };
}

// ============================================================================
// MULTI-DAY EVENT UTILITIES (Month View)
// ============================================================================

/**
 * Checks if an event spans multiple days
 */
export function isMultiDayEvent(event: EyCalendarEvent): boolean {
  const startDay = new Date(
    event.start.getFullYear(),
    event.start.getMonth(),
    event.start.getDate()
  );
  const endDay = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());

  return endDay.getTime() > startDay.getTime();
}

/**
 * Represents an event segment for a specific week in the month view
 */
export interface EventSegment {
  /** Original event reference */
  event: EyCalendarEvent;
  /** Column index where segment starts (0-6) */
  startCol: number;
  /** Column index where segment ends inclusive (0-6) */
  endCol: number;
  /** Span width (endCol - startCol + 1) */
  span: number;
  /** Whether this is the start of the event */
  isStart: boolean;
  /** Whether this is the end of the event */
  isEnd: boolean;
  /** Row index for stacking multiple events */
  row: number;
}

/**
 * Gets events that intersect with a given week
 * @param events - All calendar events
 * @param weekStart - First day of the week
 * @param weekEnd - Last day of the week
 */
export function getEventsForWeek(
  events: EyCalendarEvent[],
  weekStart: Date,
  weekEnd: Date
): EyCalendarEvent[] {
  const weekStartTime = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate()
  ).getTime();
  const weekEndTime = new Date(
    weekEnd.getFullYear(),
    weekEnd.getMonth(),
    weekEnd.getDate(),
    23,
    59,
    59,
    999
  ).getTime();

  return events.filter((event) => {
    const eventStart = event.start.getTime();
    const eventEnd = event.end.getTime();

    // Event overlaps with week if it starts before week ends AND ends after week starts
    return eventStart <= weekEndTime && eventEnd >= weekStartTime;
  });
}

/**
 * Calculates event segments for a week row in the month view
 * Returns segments with their position (startCol, endCol) and stacking row
 *
 * @param events - Events that intersect with this week
 * @param weekDays - Array of 7 dates for the week
 * @param maxRows - Maximum number of event rows to show (default 3)
 */
export function calculateEventSegments(
  events: EyCalendarEvent[],
  weekDays: Date[],
  maxRows: number = 3
): EventSegment[] {
  if (events.length === 0 || weekDays.length !== 7) {
    return [];
  }

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const weekStartTime = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate()
  ).getTime();
  const weekEndTime = new Date(
    weekEnd.getFullYear(),
    weekEnd.getMonth(),
    weekEnd.getDate(),
    23,
    59,
    59,
    999
  ).getTime();

  // Sort events: multi-day first (by duration desc), then by start time
  const sortedEvents = [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    // Multi-day events come first
    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    // Both multi-day: longer events first
    if (aIsMultiDay && bIsMultiDay) {
      const aDuration = a.end.getTime() - a.start.getTime();
      const bDuration = b.end.getTime() - b.start.getTime();
      if (aDuration !== bDuration) return bDuration - aDuration;
    }

    // Same type: sort by start time
    return a.start.getTime() - b.start.getTime();
  });

  const segments: EventSegment[] = [];
  // Track which columns are occupied at each row level
  const occupiedCells: boolean[][] = Array.from({ length: maxRows }, () => Array(7).fill(false));

  for (const event of sortedEvents) {
    // Calculate start column (clamped to week bounds)
    let startCol = 0;
    const eventStartTime = event.start.getTime();
    if (eventStartTime > weekStartTime) {
      // Find which day the event starts on
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(
          weekDays[i].getFullYear(),
          weekDays[i].getMonth(),
          weekDays[i].getDate()
        ).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
        if (eventStartTime >= dayStart && eventStartTime <= dayEnd) {
          startCol = i;
          break;
        }
      }
    }

    // Calculate end column (clamped to week bounds)
    let endCol = 6;
    const eventEndTime = event.end.getTime();
    if (eventEndTime < weekEndTime) {
      // Find which day the event ends on
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(
          weekDays[i].getFullYear(),
          weekDays[i].getMonth(),
          weekDays[i].getDate()
        ).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
        if (eventEndTime >= dayStart && eventEndTime <= dayEnd) {
          endCol = i;
          break;
        }
      }
    }

    // Find available row for this segment
    let assignedRow = -1;
    for (let row = 0; row < maxRows; row++) {
      let canFit = true;
      for (let col = startCol; col <= endCol; col++) {
        if (occupiedCells[row][col]) {
          canFit = false;
          break;
        }
      }
      if (canFit) {
        assignedRow = row;
        // Mark cells as occupied
        for (let col = startCol; col <= endCol; col++) {
          occupiedCells[row][col] = true;
        }
        break;
      }
    }

    // Skip if no row available (will be shown in "+X more")
    if (assignedRow === -1) {
      continue;
    }

    // Determine if this is the start/end of the event
    const eventStartDay = new Date(
      event.start.getFullYear(),
      event.start.getMonth(),
      event.start.getDate()
    ).getTime();
    const eventEndDay = new Date(
      event.end.getFullYear(),
      event.end.getMonth(),
      event.end.getDate()
    ).getTime();
    const isStart = eventStartDay >= weekStartTime;
    const isEnd = eventEndDay <= weekEndTime;

    segments.push({
      event,
      startCol,
      endCol,
      span: endCol - startCol + 1,
      isStart,
      isEnd,
      row: assignedRow,
    });
  }

  return segments;
}
