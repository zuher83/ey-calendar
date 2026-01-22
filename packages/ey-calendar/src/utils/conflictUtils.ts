import type {
  ConflictGroup,
  ConflictStrategy,
  EventColumn,
  EyCalendarEvent,
  TimeSlot,
} from "../types";
import { doEventsOverlap, groupOverlappingEvents, sortEventsByStartTime } from "./eventUtils";

// ============================================================================
// CONFLICT DETECTION
// ============================================================================

/**
 * Detects all conflict groups in an event list
 */
export function detectConflictGroups(
  events: EyCalendarEvent[],
  timeSlot?: TimeSlot
): ConflictGroup[] {
  const overlappingGroups = groupOverlappingEvents(events);

  return overlappingGroups
    .filter((group) => group.length > 1) // Only groups with conflicts
    .map((events, index) => ({
      id: `conflict-group-${index}`,
      events: sortEventsByStartTime(events),
      timeSlot: timeSlot || {
        id: `slot-${index}`,
        start: events[0]?.start || new Date(),
        end: events[events.length - 1]?.end || new Date(),
        startTime: "00:00",
        endTime: "23:59",
        index: 0,
      },
      columns: [],
      strategy: "intelligent-overlay" as ConflictStrategy,
      resolved: false,
    }));
}

/**
 * Checks if an event conflicts with others
 */
export function hasConflicts(targetEvent: EyCalendarEvent, allEvents: EyCalendarEvent[]): boolean {
  return allEvents.some(
    (event) => event.id !== targetEvent.id && doEventsOverlap(targetEvent, event)
  );
}

// ============================================================================
// CONFLICT RESOLUTION ALGORITHMS
// ============================================================================

/**
 * Calculates the percentage overlap between two events
 */
function calculateOverlapPercentage(event1: EyCalendarEvent, event2: EyCalendarEvent): number {
  const start1 = event1.start.getTime();
  const end1 = event1.end.getTime();
  const start2 = event2.start.getTime();
  const end2 = event2.end.getTime();

  // Calculate intersection
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlapDuration = Math.max(0, overlapEnd - overlapStart);

  // Calculate the total duration of the two events
  const duration1 = end1 - start1;
  const duration2 = end2 - start2;
  const totalDuration = Math.min(duration1, duration2); // Take the shortest duration

  return totalDuration > 0 ? (overlapDuration / totalDuration) * 100 : 0;
}

/**
 * Calculates the time difference between two events in minutes
 */
function calculateTimeOffset(event1: EyCalendarEvent, event2: EyCalendarEvent): number {
  const start1 = event1.start.getTime();
  const start2 = event2.start.getTime();

  return Math.abs(start1 - start2) / (1000 * 60); //  Convert to minutes
}

/**
 * Validates and corrects column dimensions to prevent overflow
 */
function validateColumnDimensions(column: EventColumn): EventColumn {
  // Ensure x is between 0 and 100
  const validX = Math.max(0, Math.min(column.x, 100));

  // Ensure width + x does not exceed 100
  const maxWidth = 100 - validX;
  const validWidth = Math.max(10, Math.min(column.width, maxWidth)); // Minimum width of 10%

  return {
    ...column,
    x: validX,
    width: validWidth,
  };
}

/**
 * Determines if two events can be intelligently overlaid
 */
function canOverlayEvents(event1: EyCalendarEvent, event2: EyCalendarEvent): boolean {
  const overlapPercentage = calculateOverlapPercentage(event1, event2);
  const timeOffset = calculateTimeOffset(event1, event2);

  // Configurable thresholds - More permissive for testing
  const MAX_OVERLAP_PERCENTAGE = 50; // Increased from 30% to 50%
  const MIN_TIME_OFFSET_MINUTES = 10; // Reduced from 15 to 10 minutes

  // Debug logging (temporary)
  if (event1.title.includes("Scenario") && event2.title.includes("Scenario")) {
    // Debug disabled for production
  }

  return overlapPercentage <= MAX_OVERLAP_PERCENTAGE && timeOffset >= MIN_TIME_OFFSET_MINUTES;
}

/**
 * Resolves conflicts using the intelligent overlay strategy
 */
