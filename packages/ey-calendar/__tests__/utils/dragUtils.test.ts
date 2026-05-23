// Tests for pure drag & drop utility functions
import {
  buildDropTarget,
  calculateTargetTime,
  computeMonthDrop,
  computeMonthDropTargetDate,
  computeWeekDayDrop,
} from "../../src/utils/dragUtils";
import type { EyCalendarEvent } from "../../src/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRect(top: number, height = 1000): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: 800,
    width: 800,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

function makeEvent(overrides?: Partial<EyCalendarEvent>): EyCalendarEvent {
  return {
    id: "ev1",
    title: "Test event",
    start: new Date("2024-06-10T09:00:00"),
    end: new Date("2024-06-10T10:00:00"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateTargetTime
// ---------------------------------------------------------------------------

describe("calculateTargetTime", () => {
  const cellHeight = 64; // 64px per hour

  it("snaps to quarter-hour by default", () => {
    // mouseY = 200, containerTop = 0 → mouseYInContainer = 200
    // no offset → eventStartY = 200
    // hourFloat = 200/64 = 3.125 → hour=3, minutesFraction=0.125 → rawMinutes=7.5
    // Math.round(7.5/15)*15 = Math.round(0.5)*15 = 1*15 = 15
    const result = calculateTargetTime(200, makeRect(0), cellHeight, 0);
    expect(result.hour).toBe(3);
    expect(result.minutes).toBe(15);
  });

  it("applies the initial offset so the event snaps to the grab point", () => {
    // Same mouse position but with 32px offset (half an hour's worth)
    // effectiveY = 200 - 32 = 168 → hourFloat = 168/64 = 2.625 → hour=2, rawMinutes=37.5 → 45
    const result = calculateTargetTime(200, makeRect(0), cellHeight, 32);
    expect(result.hour).toBe(2);
    expect(result.minutes).toBe(45);
  });

  it("clamps hour to [0, 23]", () => {
    const result = calculateTargetTime(999999, makeRect(0), cellHeight, 0);
    expect(result.hour).toBe(23);
  });

  it("clamps hour to 0 for negative positions", () => {
    const result = calculateTargetTime(-999, makeRect(0), cellHeight, 0);
    expect(result.hour).toBe(0);
  });

  it("respects containerRect.top offset", () => {
    // Container starts at y=100, mouseY=200 → mouseYInContainer=100
    // hourFloat = 100/64 ≈ 1.5625 → hour=1, rawMinutes=33.75 → 30
    const result = calculateTargetTime(200, makeRect(100), cellHeight, 0);
    expect(result.hour).toBe(1);
    expect(result.minutes).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// computeMonthDrop
// ---------------------------------------------------------------------------

describe("computeMonthDrop", () => {
  it("preserves original hours and minutes when moving to a new date", () => {
    const event = makeEvent({
      start: new Date("2024-06-10T14:30:00"),
      end: new Date("2024-06-10T16:00:00"),
    });
    const targetDate = new Date("2024-06-20");

    const { start, end } = computeMonthDrop(event, targetDate);

    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(5); // June
    expect(start.getDate()).toBe(20);
    expect(start.getHours()).toBe(14);
    expect(start.getMinutes()).toBe(30);

    expect(end.getHours()).toBe(16);
    expect(end.getMinutes()).toBe(0);
  });

  it("preserves multi-day span", () => {
    const event = makeEvent({
      start: new Date("2024-06-10T09:00:00"),
      end: new Date("2024-06-12T09:00:00"), // 48h, spanning June 10-12 inclusive
    });
    const targetDate = new Date("2024-07-01");

    const { start, end } = computeMonthDrop(event, targetDate);

    // Exact duration is preserved, so July 1 09:00 + 48h = July 3 09:00
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(3);
  });

  it("reanchors a multi-day event from the visible segment start when clipped", () => {
    const event = makeEvent({
      start: new Date("2026-04-28T00:00:00"),
      end: new Date("2026-04-29T23:59:00"),
    });
    const targetDate = new Date("2026-04-30T00:00:00");

    const { start, end } = computeMonthDrop(event, targetDate, 1);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(3);
    expect(start.getDate()).toBe(29);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getDate()).toBe(30);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it("single-day event: end stays on same target day", () => {
    const event = makeEvent({
      start: new Date("2024-06-10T08:00:00"),
      end: new Date("2024-06-10T09:00:00"),
    });
    const targetDate = new Date("2024-07-15");

    const { start, end } = computeMonthDrop(event, targetDate);

    expect(start.getDate()).toBe(15);
    expect(end.getDate()).toBe(15);
  });

  it("does not mutate the original event dates", () => {
    const start = new Date("2024-06-10T09:00:00");
    const end = new Date("2024-06-10T10:00:00");
    const event = makeEvent({ start, end });
    const targetDate = new Date("2024-07-01");

    computeMonthDrop(event, targetDate);

    expect(event.start).toEqual(start);
    expect(event.end).toEqual(end);
  });
});

describe("computeMonthDropTargetDate", () => {
  it("keeps the base date for single-day targets", () => {
    const baseDate = new Date("2026-05-14T00:00:00");

    const result = computeMonthDropTargetDate(baseDate, 1, 80, 200);

    expect(result.getDate()).toBe(14);
  });

  it("advances to the next day when hovering the second segment of a two-day bar", () => {
    const baseDate = new Date("2026-05-14T00:00:00");

    const result = computeMonthDropTargetDate(baseDate, 2, 150, 200);

    expect(result.getDate()).toBe(15);
  });

  it("clamps to the last visible day when hovering near the right edge", () => {
    const baseDate = new Date("2026-05-14T00:00:00");

    const result = computeMonthDropTargetDate(baseDate, 3, 999, 300);

    expect(result.getDate()).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// computeWeekDayDrop
// ---------------------------------------------------------------------------

describe("computeWeekDayDrop", () => {
  const cellHeight = 64;

  it("computes new start time from mouse position, preserving event duration", () => {
    const event = makeEvent({
      start: new Date("2024-06-10T09:00:00"),
      end: new Date("2024-06-10T10:30:00"), // 90 min
    });
    const baseDate = new Date("2024-06-12");
    const containerRect = makeRect(0);

    // mouseY = 640 → mouseYInContainer = 640 → hourFloat = 640/64 = 10 → 10:00
    const { start, end } = computeWeekDayDrop(event, baseDate, 640, containerRect, cellHeight, 0);

    expect(start.getHours()).toBe(10);
    expect(start.getMinutes()).toBe(0);

    // Duration preserved: +90 min
    const durationMs = end.getTime() - start.getTime();
    expect(durationMs).toBe(90 * 60 * 1000);
  });

  it("applies target date for the new start", () => {
    const event = makeEvent();
    const baseDate = new Date("2024-06-15");
    const containerRect = makeRect(0);

    const { start } = computeWeekDayDrop(event, baseDate, 0, containerRect, cellHeight, 0);

    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(5); // June
    expect(start.getDate()).toBe(15);
  });

  it("accounts for initial offset", () => {
    const event = makeEvent();
    const baseDate = new Date("2024-06-10");
    const containerRect = makeRect(0);

    // Without offset: 320/64 = 5h → 5:00
    const withoutOffset = computeWeekDayDrop(event, baseDate, 320, containerRect, cellHeight, 0);
    // With 64px offset (1 hour): effectiveY = 320 - 64 = 256 → 4:00
    const withOffset = computeWeekDayDrop(event, baseDate, 320, containerRect, cellHeight, 64);

    expect(withoutOffset.start.getHours()).toBe(5);
    expect(withOffset.start.getHours()).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// buildDropTarget
// ---------------------------------------------------------------------------

describe("buildDropTarget", () => {
  it("returns a timeslot type when no resourceId", () => {
    const start = new Date("2024-06-10T09:00:00");
    const end = new Date("2024-06-10T10:00:00");

    const result = buildDropTarget(start, end);

    expect(result.type).toBe("timeslot");
    expect(result.dateStart).toBe(start);
    expect(result.dateEnd).toBe(end);
    expect(result.resourceId).toBeUndefined();
    expect(result.isValid).toBe(true);
    expect(result.id).toMatch(/^drop-/);
  });

  it("returns a resource type when resourceId is provided", () => {
    const start = new Date("2024-06-10T09:00:00");
    const end = new Date("2024-06-10T10:00:00");

    const result = buildDropTarget(start, end, "room-1");

    expect(result.type).toBe("resource");
    expect(result.resourceId).toBe("room-1");
  });
});
