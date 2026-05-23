import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EyCalendar } from "../../src/components/EyCalendar";

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

describe("Time slot double-click callbacks", () => {
  it("triggers the day slot double-click callback", () => {
    const onTimeSlotDoubleClick = jest.fn();

    render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="day"
        onTimeSlotDoubleClick={onTimeSlotDoubleClick}
      />
    );

    const dayColumn = screen.getByTestId("day-column");
    mockColumnRect(dayColumn);

    fireEvent.doubleClick(dayColumn, { clientX: 40, clientY: 120 });

    expect(onTimeSlotDoubleClick).toHaveBeenCalledTimes(1);
    expect(onTimeSlotDoubleClick.mock.calls[0]?.[0]).toBeInstanceOf(Date);
  });

  it("triggers the week slot double-click callback", () => {
    const onTimeSlotDoubleClick = jest.fn();

    render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="week"
        onTimeSlotDoubleClick={onTimeSlotDoubleClick}
      />
    );

    const dayColumn = screen.getAllByTestId("day-column")[0];
    expect(dayColumn).toBeDefined();
    mockColumnRect(dayColumn);

    fireEvent.doubleClick(dayColumn, { clientX: 40, clientY: 120 });

    expect(onTimeSlotDoubleClick).toHaveBeenCalledTimes(1);
    expect(onTimeSlotDoubleClick.mock.calls[0]?.[0]).toBeInstanceOf(Date);
  });

  it("triggers the month cell double-click callback", () => {
    const onTimeSlotDoubleClick = jest.fn();

    const { container } = render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="month"
        onTimeSlotDoubleClick={onTimeSlotDoubleClick}
      />
    );

    const monthCell = container.querySelector('[data-eycalendar-day-cell=""]');
    expect(monthCell).not.toBeNull();

    fireEvent.doubleClick(monthCell as Element, { clientX: 20, clientY: 20 });

    expect(onTimeSlotDoubleClick).toHaveBeenCalledTimes(1);
    expect(onTimeSlotDoubleClick.mock.calls[0]?.[0]).toBeInstanceOf(Date);
  });
});
