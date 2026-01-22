// Tests for CallbacksObserver
import React from "react";
import { render } from "@testing-library/react";
import { addDays } from "date-fns";
import { CallbacksObserver } from "../../src/context/CallbacksObserver";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import { useView } from "../../src/context/ViewContext";

describe("CallbacksObserver", () => {
  describe("onDateChange callback", () => {
    it("calls onDateChange when current date changes", () => {
      const onDateChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate } = useView();

        React.useEffect(() => {
          // Trigger date change after render
          setCurrentDate(addDays(initialDate, 1));
        }, [setCurrentDate]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      // Should be called with the new date
      expect(onDateChange).toHaveBeenCalledWith(addDays(initialDate, 1));
    });

    it("does not call onDateChange when date does not change", () => {
      const onDateChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange }}
        >
          <CallbacksObserver />
        </EyCalendarProvider>
      );

      // Should not be called during initial render
      expect(onDateChange).not.toHaveBeenCalled();
    });
  });

  describe("onViewChange callback", () => {
    it("calls onViewChange when view mode changes", () => {
      const onViewChange = jest.fn();

      const TestComponent = () => {
        const { setViewMode } = useView();

        React.useEffect(() => {
          // Trigger view change after render
          setViewMode("day");
        }, [setViewMode]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={new Date(2024, 0, 1)}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onViewChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      // Should be called with the new view mode
      expect(onViewChange).toHaveBeenCalledWith("day", expect.any(Date));
    });

    it("does not call onViewChange when view does not change", () => {
      const onViewChange = jest.fn();

      render(
        <EyCalendarProvider
          initialDate={new Date(2024, 0, 1)}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onViewChange }}
        >
          <CallbacksObserver />
        </EyCalendarProvider>
      );

      // Should not be called during initial render
      expect(onViewChange).not.toHaveBeenCalled();
    });
  });

  describe("onDateRangeChange callback", () => {
    it("calls onDateRangeChange when date range changes", () => {
      const onDateRangeChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate } = useView();

        React.useEffect(() => {
          // Trigger date change which will change date range
          setCurrentDate(addDays(initialDate, 7));
        }, [setCurrentDate]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateRangeChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      // Should be called with start and end dates
      expect(onDateRangeChange).toHaveBeenCalled();
      const callArg = onDateRangeChange.mock.calls[0][0];
      expect(callArg).toHaveProperty("start");
      expect(callArg).toHaveProperty("end");
      expect(callArg.start).toBeInstanceOf(Date);
      expect(callArg.end).toBeInstanceOf(Date);
      expect(callArg.end > callArg.start).toBe(true);
    });

    it("does not call onDateRangeChange when date range does not change", () => {
      const onDateRangeChange = jest.fn();

      render(
        <EyCalendarProvider
          initialDate={new Date(2024, 0, 1)}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateRangeChange }}
        >
          <CallbacksObserver />
        </EyCalendarProvider>
      );

      // Should not be called during initial render
      expect(onDateRangeChange).not.toHaveBeenCalled();
    });
  });

  describe("View mode specific date range changes", () => {
    it("triggers onDateRangeChange when switching from week to month view", () => {
      const onDateRangeChange = jest.fn();

      const TestComponent = () => {
        const { setViewMode } = useView();

        React.useEffect(() => {
          setViewMode("month");
        }, [setViewMode]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={new Date(2024, 0, 15)}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateRangeChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      expect(onDateRangeChange).toHaveBeenCalled();
    });

    it("triggers onDateRangeChange when switching from day to week view", () => {
      const onDateRangeChange = jest.fn();

      const TestComponent = () => {
        const { setViewMode } = useView();

        React.useEffect(() => {
          setViewMode("week");
        }, [setViewMode]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={new Date(2024, 0, 15)}
          initialView="day"
          initialEvents={[]}
          callbacks={{ onDateRangeChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      expect(onDateRangeChange).toHaveBeenCalled();
    });
  });

  describe("Multiple callbacks", () => {
    it("calls all relevant callbacks when both date and view change", () => {
      const onDateChange = jest.fn();
      const onViewChange = jest.fn();
      const onDateRangeChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate, setViewMode } = useView();

        React.useEffect(() => {
          setCurrentDate(addDays(initialDate, 1));
          setViewMode("day");
        }, [setCurrentDate, setViewMode]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{
            onDateChange,
            onViewChange,
            onDateRangeChange,
          }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      expect(onDateChange).toHaveBeenCalled();
      expect(onViewChange).toHaveBeenCalled();
      expect(onDateRangeChange).toHaveBeenCalled();
    });

    it("only calls provided callbacks", () => {
      const onDateChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate } = useView();

        React.useEffect(() => {
          setCurrentDate(addDays(initialDate, 1));
        }, [setCurrentDate]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      expect(onDateChange).toHaveBeenCalled();
    });
  });

  describe("Callback stability", () => {
    it("handles callback updates correctly", () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const { rerender } = render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange: firstCallback }}
        >
          <CallbacksObserver />
        </EyCalendarProvider>
      );

      // Re-render with new callback
      rerender(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange: secondCallback }}
        >
          <CallbacksObserver />
        </EyCalendarProvider>
      );

      // Neither should be called (no state change)
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("handles missing callbacks gracefully", () => {
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate } = useView();

        React.useEffect(() => {
          setCurrentDate(addDays(initialDate, 1));
        }, [setCurrentDate]);

        return null;
      };

      // Should not throw error when callbacks are not provided
      expect(() => {
        render(
          <EyCalendarProvider initialDate={initialDate} initialView="week" initialEvents={[]}>
            <CallbacksObserver />
            <TestComponent />
          </EyCalendarProvider>
        );
      }).not.toThrow();
    });

    it("handles rapid state changes", () => {
      const onDateChange = jest.fn();
      const initialDate = new Date(2024, 0, 1);

      const TestComponent = () => {
        const { setCurrentDate } = useView();

        React.useEffect(() => {
          // Trigger multiple rapid changes
          setCurrentDate(addDays(initialDate, 1));
          setCurrentDate(addDays(initialDate, 2));
          setCurrentDate(addDays(initialDate, 3));
        }, [setCurrentDate]);

        return null;
      };

      render(
        <EyCalendarProvider
          initialDate={initialDate}
          initialView="week"
          initialEvents={[]}
          callbacks={{ onDateChange }}
        >
          <CallbacksObserver />
          <TestComponent />
        </EyCalendarProvider>
      );

      // Should handle all changes
      expect(onDateChange).toHaveBeenCalled();
    });
  });
});