export function resolveIntelligentOverlayConflicts(
  conflictGroup: ConflictGroup,
  viewMode?: "month" | "week" | "day" | "planning"
): ConflictGroup {
  const events = sortEventsByStartTime(conflictGroup.events);

  // Debug for test scenarios
  const hasTestEvents = events.some((e) => e.title.includes("Scenario"));
  if (hasTestEvents) {
    // Debug disabled for production
  }

  if (events.length <= 1) {
    return resolveSideBySideConflicts(conflictGroup);
  }

  // New approach: check if all events can be in a single overlay group
  const allEventsCanBeSuperpposed = events.length <= 4; // Safety limit to avoid visual chaos

  // DDetect events that start at exactly the same time
  const eventsByStartTime = new Map<string, EyCalendarEvent[]>();
  events.forEach((event) => {
    const startTimeKey = event.start.getTime().toString();
    if (!eventsByStartTime.has(startTimeKey)) {
      eventsByStartTime.set(startTimeKey, []);
    }
    eventsByStartTime.get(startTimeKey)!.push(event);
  });

  const hasSameStartTimeEvents = Array.from(eventsByStartTime.values()).some(
    (group) => group.length > 1
  );

  // If events start at the same time, use a hybrid approach
  if (hasSameStartTimeEvents) {
    // Hybrid approach: side-by-side for events with the same start time,
    // overlay for others
    const columns: EventColumn[] = [];
    const processedEvents = new Set<string>();

    // Process each group of events with the same start time
    for (const [, sameStartEvents] of eventsByStartTime) {
      if (sameStartEvents.length === 1) {
        // Single event: can be overlaid normally
        const event = sameStartEvents[0];
        if (!processedEvents.has(event.id)) {
          const eventIndex = columns.length;
          const eventWidth = Math.max(85 - eventIndex * 3, 35);
          const eventX = eventIndex * 8;

          columns.push(
            validateColumnDimensions({
              id: `overlay-${eventIndex}`,
              events: [event],
              width: eventWidth,
              x: eventX,
            })
          );
          processedEvents.add(event.id);
        }
      } else {
        // Several events with the same start time: side by side
        const columnWidth = 100 / sameStartEvents.length;
        sameStartEvents.forEach((event, index) => {
          if (!processedEvents.has(event.id)) {
            columns.push(
              validateColumnDimensions({
                id: `sidebyside-${index}`,
                events: [event],
                width: columnWidth * 0.95, // 5% margin
                x: index * columnWidth,
              })
            );
            processedEvents.add(event.id);
          }
        });
      }
    }

    return {
      ...conflictGroup,
      columns,
      strategy: "intelligent-overlay",
      resolved: true,
    };
  }

  // Special case: all-day event with short events
  const allDayEvents = events.filter((e) => e.isAllDay);
  const timedEvents = events.filter((e) => !e.isAllDay);

  if (allDayEvents.length > 0 && timedEvents.length > 0) {
    // Special case: overlay short events on the all-day event
    // Les événements courts peuvent se superposer s'ils ne se chevauchent pas entre eux
    const sortedTimedEvents = sortEventsByStartTime(timedEvents);

    const columns: EventColumn[] = [];

    // Different treatment for different views
    if (viewMode === "day") {
      // Day view: all-day event takes up only 75% of width
      // to leave room for navigation
      allDayEvents.forEach((allDayEvent, index) => {
        columns.push(
          validateColumnDimensions({
            id: `allday-${index}`,
            events: [allDayEvent],
            width: 75, // 75% instead of 100% for day view
            x: 0,
          })
        );
      });

      // Short events are superimposed on the remaining 25%.
      sortedTimedEvents.forEach((event, eventIndex) => {
        const eventWidth = 20; // Fixed width for day view
        const eventX = 75 + eventIndex * 2; // Start after the all-day event

        columns.push(
          validateColumnDimensions({
            id: `timed-overlay-${eventIndex}`,
            events: [event],
            width: eventWidth,
            x: eventX,
          })
        );
      });
    } else {
      // Week/month views: normal behavior (100% width)
      allDayEvents.forEach((allDayEvent, index) => {
        columns.push(
          validateColumnDimensions({
            id: `allday-${index}`,
            events: [allDayEvent],
            width: 100,
            x: 0,
          })
        );
      });

      // Short events are superimposed on the remaining space (week/month view)
      sortedTimedEvents.forEach((event, eventIndex) => {
        const eventWidth = 70 - eventIndex * 5; // Decreasing width
        const eventX = 5 + eventIndex * 8; // Offset to the right

        columns.push(
          validateColumnDimensions({
            id: `timed-overlay-${eventIndex}`,
            events: [event],
            width: eventWidth,
            x: eventX,
          })
        );
      });
    }

    if (hasTestEvents) {
      // Debug disabled for production
    }

    return {
      ...conflictGroup,
      columns,
      strategy: "intelligent-overlay",
      resolved: true,
    };
  }

  if (allEventsCanBeSuperpposed) {
    // Try to create a single overlay group with all events
    const sortedEvents = sortEventsByStartTime(events);

    // Create columns with intelligent offset for overlay
    const columns: EventColumn[] = [];
    const baseWidth = 85; // 85% width for the first event
    const offsetStep = 8; // 8% offset between events
    const widthDecrease = 3; // 3% width decrease per event

    sortedEvents.forEach((event, eventIndex) => {
      const eventWidth = Math.max(baseWidth - eventIndex * widthDecrease, 35); // Minimum width of 35%
      const eventX = eventIndex * offsetStep;

      columns.push(
        validateColumnDimensions({
          id: `overlay-single-${eventIndex}`,
          events: [event],
          width: eventWidth,
          x: eventX,
        })
      );
    });

    // Final debug for test scenarios
    if (hasTestEvents) {
      // Debug disabled for production
    }

    return {
      ...conflictGroup,
      columns,
      strategy: "intelligent-overlay",
      resolved: true,
    };
  }

  // Fallback to the old method if too many events
  const overlayGroups: EyCalendarEvent[][] = [];

  for (const event of events) {
    let assignedToGroup = false;

    // Try to assign to an existing group
    for (const group of overlayGroups) {
      const canOverlayWithAll = group.every((groupEvent) => canOverlayEvents(event, groupEvent));

      if (canOverlayWithAll) {
        group.push(event);
        assignedToGroup = true;
        break;
      }
    }

    // If no compatible group, create a new group
    if (!assignedToGroup) {
      overlayGroups.push([event]);
    }
  }

  // Create columns for each overlay group
  const columns: EventColumn[] = [];

  overlayGroups.forEach((group, groupIndex) => {
    if (group.length === 1) {
      // Single event: full column
      columns.push({
        id: `overlay-column-${groupIndex}`,
        events: group,
        width: 100 / overlayGroups.length,
        x: groupIndex * (100 / overlayGroups.length),
      });
    } else {
      // Superposition group: calculating optimal positions
      const sortedGroup = sortEventsByStartTime(group);

      // For overlays, we use intelligent widths and positions
      const baseWidth = (100 / overlayGroups.length) * 0.8; // 80% of allocated space
      const offsetStep = baseWidth * 0.15; // 15% offset between events

      sortedGroup.forEach((event, eventIndex) => {
        const eventWidth = baseWidth - eventIndex * offsetStep * 0.3;
        const eventX = groupIndex * (100 / overlayGroups.length) + eventIndex * offsetStep;

        columns.push({
          id: `overlay-column-${groupIndex}-${eventIndex}`,
          events: [event],
          width: Math.max(eventWidth, 25), // Minimum width of 25%
          x: Math.min(eventX, 75), // Maximum position of 75%
        });
      });
    }
  });

  return {
    ...conflictGroup,
    columns,
    strategy: "intelligent-overlay",
    resolved: true,
  };
}

