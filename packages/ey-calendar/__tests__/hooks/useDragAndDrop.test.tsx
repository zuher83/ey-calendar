import { act, renderHook } from "@testing-library/react";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import { useEvents } from "../../src/context/EventsContext";
import { useDragAndDrop } from "../../src/hooks/useDragAndDrop";
import type { EyCalendarCallbacks } from "../../src/types";
import { createMockEvent } from "../setup/testUtils";

const draggableMock = jest.fn();
const dropTargetForElementsMock = jest.fn();

jest.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: (config: unknown) => draggableMock(config),
  dropTargetForElements: (config: unknown) => dropTargetForElementsMock(config),
}));

function makeRect(top: number, height: number, width: number = 200): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: width,
    width,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("useDragAndDrop", () => {
  beforeEach(() => {
    draggableMock.mockReset();
    dropTargetForElementsMock.mockReset();
    draggableMock.mockReturnValue(jest.fn());
    dropTargetForElementsMock.mockReturnValue(jest.fn());
  });

  it("does not register a draggable when drag and drop is disabled", () => {
    const event = createMockEvent({ id: "drag-disabled" });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[event]}
        initialDate={new Date(2024, 0, 15)}
        options={{ enableDragDrop: false }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const eventElement = document.createElement("div");

    act(() => {
      result.current.makeDraggable(eventElement, event);
    });

    expect(draggableMock).not.toHaveBeenCalled();
  });

  it("does not register a resize handle when resize is disabled", () => {
    const event = createMockEvent({ id: "resize-disabled" });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[event]}
        initialDate={new Date(2024, 0, 15)}
        options={{ enableResize: false }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const resizeHandle = document.createElement("div");

    act(() => {
      result.current.makeResizable(resizeHandle, event, "bottom");
    });

    expect(draggableMock).not.toHaveBeenCalled();
  });

  it("treats readonly calendar mode as non-interactive", () => {
    const event = createMockEvent({ id: "readonly-calendar" });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[event]}
        initialDate={new Date(2024, 0, 15)}
        options={{ readonly: true }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result } = renderHook(() => useDragAndDrop(), { wrapper });

    expect(result.current.canDragEvent(event)).toBe(false);

    act(() => {
      result.current.makeDraggable(document.createElement("div"), event);
      result.current.makeResizable(document.createElement("div"), event, "top");
    });

    expect(draggableMock).not.toHaveBeenCalled();
  });

  it("preserves the grabbed offset when drop target uses another hook instance", () => {
    const onEventDrop = jest.fn() as jest.MockedFunction<
      NonNullable<EyCalendarCallbacks["onEventDrop"]>
    >;
    const event = createMockEvent({
      id: "weekly-review",
      title: "Weekly Review",
      start: new Date(2024, 0, 15, 13, 30),
      end: new Date(2024, 0, 15, 14, 30),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[event]}
        initialDate={new Date(2024, 0, 15)}
        callbacks={{ onEventDrop }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result } = renderHook(
      () => ({
        draggableDnd: useDragAndDrop(),
        dropTargetDnd: useDragAndDrop(),
      }),
      { wrapper }
    );

    const dayColumn = document.createElement("div");
    dayColumn.setAttribute("data-drop-target", "true");
    dayColumn.setAttribute("data-testid", "day-column");
    dayColumn.getBoundingClientRect = () => makeRect(0, 24 * 64);

    const eventElement = document.createElement("div");
    eventElement.getBoundingClientRect = () => makeRect(13.5 * 64, 62);
    dayColumn.appendChild(eventElement);
    document.body.appendChild(dayColumn);

    try {
      act(() => {
        result.current.draggableDnd.makeDraggable(eventElement, event);
        result.current.dropTargetDnd.makeDropTarget(dayColumn, {
          targetDate: new Date(2024, 0, 15),
          viewMode: "week",
          cellHeight: 64,
        });
      });

      const draggableConfig = draggableMock.mock.calls[0][0] as {
        onDragStart: (args: { location: { initial: { input: { clientY: number } } } }) => void;
      };
      const dropTargetConfig = dropTargetForElementsMock.mock.calls[0][0] as {
        onDrop: (args: {
          source: {
            element: HTMLElement;
            data: {
              type: "calendar-event";
              eventId: string;
              event: typeof event;
            };
          };
          location: { current: { input: { clientY: number; clientX: number } } };
        }) => void;
      };

      act(() => {
        draggableConfig.onDragStart({
          location: {
            initial: {
              input: {
                clientY: 13.5 * 64 + 16,
              },
            },
          },
        });
      });

      act(() => {
        dropTargetConfig.onDrop({
          source: {
            element: eventElement,
            data: {
              type: "calendar-event",
              eventId: event.id,
              event,
            },
          },
          location: {
            current: {
              input: {
                clientY: 12.5 * 64,
                clientX: 100,
              },
            },
          },
        });
      });

      expect(onEventDrop).toHaveBeenCalledTimes(1);
      expect(onEventDrop.mock.calls[0]?.[1]?.dateStart.getHours()).toBe(12);
      expect(onEventDrop.mock.calls[0]?.[1]?.dateStart.getMinutes()).toBe(15);
    } finally {
      dayColumn.remove();
    }
  });

  it("provides a revert callback that restores optimistic drop updates", () => {
    const onEventUpdate = jest.fn() as jest.MockedFunction<
      NonNullable<EyCalendarCallbacks["onEventUpdate"]>
    >;
    const event = createMockEvent({
      id: "rollback-drop",
      title: "Rollback Drop",
      start: new Date(2024, 0, 15, 13, 30),
      end: new Date(2024, 0, 15, 14, 30),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[event]}
        initialDate={new Date(2024, 0, 15)}
        callbacks={{ onEventUpdate }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result } = renderHook(
      () => ({
        dnd: useDragAndDrop(),
        events: useEvents(),
      }),
      { wrapper }
    );

    const dayColumn = document.createElement("div");
    dayColumn.setAttribute("data-drop-target", "true");
    dayColumn.setAttribute("data-testid", "day-column");
    dayColumn.getBoundingClientRect = () => makeRect(0, 24 * 64);

    const eventElement = document.createElement("div");
    eventElement.getBoundingClientRect = () => makeRect(13.5 * 64, 62);
    dayColumn.appendChild(eventElement);
    document.body.appendChild(dayColumn);

    try {
      act(() => {
        result.current.dnd.makeDraggable(eventElement, event);
        result.current.dnd.makeDropTarget(dayColumn, {
          targetDate: new Date(2024, 0, 15),
          viewMode: "week",
          cellHeight: 64,
        });
      });

      const draggableConfig = draggableMock.mock.calls[0][0] as {
        onDragStart: (args: { location: { initial: { input: { clientY: number } } } }) => void;
      };
      const dropTargetConfig = dropTargetForElementsMock.mock.calls[0][0] as {
        onDrop: (args: {
          source: {
            element: HTMLElement;
            data: {
              type: "calendar-event";
              eventId: string;
              event: typeof event;
            };
          };
          location: { current: { input: { clientY: number; clientX: number } } };
        }) => void;
      };

      act(() => {
        draggableConfig.onDragStart({
          location: {
            initial: {
              input: {
                clientY: 13.5 * 64 + 16,
              },
            },
          },
        });
      });

      act(() => {
        dropTargetConfig.onDrop({
          source: {
            element: eventElement,
            data: {
              type: "calendar-event",
              eventId: event.id,
              event,
            },
          },
          location: {
            current: {
              input: {
                clientY: 12.5 * 64,
                clientX: 100,
              },
            },
          },
        });
      });

      expect(onEventUpdate).toHaveBeenCalledTimes(1);
      expect(result.current.events.state.events[0]?.start.getHours()).toBe(12);
      expect(result.current.events.state.events[0]?.start.getMinutes()).toBe(15);

      const revert = onEventUpdate.mock.calls[0]?.[2];

      expect(typeof revert).toBe("function");

      act(() => {
        revert?.();
      });

      expect(result.current.events.state.events[0]?.start.getHours()).toBe(13);
      expect(result.current.events.state.events[0]?.start.getMinutes()).toBe(30);
      expect(result.current.events.state.events[0]?.end.getHours()).toBe(14);
      expect(result.current.events.state.events[0]?.end.getMinutes()).toBe(30);
    } finally {
      dayColumn.remove();
    }
  });

  it("does not leak drag session state across calendar instances", () => {
    const onFirstCalendarDrop = jest.fn() as jest.MockedFunction<
      NonNullable<EyCalendarCallbacks["onEventDrop"]>
    >;
    const onSecondCalendarDrop = jest.fn() as jest.MockedFunction<
      NonNullable<EyCalendarCallbacks["onEventDrop"]>
    >;
    const firstEvent = createMockEvent({
      id: "calendar-a-event",
      title: "Calendar A Event",
      start: new Date(2024, 0, 15, 13, 30),
      end: new Date(2024, 0, 15, 14, 30),
    });

    const firstWrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[firstEvent]}
        initialDate={new Date(2024, 0, 15)}
        callbacks={{ onEventDrop: onFirstCalendarDrop }}
      >
        {children}
      </EyCalendarProvider>
    );

    const secondWrapper = ({ children }: { children: React.ReactNode }) => (
      <EyCalendarProvider
        initialEvents={[]}
        initialDate={new Date(2024, 0, 15)}
        callbacks={{ onEventDrop: onSecondCalendarDrop }}
      >
        {children}
      </EyCalendarProvider>
    );

    const { result: firstCalendarDnd } = renderHook(() => useDragAndDrop(), {
      wrapper: firstWrapper,
    });
    const { result: secondCalendarDnd } = renderHook(() => useDragAndDrop(), {
      wrapper: secondWrapper,
    });

    const firstDayColumn = document.createElement("div");
    firstDayColumn.setAttribute("data-drop-target", "true");
    firstDayColumn.setAttribute("data-testid", "day-column");
    firstDayColumn.getBoundingClientRect = () => makeRect(0, 24 * 64);

    const secondDayColumn = document.createElement("div");
    secondDayColumn.setAttribute("data-drop-target", "true");
    secondDayColumn.setAttribute("data-testid", "day-column");
    secondDayColumn.getBoundingClientRect = () => makeRect(0, 24 * 64);

    const firstEventElement = document.createElement("div");
    firstEventElement.getBoundingClientRect = () => makeRect(13.5 * 64, 62);
    firstDayColumn.appendChild(firstEventElement);
    document.body.appendChild(firstDayColumn);
    document.body.appendChild(secondDayColumn);

    try {
      act(() => {
        firstCalendarDnd.current.makeDraggable(firstEventElement, firstEvent);
        secondCalendarDnd.current.makeDropTarget(secondDayColumn, {
          targetDate: new Date(2024, 0, 15),
          viewMode: "week",
          cellHeight: 64,
        });
      });

      const draggableConfig = draggableMock.mock.calls[0][0] as {
        onDragStart: (args: { location: { initial: { input: { clientY: number } } } }) => void;
      };
      const dropTargetConfig = dropTargetForElementsMock.mock.calls[0][0] as {
        onDrop: (args: {
          source: {
            element: HTMLElement;
            data: {
              type: "calendar-event";
              eventId: string;
              event: typeof firstEvent;
            };
          };
          location: { current: { input: { clientY: number; clientX: number } } };
        }) => void;
      };

      act(() => {
        draggableConfig.onDragStart({
          location: {
            initial: {
              input: {
                clientY: 13.5 * 64 + 16,
              },
            },
          },
        });
      });

      act(() => {
        dropTargetConfig.onDrop({
          source: {
            element: firstEventElement,
            data: {
              type: "calendar-event",
              eventId: firstEvent.id,
              event: firstEvent,
            },
          },
          location: {
            current: {
              input: {
                clientY: 12.5 * 64,
                clientX: 100,
              },
            },
          },
        });
      });

      expect(onFirstCalendarDrop).not.toHaveBeenCalled();
      expect(onSecondCalendarDrop).toHaveBeenCalledTimes(1);
      expect(onSecondCalendarDrop.mock.calls[0]?.[1]?.dateStart.getHours()).toBe(12);
      expect(onSecondCalendarDrop.mock.calls[0]?.[1]?.dateStart.getMinutes()).toBe(30);
    } finally {
      firstDayColumn.remove();
      secondDayColumn.remove();
    }
  });
});
