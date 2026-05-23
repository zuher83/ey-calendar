import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EyCalendar } from "../../src/components/EyCalendar";
import type { TimeSlot } from "../../src/types";

function mockColumnRect(element: Element, height = 1536) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      top: 0,
      left: 0,
      right: 200,
      bottom: height,
      width: 200,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
}

describe("Event creation callbacks", () => {
  it("triggers onEventCreate with a timed slot and adds the returned event in day view", async () => {
    const onEventCreate = jest.fn((timeSlot: TimeSlot) => ({
      id: "created-day-event",
      title: "Created Day Event",
      start: timeSlot.start,
      end: timeSlot.end,
    }));

    render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="day"
        onEventCreate={onEventCreate}
      />
    );

    const dayColumn = screen.getByTestId("day-column");
    mockColumnRect(dayColumn);

    fireEvent.click(dayColumn, { clientX: 40, clientY: 120 });

    await waitFor(() => {
      expect(onEventCreate).toHaveBeenCalledTimes(1);
    });

    const createdSlot = onEventCreate.mock.calls[0]?.[0];
    expect(createdSlot.start).toEqual(new Date(2024, 0, 15, 1, 45, 0, 0));
    expect(createdSlot.end).toEqual(new Date(2024, 0, 15, 2, 45, 0, 0));
    expect(screen.getByText("Created Day Event")).toBeInTheDocument();
  });

  it("triggers onEventCreate with a timed slot and adds the returned event in week view", async () => {
    const onEventCreate = jest.fn((timeSlot: TimeSlot) => ({
      id: "created-week-event",
      title: "Created Week Event",
      start: timeSlot.start,
      end: timeSlot.end,
    }));

    render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="week"
        onEventCreate={onEventCreate}
      />
    );

    const dayColumn = screen.getAllByTestId("day-column")[0];
    mockColumnRect(dayColumn);

    fireEvent.click(dayColumn, { clientX: 40, clientY: 120 });

    await waitFor(() => {
      expect(onEventCreate).toHaveBeenCalledTimes(1);
    });

    const createdSlot = onEventCreate.mock.calls[0]?.[0];
    expect(createdSlot.start).toEqual(new Date(2024, 0, 15, 1, 45, 0, 0));
    expect(createdSlot.end).toEqual(new Date(2024, 0, 15, 2, 45, 0, 0));
    expect(screen.getByText("Created Week Event")).toBeInTheDocument();
  });

  it("triggers onEventCreate with a full-day slot and adds the returned event in month view", async () => {
    const onEventCreate = jest.fn((timeSlot: TimeSlot) => ({
      id: "created-month-event",
      title: "Created Month Event",
      start: timeSlot.start,
      end: timeSlot.end,
      isAllDay: true,
    }));

    const { container } = render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="month"
        onEventCreate={onEventCreate}
      />
    );

    const monthCell = container.querySelector('[data-eycalendar-day-cell=""]');
    expect(monthCell).not.toBeNull();

    fireEvent.click(monthCell as Element, { clientX: 20, clientY: 20 });

    await waitFor(() => {
      expect(onEventCreate).toHaveBeenCalledTimes(1);
    });

    const createdSlot = onEventCreate.mock.calls[0]?.[0];
    expect(createdSlot.start).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
    expect(createdSlot.end).toEqual(new Date(2024, 0, 1, 23, 59, 59, 999));
    expect(screen.getByText("Created Month Event")).toBeInTheDocument();
  });
});
