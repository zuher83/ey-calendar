// Tests for DragDropContext
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { DragDropProvider, useDragDrop } from "../../src/context/DragDropContext";
import type { EventPosition } from "../../src/types";

describe("DragDropContext", () => {
  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <DragDropProvider>{children}</DragDropProvider>
    );
    Wrapper.displayName = "DragDropTestWrapper";
    return Wrapper;
  };

  describe("Provider initialization", () => {
    it("initializes with default state", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.isDragging).toBe(false);
      expect(result.current.state.isResizing).toBe(false);
      expect(result.current.state.draggedEventId).toBeUndefined();
      expect(result.current.state.tempEventPosition).toBeUndefined();
      expect(result.current.state.resizeHandle).toBeUndefined();
      expect(result.current.state.hoveredEventId).toBeUndefined();
    });
  });

  describe("Dragging state", () => {
    it("sets dragging state", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setDragging(true);
      });

      expect(result.current.state.isDragging).toBe(true);
    });

    it("clears dragging state", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setDragging(true);
      });

      act(() => {
        result.current.setDragging(false);
      });

      expect(result.current.state.isDragging).toBe(false);
    });

    it("sets dragged event ID", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setDraggedEvent("event-123");
      });

      expect(result.current.state.draggedEventId).toBe("event-123");
    });

    it("clears dragged event ID", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setDraggedEvent("event-123");
      });

      act(() => {
        result.current.setDraggedEvent(undefined);
      });

      expect(result.current.state.draggedEventId).toBeUndefined();
    });
  });

  describe("Temporary event position", () => {
    it("sets temporary event position", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      const position: EventPosition = {
        x: 50,
        y: 0,
        width: 100,
        height: 60,
      };

      act(() => {
        result.current.setTempEventPosition(position);
      });

      expect(result.current.state.tempEventPosition).toEqual(position);
    });

    it("clears temporary event position", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      const position: EventPosition = {
        x: 50,
        y: 0,
        width: 100,
        height: 60,
      };

      act(() => {
        result.current.setTempEventPosition(position);
      });

      act(() => {
        result.current.setTempEventPosition(undefined);
      });

      expect(result.current.state.tempEventPosition).toBeUndefined();
    });
  });

  describe("Resizing state", () => {
    it("sets resizing state", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setResizing(true);
      });

      expect(result.current.state.isResizing).toBe(true);
    });

    it("clears resizing state", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setResizing(true);
      });

      act(() => {
        result.current.setResizing(false);
      });

      expect(result.current.state.isResizing).toBe(false);
    });

    it("sets resize handle", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setResizeHandle("top");
      });

      expect(result.current.state.resizeHandle).toBe("top");
    });

    it("changes resize handle", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setResizeHandle("top");
      });

      act(() => {
        result.current.setResizeHandle("bottom");
      });

      expect(result.current.state.resizeHandle).toBe("bottom");
    });

    it("clears resize handle", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setResizeHandle("top");
      });

      act(() => {
        result.current.setResizeHandle(undefined);
      });

      expect(result.current.state.resizeHandle).toBeUndefined();
    });
  });

  describe("Hovered event", () => {
    it("sets hovered event ID", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setHoveredEvent("event-456");
      });

      expect(result.current.state.hoveredEventId).toBe("event-456");
    });

    it("changes hovered event", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setHoveredEvent("event-1");
      });

      act(() => {
        result.current.setHoveredEvent("event-2");
      });

      expect(result.current.state.hoveredEventId).toBe("event-2");
    });

    it("clears hovered event", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setHoveredEvent("event-456");
      });

      act(() => {
        result.current.setHoveredEvent(undefined);
      });

      expect(result.current.state.hoveredEventId).toBeUndefined();
    });
  });

  describe("resetDragState", () => {
    it("resets all drag state to initial values", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      // Set various states
      act(() => {
        result.current.setDragging(true);
        result.current.setDraggedEvent("event-123");
        result.current.setTempEventPosition({
          x: 50,
          y: 0,
          width: 100,
          height: 60,
        });
        result.current.setResizing(true);
        result.current.setResizeHandle("top");
        result.current.setHoveredEvent("event-456");
      });

      // Verify states are set
      expect(result.current.state.isDragging).toBe(true);
      expect(result.current.state.draggedEventId).toBe("event-123");
      expect(result.current.state.tempEventPosition).toBeDefined();
      expect(result.current.state.isResizing).toBe(true);
      expect(result.current.state.resizeHandle).toBe("top");
      expect(result.current.state.hoveredEventId).toBe("event-456");

      // Reset everything
      act(() => {
        result.current.resetDragState();
      });

      // Verify all states are reset
      expect(result.current.state.isDragging).toBe(false);
      expect(result.current.state.draggedEventId).toBeUndefined();
      expect(result.current.state.tempEventPosition).toBeUndefined();
      expect(result.current.state.isResizing).toBe(false);
      expect(result.current.state.resizeHandle).toBeUndefined();
      expect(result.current.state.hoveredEventId).toBeUndefined();
    });
  });

  describe("Combined drag operations", () => {
    it("handles complete drag operation", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      // Start drag
      act(() => {
        result.current.setDragging(true);
        result.current.setDraggedEvent("event-1");
      });

      expect(result.current.state.isDragging).toBe(true);
      expect(result.current.state.draggedEventId).toBe("event-1");

      // Update position while dragging
      act(() => {
        result.current.setTempEventPosition({
          x: 100,
          y: 0,
          width: 150,
          height: 80,
        });
      });

      expect(result.current.state.tempEventPosition).toBeDefined();

      // End drag
      act(() => {
        result.current.resetDragState();
      });

      expect(result.current.state.isDragging).toBe(false);
      expect(result.current.state.draggedEventId).toBeUndefined();
      expect(result.current.state.tempEventPosition).toBeUndefined();
    });

    it("handles complete resize operation", () => {
      const { result } = renderHook(() => useDragDrop(), {
        wrapper: createWrapper(),
      });

      // Start resize
      act(() => {
        result.current.setResizing(true);
        result.current.setResizeHandle("bottom");
        result.current.setDraggedEvent("event-2");
      });

      expect(result.current.state.isResizing).toBe(true);
      expect(result.current.state.resizeHandle).toBe("bottom");
      expect(result.current.state.draggedEventId).toBe("event-2");

      // End resize
      act(() => {
        result.current.resetDragState();
      });

      expect(result.current.state.isResizing).toBe(false);
      expect(result.current.state.resizeHandle).toBeUndefined();
    });
  });

  describe("Error handling", () => {
    it("throws error when used outside provider", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useDragDrop());
      }).toThrow("useDragDrop must be used within a DragDropProvider");

      consoleSpy.mockRestore();
    });
  });
});
