import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EyCalendar } from "../../src/components/EyCalendar";

describe("Create interaction options", () => {
  it("does not trigger day slot creation when enableCreate is false", () => {
    const onTimeSlotClick = jest.fn();

    render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="day"
        enableCreate={false}
        onTimeSlotClick={onTimeSlotClick}
      />
    );

    const dayColumn = screen.getByTestId("day-column");
    Object.defineProperty(dayColumn, "getBoundingClientRect", {
      value: () => ({
        top: 0,
        left: 0,
        right: 200,
        bottom: 1536,
        width: 200,
        height: 1536,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.click(dayColumn, { clientX: 40, clientY: 120 });

    expect(onTimeSlotClick).not.toHaveBeenCalled();
  });

  it("does not trigger month cell creation when enableCreate is false", () => {
    const onTimeSlotClick = jest.fn();

    const { container } = render(
      <EyCalendar
        events={[]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="month"
        enableCreate={false}
        onTimeSlotClick={onTimeSlotClick}
      />
    );

    const monthCell = container.querySelector('[data-eycalendar-day-cell=""]');
    expect(monthCell).not.toBeNull();

    fireEvent.click(monthCell as Element, { clientX: 20, clientY: 20 });

    expect(onTimeSlotClick).not.toHaveBeenCalled();
  });
});
