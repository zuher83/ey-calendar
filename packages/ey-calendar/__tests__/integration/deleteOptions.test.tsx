import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyCalendar } from "../../src/components/EyCalendar";
import { createMockEvent } from "../setup/testUtils";

describe("Delete interaction options", () => {
  it("deletes a focused timed event by keyboard when enableDelete is enabled", async () => {
    const user = userEvent.setup();
    const onEventDelete = jest.fn();
    const event = createMockEvent({
      id: "day-event",
      title: "Daily Meeting",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
    });

    render(
      <EyCalendar
        events={[event]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="day"
        onEventDelete={onEventDelete}
      />
    );

    const eventElement = screen.getByText("Daily Meeting");
    const focusableParent = eventElement.closest("div[tabindex='0']") as HTMLElement | null;

    expect(focusableParent).not.toBeNull();
    focusableParent?.focus();

    await user.keyboard("{Delete}");

    await waitFor(() => {
      expect(onEventDelete).toHaveBeenCalledWith("day-event");
      expect(screen.queryByText("Daily Meeting")).not.toBeInTheDocument();
    });
  });

  it("does not delete a focused timed event when enableDelete is false", async () => {
    const user = userEvent.setup();
    const onEventDelete = jest.fn();
    const event = createMockEvent({
      id: "protected-day-event",
      title: "Protected Meeting",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
    });

    render(
      <EyCalendar
        events={[event]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="day"
        enableDelete={false}
        onEventDelete={onEventDelete}
      />
    );

    const eventElement = screen.getByText("Protected Meeting");
    const focusableParent = eventElement.closest("div[tabindex='0']") as HTMLElement | null;

    expect(focusableParent).not.toBeNull();
    focusableParent?.focus();

    await user.keyboard("{Delete}");

    expect(onEventDelete).not.toHaveBeenCalled();
    expect(screen.getByText("Protected Meeting")).toBeInTheDocument();
  });

  it("deletes a focused all-day week event by keyboard", async () => {
    const user = userEvent.setup();
    const onEventDelete = jest.fn();
    const event = createMockEvent({
      id: "week-all-day-event",
      title: "Week Offsite",
      start: new Date(2024, 0, 16, 0, 0),
      end: new Date(2024, 0, 18, 23, 59),
      isAllDay: true,
    });

    render(
      <EyCalendar
        events={[event]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="week"
        onEventDelete={onEventDelete}
      />
    );

    const eventElement = screen.getByText("Week Offsite");
    const focusableParent = eventElement.closest("div[tabindex='0']") as HTMLElement | null;

    expect(focusableParent).not.toBeNull();
    focusableParent?.focus();

    await user.keyboard("{Backspace}");

    await waitFor(() => {
      expect(onEventDelete).toHaveBeenCalledWith("week-all-day-event");
      expect(screen.queryByText("Week Offsite")).not.toBeInTheDocument();
    });
  });

  it("deletes a focused month event by keyboard", async () => {
    const user = userEvent.setup();
    const onEventDelete = jest.fn();
    const event = createMockEvent({
      id: "month-event",
      title: "Month Meeting",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
    });

    render(
      <EyCalendar
        events={[event]}
        defaultDate={new Date(2024, 0, 15)}
        defaultView="month"
        onEventDelete={onEventDelete}
      />
    );

    const eventElement = screen.getByText("Month Meeting");
    const focusableParent = eventElement.closest("div[tabindex='0']") as HTMLElement | null;

    expect(focusableParent).not.toBeNull();
    focusableParent?.focus();

    await user.keyboard("{Delete}");

    await waitFor(() => {
      expect(onEventDelete).toHaveBeenCalledWith("month-event");
      expect(screen.queryByText("Month Meeting")).not.toBeInTheDocument();
    });
  });

  it("deletes a focused planning event card by keyboard", async () => {
    const user = userEvent.setup();
    const onEventDelete = jest.fn();
    const today = new Date();
    const event = createMockEvent({
      id: "planning-event",
      title: "Planning Meeting",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
    });

    render(
      <EyCalendar
        events={[event]}
        defaultDate={today}
        defaultView="planning"
        onEventDelete={onEventDelete}
      />
    );

    const eventElement = screen.getByText("Planning Meeting");
    const focusableParent = eventElement.closest("div[tabindex='0']") as HTMLElement | null;

    expect(focusableParent).not.toBeNull();
    focusableParent?.focus();

    await user.keyboard("{Delete}");

    await waitFor(() => {
      expect(onEventDelete).toHaveBeenCalledWith("planning-event");
      expect(screen.queryByText("Planning Meeting")).not.toBeInTheDocument();
    });
  });
});