/**
 * Resolves conflicts with the "side-by-side" strategy
 */
export function resolveSideBySideConflicts(conflictGroup: ConflictGroup): ConflictGroup {
  const events = sortEventsByStartTime(conflictGroup.events);
  const columns: EventColumn[] = [];

  // Column assignment algorithm
  for (const event of events) {
    let assignedColumn = -1;

    // Find the first available column
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const canFitInColumn = !column.events.some((columnEvent) =>
        doEventsOverlap(event, columnEvent)
      );

      if (canFitInColumn) {
        assignedColumn = i;
        break;
      }
    }

    // If no column available, create a new
    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns.push({
        id: `column-${assignedColumn}`,
        events: [],
        width: 0,
        x: 0,
      });
    }

    columns[assignedColumn].events.push(event);
  }

  // Calculate column widths and positions
  const columnWidth = 100 / columns.length; // Percentage
  columns.forEach((column, index) => {
    column.width = columnWidth;
    column.x = index * columnWidth;
  });

  return {
    ...conflictGroup,
    columns,
    strategy: "side-by-side",
    resolved: true,
  };
}

/**
 * RResolves conflicts with the "stack" strategy
 */
export function resolveStackConflicts(conflictGroup: ConflictGroup): ConflictGroup {
  const events = sortEventsByStartTime(conflictGroup.events);

  // In the stack strategy, all events share a single column
  const column: EventColumn = {
    id: "stack-column",
    events,
    width: 100,
    x: 0,
  };

  return {
    ...conflictGroup,
    columns: [column],
    strategy: "stack",
    resolved: true,
  };
}

/**
 * Resolves conflicts with the "compression" strategy
 */
export function resolveCompressConflicts(conflictGroup: ConflictGroup): ConflictGroup {
  const events = sortEventsByStartTime(conflictGroup.events);

  const column: EventColumn = {
    id: "compress-column",
    events,
    width: 100,
    x: 0,
  };

  return {
    ...conflictGroup,
    columns: [column],
    strategy: "compress",
    resolved: true,
  };
}

/**
 * Resolves conflicts according to the specified strategy
 */
export function resolveConflictGroup(
  conflictGroup: ConflictGroup,
  strategy?: ConflictStrategy,
  viewMode?: "month" | "week" | "day" | "planning"
): ConflictGroup {
  const resolverStrategy = strategy || conflictGroup.strategy;

  switch (resolverStrategy) {
    case "intelligent-overlay":
      return resolveIntelligentOverlayConflicts(conflictGroup, viewMode);

    case "side-by-side":
      return resolveSideBySideConflicts(conflictGroup);

    case "stack":
      return resolveStackConflicts(conflictGroup);

    case "compress":
      return resolveCompressConflicts(conflictGroup);

    case "manual":
      // Manual resolution - return as is
      return { ...conflictGroup, resolved: false };

    default:
      return resolveIntelligentOverlayConflicts(conflictGroup);
  }
}
