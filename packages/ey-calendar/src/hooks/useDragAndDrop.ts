// Hook for managing drag & drop with Pragmatic DnD
// Single drop path: all business logic lives in makeDropTarget.onDrop.
// makeDraggable.onDrop only resets UI state.

import { useCallback, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { useCallbacks } from "../context/CallbacksContext";
import { useDragDrop } from "../context/DragDropContext";
import { useEvents } from "../context/EventsContext";
import { useOptions } from "../context/OptionsContext";
import { useViewCellHeight } from "../context/ViewContext";
import type { EventPosition, EyCalendarEvent } from "../types";
import type { DragMovePayload, DropPayload } from "../types/dnd";
import {
  buildDropTarget,
  calculateTargetTime,
  computeMonthDrop,
  computeMonthDropTargetDate,
  computeWeekDayDrop,
} from "../utils/dragUtils";

function cloneEventFieldValue<T>(value: T): T {
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (Array.isArray(value)) {
    return [...value] as T;
  }

  if (value && typeof value === "object") {
    return { ...value } as T;
  }

  return value;
}

function assignRevertValue<K extends keyof EyCalendarEvent>(
  target: Partial<EyCalendarEvent>,
  event: EyCalendarEvent,
  key: K
) {
  target[key] = cloneEventFieldValue(event[key]);
}

function buildRevertUpdates(
  event: EyCalendarEvent,
  updates: Partial<EyCalendarEvent>
): Partial<EyCalendarEvent> {
  const revertUpdates: Partial<EyCalendarEvent> = {};

  for (const key of Object.keys(updates) as Array<keyof EyCalendarEvent>) {
    assignRevertValue(revertUpdates, event, key);
  }

  return revertUpdates;
}

function getMonthSegmentStartOffset(sourceElement: Element): number {
  if (!(sourceElement instanceof HTMLElement)) {
    return 0;
  }

  const segmentStartOffsetDays = Number(sourceElement.dataset.segmentStartOffsetDays ?? "0");

  return Number.isFinite(segmentStartOffsetDays) ? Math.max(0, segmentStartOffsetDays) : 0;
}

function getMonthDropTargetDate(
  baseTargetDate: Date,
  targetElement: Element,
  currentClientX?: number
): Date {
  if (!(targetElement instanceof HTMLElement) || currentClientX === undefined) {
    return new Date(baseTargetDate);
  }

  const segmentSpan = Number(targetElement.dataset.segmentSpan ?? "1");
  const rect = targetElement.getBoundingClientRect();

  return computeMonthDropTargetDate(
    baseTargetDate,
    segmentSpan,
    currentClientX - rect.left,
    rect.width
  );
}

/**
 * Hook for managing drag & drop of events
 */
export function useDragAndDrop() {
  const {
    setDragging,
    setDraggedEvent: setDraggedEventId,
    setTempEventPosition,
    sharedSessionRef,
    sharedOffsetsRef,
    resetSharedSession,
  } = useDragDrop();
  const { updateEvent } = useEvents();
  const { callbacks } = useCallbacks();
  const { options } = useOptions();
  const cellHeight = useViewCellHeight();

  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<EyCalendarEvent | null>(null);
  const [tempPosition, setTempPosition] = useState<EventPosition | null>(null);

  /** Reset all drag-related UI state */
  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDraggedEvent(null);
    setTempPosition(null);
    setDragging(false);
    setDraggedEventId(undefined);
    setTempEventPosition(undefined);
  }, [setDragging, setDraggedEventId, setTempEventPosition]);

  const createRevertHandler = useCallback(
    (event: EyCalendarEvent, updates: Partial<EyCalendarEvent>) => {
      const revertUpdates = buildRevertUpdates(event, updates);

      return () => {
        updateEvent(event.id, revertUpdates);
      };
    },
    [updateEvent]
  );

  /** Check if an event can be moved */
  const canDragEvent = useCallback(
    (event: EyCalendarEvent): boolean => {
      if (options.readonly === true || options.enableDragDrop === false) return false;
      if (event.custom?.readOnly) return false;
      if (event.isRecurring && !event.custom?.allowDragRecurring) return false;
      return true;
    },
    [options.enableDragDrop, options.readonly]
  );

  /** Check if an event can be resized */
  const canResizeEvent = useCallback(
    (event: EyCalendarEvent): boolean => {
      if (options.readonly === true || options.enableResize === false) return false;
      if (event.custom?.readOnly) return false;
      return true;
    },
    [options.enableResize, options.readonly]
  );

  /**
   * Configure an element as draggable.
   * Business logic is intentionally absent here — it lives in makeDropTarget.onDrop.
   */
  const makeDraggable = useCallback(
    (element: HTMLElement, event: EyCalendarEvent) => {
      if (!canDragEvent(event)) {
        return () => {};
      }

      return draggable({
        element,
        getInitialData: () =>
          ({
            type: "calendar-event",
            eventId: event.id,
            event,
          }) as unknown as Record<string, unknown>,
        onDragStart: ({ location }) => {
          let initialOffset = 0;

          if (location.initial.input.clientY) {
            const container =
              element.closest('[data-testid="day-column"]') ||
              element.closest('[data-drop-target="true"]') ||
              element.parentElement;

            if (container) {
              const containerRect = container.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const mouseY = location.initial.input.clientY;
              const eventTopInContainer = elementRect.top - containerRect.top;
              const mouseYInContainer = mouseY - containerRect.top;
              initialOffset = mouseYInContainer - eventTopInContainer;
            }
          }

          sharedSessionRef.current.eventId = event.id;
          sharedSessionRef.current.originalStart = new Date(event.start);
          sharedSessionRef.current.originalEnd = new Date(event.end);
          sharedSessionRef.current.initialMouseY = location.initial.input.clientY;
          sharedSessionRef.current.initialOffset = initialOffset;
          sharedSessionRef.current.isResizing = false;
          sharedSessionRef.current.resizeHandle = undefined;
          sharedOffsetsRef.current.set(event.id, initialOffset);

          setIsDragging(true);
          setDraggedEvent(event);
          setDragging(true);
          setDraggedEventId(event.id);
        },
        onDrag: ({ location }) => {
          const dragData = sharedSessionRef.current;
          if (!dragData || !location.current.input.clientY) return;
          if (location.current.dropTargets.length === 0) return;

          const dropTarget = location.current.dropTargets[0];
          const dropPayload = dropTarget.data as unknown as DropPayload;

          if (dropPayload.viewMode !== "month") {
            const containerRect = dropTarget.element.getBoundingClientRect();
            const { start: newStart, end: newEnd } = computeWeekDayDrop(
              event,
              dropPayload.targetDate,
              location.current.input.clientY,
              containerRect,
              dropPayload.cellHeight,
              dragData.initialOffset ?? 0
            );
            callbacks?.onEventDrag?.(event, newStart, newEnd, dropPayload.targetResourceId);
          }
        },
        onDrop: () => {
          resetDragState();
          setTimeout(() => {
            resetSharedSession();
          }, 200);
        },
      });
    },
    [
      callbacks,
      canDragEvent,
      resetDragState,
      resetSharedSession,
      setDragging,
      setDraggedEventId,
      sharedOffsetsRef,
      sharedSessionRef,
    ]
  );

  /**
   * Configure an element as a drop target.
   * This is the single authoritative place for all drop business logic.
   */
  const makeDropTarget = useCallback(
    (element: HTMLElement, data: DropPayload) => {
      return dropTargetForElements({
        element,
        getData: () => data as unknown as Record<string, unknown>,
        canDrop: ({ source }) => {
          const payload = source.data as unknown as Partial<DragMovePayload>;
          return payload.type === "calendar-event";
        },
        onDragEnter: () => {
          element.setAttribute("data-drop-active", "true");
        },
        onDragLeave: () => {
          element.removeAttribute("data-drop-active");
        },
        onDrop: ({ source, location }) => {
          element.removeAttribute("data-drop-active");

          const sourcePayload = source.data as unknown as DragMovePayload;
          const event = sourcePayload.event;
          if (!event) return;

          const dragData = sharedSessionRef.current;
          const initialOffset =
            sharedOffsetsRef.current.get(event.id) ?? dragData.initialOffset ?? 0;

          let updates: Partial<EyCalendarEvent>;

          if (data.viewMode === "month") {
            const monthSegmentStartOffset = getMonthSegmentStartOffset(source.element);
            const monthTargetDate = getMonthDropTargetDate(
              data.targetDate,
              element,
              location.current.input.clientX
            );
            const { start, end } = computeMonthDrop(
              event,
              monthTargetDate,
              monthSegmentStartOffset
            );
            updates = { start, end };

            if (data.targetResourceId && data.targetResourceId !== event.resourceId) {
              updates.resourceId = data.targetResourceId;
            }

            const dropResult = buildDropTarget(start, end, data.targetResourceId);
            const revert = createRevertHandler(event, updates);
            callbacks?.onEventDrop?.(event, dropResult);
            updateEvent(event.id, updates);
            callbacks?.onEventUpdate?.(event.id, updates, revert);
            return;
          }

          const mouseY = location.current.input.clientY;
          if (mouseY === undefined) return;

          const containerRect = element.getBoundingClientRect();
          const { start, end } = computeWeekDayDrop(
            event,
            data.targetDate,
            mouseY,
            containerRect,
            data.cellHeight,
            initialOffset
          );

          updates = { start, end };
          if (data.targetResourceId && data.targetResourceId !== event.resourceId) {
            updates.resourceId = data.targetResourceId;
          }

          const dropResult = buildDropTarget(start, end, data.targetResourceId);
          const revert = createRevertHandler(event, updates);
          callbacks?.onEventDrop?.(event, dropResult);
          updateEvent(event.id, updates);
          callbacks?.onEventUpdate?.(event.id, updates, revert);
        },
      });
    },
    [callbacks, createRevertHandler, sharedOffsetsRef, sharedSessionRef, updateEvent]
  );

  /**
   * Configures a resize handle element as draggable.
   */
  const makeResizable = useCallback(
    (
      element: HTMLElement,
      event: EyCalendarEvent,
      handle: "top" | "bottom",
      resizeCallbacks?: {
        onResizeStart?: (eventId: string, handle: "top" | "bottom") => void;
        onResize?: (
          eventId: string,
          newStart: Date,
          newEnd: Date,
          handle: "top" | "bottom"
        ) => void;
        onResizeEnd?: () => void;
      }
    ) => {
      if (!canResizeEvent(event)) {
        return () => {};
      }

      return draggable({
        element,
        getInitialData: () =>
          ({
            type: "calendar-event-resize",
            eventId: event.id,
            event,
            resizeHandle: handle,
          }) as unknown as Record<string, unknown>,
        onDragStart: ({ location }) => {
          sharedSessionRef.current.eventId = event.id;
          sharedSessionRef.current.originalStart = new Date(event.start);
          sharedSessionRef.current.originalEnd = new Date(event.end);
          sharedSessionRef.current.initialMouseY = location.initial.input.clientY;
          sharedSessionRef.current.initialOffset = 0;
          sharedSessionRef.current.isResizing = true;
          sharedSessionRef.current.resizeHandle = handle;

          setIsDragging(true);
          setDraggedEvent(event);
          setDragging(true);
          setDraggedEventId(event.id);
          resizeCallbacks?.onResizeStart?.(event.id, handle);
        },
        onDrag: ({ location }) => {
          const dragData = sharedSessionRef.current;
          if (!dragData.originalStart || !dragData.originalEnd || !location.current.input.clientY) {
            return;
          }

          const container = element.closest('[data-drop-target="true"]') || element.parentElement;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const effectiveCellHeight = cellHeight || 64;
          const targetTime = calculateTargetTime(
            location.current.input.clientY,
            containerRect,
            effectiveCellHeight,
            0
          );

          const targetDate = new Date(dragData.originalStart);
          targetDate.setHours(targetTime.hour, targetTime.minutes, 0, 0);

          let newStart = dragData.originalStart;
          let newEnd = dragData.originalEnd;

          if (handle === "top") {
            newStart = targetDate;
            if (newStart >= dragData.originalEnd) {
              newStart = new Date(dragData.originalEnd.getTime() - 15 * 60 * 1000);
            }
          } else {
            newEnd = targetDate;
            if (newEnd <= dragData.originalStart) {
              newEnd = new Date(dragData.originalStart.getTime() + 15 * 60 * 1000);
            }
          }

          resizeCallbacks?.onResize?.(event.id, newStart, newEnd, handle);
        },
        onDrop: ({ location }) => {
          const dragData = sharedSessionRef.current;
          if (!dragData.originalStart || !dragData.originalEnd || !location.current.input.clientY) {
            return;
          }

          const container = element.closest('[data-drop-target="true"]') || element.parentElement;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const effectiveCellHeight = cellHeight || 64;
          const targetTime = calculateTargetTime(
            location.current.input.clientY,
            containerRect,
            effectiveCellHeight,
            0
          );

          const targetDate = new Date(dragData.originalStart);
          targetDate.setHours(targetTime.hour, targetTime.minutes, 0, 0);

          let updates: Partial<EyCalendarEvent>;
          let finalStart = dragData.originalStart;
          let finalEnd = dragData.originalEnd;

          if (handle === "top") {
            let newStart = targetDate;
            if (newStart >= dragData.originalEnd) {
              newStart = new Date(dragData.originalEnd.getTime() - 15 * 60 * 1000);
            }
            updates = { start: newStart };
            finalStart = newStart;
          } else {
            let newEnd = targetDate;
            if (newEnd <= dragData.originalStart) {
              newEnd = new Date(dragData.originalStart.getTime() + 15 * 60 * 1000);
            }
            updates = { end: newEnd };
            finalEnd = newEnd;
          }

          callbacks?.onEventResize?.(event, finalStart, finalEnd);
          const revert = createRevertHandler(event, updates);
          updateEvent(event.id, updates);
          callbacks?.onEventUpdate?.(event.id, updates, revert);
          resizeCallbacks?.onResizeEnd?.();

          setDragging(false);
          setDraggedEventId(undefined);
          setTempEventPosition(undefined);
          resetSharedSession();
        },
      });
    },
    [
      callbacks,
      canResizeEvent,
      cellHeight,
      createRevertHandler,
      resetSharedSession,
      setDragging,
      setDraggedEventId,
      setTempEventPosition,
      sharedSessionRef,
      updateEvent,
    ]
  );

  /** Updates the temporary position during drag */
  const updateTempPosition = (position: EventPosition) => {
    setTempPosition(position);
    setTempEventPosition(position);
  };

  /** Cancels the current drag */
  const cancelDrag = useCallback(() => {
    resetSharedSession();
    resetDragState();
  }, [resetDragState, resetSharedSession]);

  /** Validate if a drop is allowed */
  const canDropEvent = (
    _event: EyCalendarEvent,
    targetDate: Date,
    _targetResourceId?: string
  ): boolean => {
    return !!targetDate;
  };

  return {
    // Drag & drop state
    isDragging,
    draggedEvent,
    tempPosition,

    // Utilities
    updateTempPosition,
    cancelDrag,
    canDragEvent,
    canDropEvent,

    // Direct configuration functions
    makeDraggable,
    makeDropTarget,
    makeResizable,
  };
}

export default useDragAndDrop;
