// Tests for eventUtils
import type { EyCalendarEvent } from "../../src/types";
import {
  calculateEventSegments,
  doEventsOverlap,
  getEventDisplayTitle,
  getEventsForDate,
  getEventsInDateRange,
  getOverlappingEvents,
  groupOverlappingEvents,
  sortEventsByStartTime,
} from "../../src/utils/eventUtils";

describe("eventUtils", () => {
  // Helper for creating test events
  const createEvent = (
    id: string,
    start: Date,
    end: Date,
    title = "Test Event"
  ): EyCalendarEvent => ({
    id,
    title,
    start,
    end,
    isAllDay: false,
  });

  describe("getEventsInDateRange", () => {
    it("filters events within a date range", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 2, 10, 0), new Date(2024, 0, 2, 11, 0)),
        createEvent("3", new Date(2024, 0, 3, 10, 0), new Date(2024, 0, 3, 11, 0)),
      ];

      const result = getEventsInDateRange(
        events,
        new Date(2024, 0, 1),
        new Date(2024, 0, 2, 23, 59)
      );

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toEqual(["1", "2"]);
    });

    it("includes events that partially overlap the range", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 2, 14, 0)),
      ];

      const result = getEventsInDateRange(
        events,
        new Date(2024, 0, 2, 0, 0),
        new Date(2024, 0, 3, 0, 0)
      );

      expect(result).toHaveLength(1);
    });

    it("returns an empty array if there are no events in the range", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
      ];

      const result = getEventsInDateRange(events, new Date(2024, 0, 5), new Date(2024, 0, 6));

      expect(result).toHaveLength(0);
    });
  });

  describe("getEventsForDate", () => {
    it("returns events for a specific date", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)),
        createEvent("3", new Date(2024, 0, 2, 10, 0), new Date(2024, 0, 2, 11, 0)),
      ];

      const result = getEventsForDate(events, new Date(2024, 0, 1));

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toEqual(["1", "2"]);
    });

    it("includes multi-day events that span the date", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 3, 11, 0)),
      ];

      const result = getEventsForDate(events, new Date(2024, 0, 2));

      expect(result).toHaveLength(1);
    });

    it("returns an empty array if there are no events today", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
      ];

      const result = getEventsForDate(events, new Date(2024, 0, 5));

      expect(result).toHaveLength(0);
    });
  });

  describe("sortEventsByStartTime", () => {
    it("sorts events by start time", () => {
      const events: EyCalendarEvent[] = [
        createEvent("3", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)),
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 12, 0), new Date(2024, 0, 1, 13, 0)),
      ];

      const sorted = sortEventsByStartTime(events);

      expect(sorted.map((e) => e.id)).toEqual(["1", "2", "3"]);
    });

    it("does not modify the original table", () => {
      const events: EyCalendarEvent[] = [
        createEvent("2", new Date(2024, 0, 1, 12, 0), new Date(2024, 0, 1, 13, 0)),
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
      ];

      const sorted = sortEventsByStartTime(events);

      expect(events[0].id).toBe("2"); // Le tableau original n'a pas changé
      expect(sorted[0].id).toBe("1"); // Le nouveau tableau est trié
    });

    it("properly handles events with the same start time", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 12, 0)),
      ];

      const sorted = sortEventsByStartTime(events);

      expect(sorted).toHaveLength(2);
    });
  });

  describe("doEventsOverlap", () => {
    it("detects partial overlap", () => {
      const event1 = createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 12, 0));
      const event2 = createEvent("2", new Date(2024, 0, 1, 11, 0), new Date(2024, 0, 1, 13, 0));

      expect(doEventsOverlap(event1, event2)).toBe(true);
    });

    it("detects when one event contains another", () => {
      const event1 = createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 14, 0));
      const event2 = createEvent("2", new Date(2024, 0, 1, 11, 0), new Date(2024, 0, 1, 12, 0));

      expect(doEventsOverlap(event1, event2)).toBe(true);
    });

    it("returns false when events do not overlap", () => {
      const event1 = createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0));
      const event2 = createEvent("2", new Date(2024, 0, 1, 12, 0), new Date(2024, 0, 1, 13, 0));

      expect(doEventsOverlap(event1, event2)).toBe(false);
    });
  });

  describe("getOverlappingEvents", () => {
    it("find overlapping events", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 11, 0),
        new Date(2024, 0, 1, 13, 0)
      );
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 12, 0)), // Chevauche
        createEvent("2", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)), // Ne chevauche pas
        createEvent("3", new Date(2024, 0, 1, 12, 30), new Date(2024, 0, 1, 14, 0)), // Chevauche
        target,
      ];

      const overlapping = getOverlappingEvents(target, events);

      expect(overlapping).toHaveLength(2);
      expect(overlapping.map((e) => e.id)).toEqual(expect.arrayContaining(["1", "3"]));
    });

    it("excludes the target event itself", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 11, 0),
        new Date(2024, 0, 1, 13, 0)
      );
      const events: EyCalendarEvent[] = [target];

      const overlapping = getOverlappingEvents(target, events);

      expect(overlapping).toHaveLength(0);
    });
  });

  describe("groupOverlappingEvents", () => {
    it("groups overlapping events", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)), // Chevauche 1
        createEvent("3", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)), // Groupe séparé
      ];

      const groups = groupOverlappingEvents(events);

      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(2); // Groupe 1 et 2
      expect(groups[1]).toHaveLength(1); // Groupe 3
    });

    it("creates a single group for chain overlaps", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
        createEvent("3", new Date(2024, 0, 1, 11, 0), new Date(2024, 0, 1, 12, 0)),
      ];

      const groups = groupOverlappingEvents(events);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(3);
    });

    it("returns individual groups if there is no overlap", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 12, 0), new Date(2024, 0, 1, 13, 0)),
        createEvent("3", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)),
      ];

      const groups = groupOverlappingEvents(events);

      expect(groups).toHaveLength(3);
      groups.forEach((group) => {
        expect(group).toHaveLength(1);
      });
    });
  });

  describe("calculateEventSegments", () => {
    it("supports business-week rows with five visible days", () => {
      const workWeek = [15, 16, 17, 18, 19].map((day) => new Date(2024, 0, day));
      const event = createEvent(
        "business-week-segment",
        new Date(2024, 0, 18, 9, 0),
        new Date(2024, 0, 22, 17, 0),
        "Spans hidden weekend"
      );

      const [segment] = calculateEventSegments([event], workWeek, 3);

      expect(segment).toBeDefined();
      expect(segment?.startCol).toBe(3);
      expect(segment?.endCol).toBe(4);
      expect(segment?.span).toBe(2);
      expect(segment?.isStart).toBe(true);
      expect(segment?.isEnd).toBe(false);
    });
  });

  describe("getEventDisplayTitle", () => {
    it("returns the full title if shorter than maxLength", () => {
      const event = createEvent("1", new Date(), new Date(), "Court");
      expect(getEventDisplayTitle(event, 30)).toBe("Court");
    });

    it("truncates the title if it exceeds maxLength", () => {
      const event = createEvent("1", new Date(), new Date(), "Ceci est un très long titre");
      const result = getEventDisplayTitle(event, 10);

      expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
      expect(result).toContain("...");
    });

    it("uses default maxLength of 30", () => {
      const longTitle = "A".repeat(50);
      const event = createEvent("1", new Date(), new Date(), longTitle);
      const result = getEventDisplayTitle(event);

      expect(result.length).toBeLessThanOrEqual(33);
    });
  });
});
