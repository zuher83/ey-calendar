import { act, renderHook } from "@testing-library/react";
import type { EyCalendarCallbacks } from "../../src/types";
import { EyCalendarProvider } from "../../src/context/CompositeEyCalendarContext";
import { useDragAndDrop } from "../../src/hooks/useDragAndDrop";
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
        onDragStart: (args: {
          location: { initial: { input: { clientY: number } } };
        }) => void;
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
});
