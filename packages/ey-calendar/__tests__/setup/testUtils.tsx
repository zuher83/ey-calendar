// Test utilities and helper functions
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import type { EyCalendarEvent, EyCalendarOptions } from "../../src/types";

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Create a test event
 */
export function createMockEvent(overrides?: Partial<EyCalendarEvent>): EyCalendarEvent {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0);

  return {
    id: `event-${Math.random().toString(36).substr(2, 9)}`,
    title: "Test Event",
    start,
    end,
    isAllDay: false,
    ...overrides,
  };
}

/**
 * Creates multiple test events
 */
export function createMockEvents(count: number): EyCalendarEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(2024, 0, 1, 10 + i, 0);
    const end = new Date(2024, 0, 1, 11 + i, 0);

    return createMockEvent({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      start,
      end,
    });
  });
}

// ============================================================================
// CUSTOM RENDER
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEvents?: EyCalendarEvent[];
  initialDate?: Date;
  initialView?: "day" | "week" | "month" | "planning";
  options?: Partial<EyCalendarOptions>;
}

/**
 * Custom wrapper for testing with EyCalendarProvider
 */
export function renderWithProvider(
  ui: ReactElement,
  {
    initialEvents = [],
    initialDate = new Date(),
    initialView = "week",
    options = {},
    ...renderOptions
  }: CustomRenderOptions = {}
): ReturnType<typeof render> {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <EyCalendarProvider
      initialEvents={initialEvents}
      initialDate={initialDate}
      initialView={initialView}
      options={options}
    >
      {children}
    </EyCalendarProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
export { renderWithProvider as render };
