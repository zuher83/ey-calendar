// Tests for conflictUtils
import type { EyCalendarEvent } from "../../src/types";
import { detectConflictGroups, hasConflicts } from "../../src/utils/conflictUtils";

describe("conflictUtils", () => {
  // Helper for creating test events
  const createEvent = (id: string, start: Date, end: Date): EyCalendarEvent => ({
    id,
    title: `Event ${id}`,
    start,
    end,
    isAllDay: false,
  });

  describe("detectConflictGroups", () => {
    it("detects simple conflict groups", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups).toHaveLength(1);
      expect(groups[0].events).toHaveLength(2);
      expect(groups[0].resolved).toBe(false);
    });

    it("does not return groups if there is no conflict", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 12, 0), new Date(2024, 0, 1, 13, 0)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups).toHaveLength(0);
    });

    it("detects several separate groups of conflicts", () => {
      const events: EyCalendarEvent[] = [
        // Group 1
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
        // Group 2
        createEvent("3", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)),
        createEvent("4", new Date(2024, 0, 1, 14, 30), new Date(2024, 0, 1, 15, 30)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups).toHaveLength(2);
      expect(groups[0].events).toHaveLength(2);
      expect(groups[1].events).toHaveLength(2);
    });

    it("correctly groups chain conflicts (3+ events)", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
        createEvent("3", new Date(2024, 0, 1, 11, 0), new Date(2024, 0, 1, 12, 0)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups).toHaveLength(1);
      expect(groups[0].events).toHaveLength(3);
    });

    it("assigns a default resolution strategy", () => {
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups[0].strategy).toBe("intelligent-overlay");
    });

    it("sorts events by start time within each group", () => {
      const events: EyCalendarEvent[] = [
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups[0].events[0].id).toBe("1");
      expect(groups[0].events[1].id).toBe("2");
    });

    it("generates unique IDs for each group", () => {
      const events: EyCalendarEvent[] = [
        // Groupe 1
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 30)),
        // Groupe 2
        createEvent("3", new Date(2024, 0, 1, 14, 0), new Date(2024, 0, 1, 15, 0)),
        createEvent("4", new Date(2024, 0, 1, 14, 30), new Date(2024, 0, 1, 15, 30)),
      ];

      const groups = detectConflictGroups(events);

      expect(groups[0].id).toBeDefined();
      expect(groups[1].id).toBeDefined();
      expect(groups[0].id).not.toBe(groups[1].id);
    });
  });

  describe("hasConflicts", () => {
    it("returns true if the event has conflicts", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 10, 30),
        new Date(2024, 0, 1, 11, 30)
      );
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        target,
      ];

      expect(hasConflicts(target, events)).toBe(true);
    });

    it("returns false if the event has no conflicts", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 12, 0),
        new Date(2024, 0, 1, 13, 0)
      );
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 0), new Date(2024, 0, 1, 11, 0)),
        target,
      ];

      expect(hasConflicts(target, events)).toBe(false);
    });

    it("does not include the event itself as a conflict", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 10, 0),
        new Date(2024, 0, 1, 11, 0)
      );
      const events: EyCalendarEvent[] = [target];

      expect(hasConflicts(target, events)).toBe(false);
    });

    it("correctly handles multiple conflicts", () => {
      const target = createEvent(
        "target",
        new Date(2024, 0, 1, 10, 0),
        new Date(2024, 0, 1, 13, 0)
      );
      const events: EyCalendarEvent[] = [
        createEvent("1", new Date(2024, 0, 1, 10, 30), new Date(2024, 0, 1, 11, 0)),
        createEvent("2", new Date(2024, 0, 1, 11, 30), new Date(2024, 0, 1, 12, 0)),
        createEvent("3", new Date(2024, 0, 1, 12, 30), new Date(2024, 0, 1, 13, 30)),
        target,
      ];

      expect(hasConflicts(target, events)).toBe(true);
    });
  });

  describe("Performance with a large number of events", () => {
    it("efficiently handles 100+ events", () => {
      const events: EyCalendarEvent[] = [];

      // Create 100 events with some conflicts
      for (let i = 0; i < 100; i++) {
        const start = new Date(2024, 0, 1, 8 + Math.floor(i / 10), (i % 10) * 5);
        const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes
        events.push(createEvent(`event-${i}`, start, end));
      }

      const startTime = performance.now();
      const groups = detectConflictGroups(events);
      const endTime = performance.now();

      // Doit se terminer en moins d'une seconde
      expect(endTime - startTime).toBeLessThan(1000);
      expect(groups).toBeDefined();
    });
  });
});
