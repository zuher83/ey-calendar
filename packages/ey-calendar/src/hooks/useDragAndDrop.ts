// Hook pour la gestion du drag & drop avec Pragmatic DnD
// src/components/ey-calendar/hooks/useDragAndDrop.ts

import { useCallback, useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DEFAULT_TIME_SLOT_CONFIG } from "../constants";
import { useCallbacks } from "../context/CallbacksContext";
import { useDragDrop } from "../context/DragDropContext";
import { useEvents } from "../context/EventsContext";
import { useView } from "../context/ViewContext";
import type { EventPosition, EyCalendarEvent } from "../types";

/**
 * Calculates the target time based on the Y position of the mouse * CORRECTED LOGIC: Applies the offset to calculate where the event should start
 */
function calculateTargetTime(
  mouseY: number,
  containerRect: DOMRect,
  cellHeight: number,
  initialOffset: number = 0
): { hour: number; minutes: number } {
  // Calculate the Y position of the start of the event (as in Gantt)
  // eventStartY = mouseY - offset (position where the event should start)
  const mouseYInContainer = mouseY - containerRect.top;
  const eventStartYInContainer = mouseYInContainer - initialOffset;

  // Unified calculation: 1 hour = cellHeight pixels
  const hourFloat = eventStartYInContainer / cellHeight;
  const hour = Math.floor(hourFloat);
  const minutesFraction = hourFloat - hour;

  // Snap according to the configured granularity
  const granularity = DEFAULT_TIME_SLOT_CONFIG.granularity;
  const rawMinutes = minutesFraction * 60;

  let snapMinutes: number;
  if (granularity === "hour") {
    snapMinutes = 0; // Snap to the whole hour
  } else if (granularity === "half-hour") {
    snapMinutes = Math.round(rawMinutes / 30) * 30; // Snap to 0 or 30 minutes
  } else {
    // quarter-hour
    snapMinutes = Math.round(rawMinutes / 15) * 15; // Snap to 0, 15, 30, 45 minutes
  }

  let finalHour = hour;
  let finalMinutes = snapMinutes;

  // Correction for minutes >= 60 (roll over to the next hour)
  if (finalMinutes >= 60) {
    finalHour += 1;
    finalMinutes = 0;
  }

  // Strictly constrain within the 0-24h grid
  return {
    hour: Math.max(0, Math.min(23, finalHour)),
    minutes: Math.max(0, Math.min(59, finalMinutes)),
  };
}

/**
 * Interface for drag data
 */
interface DragEventData extends Record<string, unknown> {
  type: string;
  eventId: string;
  event: EyCalendarEvent;
  originalPosition?: EventPosition;
}

/**
 * Interface for resize data
 */
interface DropEventData extends Record<string, unknown> {
  eventId?: string;
  targetDate?: Date;
  targetResourceId?: string;
  targetTimeSlot?: string;
  viewMode?: "week" | "day" | "month";
  cellHeight?: number;
}

/**
 * Hook for managing drag & drop of events
 */
export function useDragAndDrop() {
  const {
    state: _dragState,
    setDragging,
    setDraggedEvent: setDraggedEventId,
    setTempEventPosition,
  } = useDragDrop();
  const { state: eventsState, updateEvent } = useEvents();
  const { state: viewState } = useView();
  const { callbacks } = useCallbacks();

  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<EyCalendarEvent | null>(null);
  const [tempPosition, setTempPosition] = useState<EventPosition | null>(null);
  // resizeOverlay is now in the CalendarContext

  // Store initial drag data
  const dragInitialData = useRef<{
    eventId?: string;
    originalStart?: Date;
    originalEnd?: Date;
    initialMouseY?: number;
    initialOffset?: number;
    isResizing?: boolean;
    resizeHandle?: "top" | "bottom";
  }>({});

  // Map to store offsets by eventId
  const dragOffsets = useRef<Map<string, number>>(new Map());

  // Flag to avoid double drops
  const dropProcessed = useRef<Set<string>>(new Set());
  // Immediate flag for the current drop
  const currentDropEventId = useRef<string | null>(null);

  /**
   * Configure an element as draggable
   */
  const makeDraggable = (element: HTMLElement, event: EyCalendarEvent) => {
    return draggable({
      element,
      getInitialData: () =>
        ({
          type: "calendar-event",
          eventId: event.id,
          event,
          originalPosition: eventsState.eventPositions.get(event.id),
        }) as DragEventData,
      onDragStart: ({ location }) => {
        // Calculate the initial offset between the mouse and the top of the event (simplified like Gantt)
        let initialOffset = 0;

        if (location.initial.input.clientY) {
          // Find the container for the reference
          const container =
            element.closest('[data-testid="day-column"]') ||
            element.closest('[data-drop-target="true"]') ||
            element.parentElement;

          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const mouseY = location.initial.input.clientY;

            // Offset = distance between the mouse and the top of the event (relative to the container)
            const eventTopInContainer = elementRect.top - containerRect.top;
            const mouseYInContainer = mouseY - containerRect.top;
            initialOffset = mouseYInContainer - eventTopInContainer;
          }
        }

        // Store initial drag data
        dragInitialData.current = {
          eventId: event.id,
          originalStart: new Date(event.start),
          originalEnd: new Date(event.end),
          initialMouseY: location.initial.input.clientY,
          initialOffset,
          isResizing: false,
        };

        // Store the offset in the separate Map
        dragOffsets.current.set(event.id, initialOffset);
        setIsDragging(true);
        setDraggedEvent(event);
        setDragging(true);
        setDraggedEventId(event.id);
      },
      onDrag: ({ location }) => {
        const dragData = dragInitialData.current;
        if (!dragData || !location.current.input.clientY) return;

        // Handle drag with offset
        if (location.current.dropTargets.length > 0) {
          const dropTarget = location.current.dropTargets[0];
          const dropData = dropTarget.data as DropEventData;

          if (dropData.viewMode && dropData.cellHeight) {
            const containerElement = dropTarget.element;
            const containerRect = containerElement.getBoundingClientRect();
            const targetTime = calculateTargetTime(
              location.current.input.clientY,
              containerRect,
              dropData.cellHeight,
              dragData.initialOffset || 0
            );

            // Calculate the new date with the calculated time
            const baseDate = dropData.targetDate || event.start;
            const newStart = new Date(baseDate);
            newStart.setHours(targetTime.hour, targetTime.minutes, 0, 0);

            const duration = event.end.getTime() - event.start.getTime();
            const newEnd = new Date(newStart.getTime() + duration);

            // Callback de preview pendant le drag
            callbacks?.onEventDrag?.(event, newStart, newEnd, dropData.targetResourceId);
          }
        }
      },
      onDrop: ({ location }) => {
        setIsDragging(false);
        setDraggedEvent(null);
        setTempPosition(null);

        // Handle drop
        if (location.current.dropTargets.length > 0) {
          const dropTarget = location.current.dropTargets[0];
          const dropData = dropTarget.data as DropEventData;

          // Special handling for Month view - preserve original hours
          if (dropData.viewMode === "month" && dropData.targetDate) {
            // Immediately mark this drop as in progress to avoid double processing
            currentDropEventId.current = event.id;
            dropProcessed.current.add(event.id);

            const originalStart = new Date(event.start);
            const originalEnd = new Date(event.end);
            const targetDate = new Date(dropData.targetDate);

            // Create new dates while keeping the original times
            const newStart = new Date(targetDate);
            newStart.setHours(
              originalStart.getHours(),
              originalStart.getMinutes(),
              originalStart.getSeconds(),
              originalStart.getMilliseconds()
            );

            const newEnd = new Date(targetDate);
            newEnd.setHours(
              originalEnd.getHours(),
              originalEnd.getMinutes(),
              originalEnd.getSeconds(),
              originalEnd.getMilliseconds()
            );

            // If the event spans multiple days, adjust the end date
            const originalDurationDays = Math.ceil(
              (originalEnd.getTime() - originalStart.getTime()) / (24 * 60 * 60 * 1000)
            );
            if (originalDurationDays > 1) {
              newEnd.setDate(newStart.getDate() + originalDurationDays - 1);
            }

            const updates: Partial<EyCalendarEvent> = {
              start: newStart,
              end: newEnd,
            };

            if (dropData.targetResourceId && dropData.targetResourceId !== event.resourceId) {
              updates.resourceId = dropData.targetResourceId;
            }

            // Callback onEventDrop with DropTarget data
            const dropTargetData = {
              id: `drop-${Date.now()}`,
              type: dropData.targetResourceId ? "resource" : "timeslot",
              dateStart: newStart,
              dateEnd: newEnd,
              resourceId: dropData.targetResourceId,
              bounds: new DOMRect(),
              isValid: true,
            } as const;

            callbacks?.onEventDrop?.(event, dropTargetData as any);
            updateEvent(event.id, updates);
            callbacks?.onEventUpdate?.(event.id, updates);
          } else if (
            location.current.input.clientY !== undefined &&
            dropData.viewMode &&
            dropData.cellHeight
          ) {
            // Handling for Week/Day views - recalculate time based on Y position
            const dragData = dragInitialData.current;

            // Immediately mark this drop as in progress to avoid double processing
            currentDropEventId.current = event.id;
            dropProcessed.current.add(event.id);

            // Find the drop target element (the element may not be in dropTarget.element)
            const container =
              element.closest('[data-drop-target="true"]') ||
              element.closest(".week-day-column") ||
              element.closest(".day-view-container") ||
              element.parentElement;

            if (!container) {
              console.warn("[useDragAndDrop] Could not find drop target container");

              return;
            }

            const containerRect = container.getBoundingClientRect();
            const targetTime = calculateTargetTime(
              location.current.input.clientY,
              containerRect,
              dropData.cellHeight,
              dragData.initialOffset || 0
            );

            // Calculate the new date with the calculated time
            const baseDate = dropData.targetDate || event.start;
            const newStart = new Date(baseDate);
            newStart.setHours(targetTime.hour, targetTime.minutes, 0, 0);

            const duration = event.end.getTime() - event.start.getTime();
            const newEnd = new Date(newStart.getTime() + duration);

            // Immediately mark this drop as processed BEFORE doing calculations to avoid double processing
            dropProcessed.current.add(event.id);
            // Update the event with the new position
            const updates: Partial<EyCalendarEvent> = {
              start: newStart,
              end: newEnd,
            };

            if (dropData.targetResourceId && dropData.targetResourceId !== event.resourceId) {
              updates.resourceId = dropData.targetResourceId;
            }

            // Callback onEventDrop with DropTarget data
            const dropTarget = {
              id: `drop-${Date.now()}`,
              type: dropData.targetResourceId ? "resource" : "timeslot",
              dateStart: newStart,
              dateEnd: newEnd,
              resourceId: dropData.targetResourceId,
              bounds: new DOMRect(),
              isValid: true,
            } as const;

            callbacks?.onEventDrop?.(event, dropTarget as any);
            updateEvent(event.id, updates);
            callbacks?.onEventUpdate?.(event.id, updates);
          } else {
            // Fallback pour les anciens drop data
            handleEventDrop(event, dropData);
          }
        }

        // Reset state - BUT not dragInitialData because makeDropTarget needs it
        setDragging(false);
        setDraggedEventId(undefined);
        setTempEventPosition(undefined);

        // Clear drag data AFTER a longer delay to give makeDropTarget time to use it
        setTimeout(() => {
          dragInitialData.current = {};
          dragOffsets.current.clear(); // Also clear the Map
          dropProcessed.current.clear(); // Also clear the processed drops
          currentDropEventId.current = null; // Immediately reset the flag
        }, 200);
      },
    });
  };

  /**
   * Configure an element as a drop target
   */
  const makeDropTarget = (element: HTMLElement, data: Partial<DropEventData>) => {
    return dropTargetForElements({
      element,
      getData: () => data,
      canDrop: ({ source }) => {
        const sourceData = source.data as unknown as DragEventData;

        return sourceData.type === "calendar-event";
      },
      onDragEnter: () => {
        element.classList.add("drop-target-active");
      },
      onDragLeave: () => {
        element.classList.remove("drop-target-active");
      },
      onDrop: ({ source, location }) => {
        element.classList.remove("drop-target-active");

        // Calculate the drop position based on the mouse
        const sourceData = source.data as unknown as DragEventData;
        const event = sourceData.event;

        // NEW: If the drop data contains viewMode and cellHeight,
        // it means the drop was handled by the new system (draggable.onDrop)
        // In this case, do nothing here to avoid double processing
        if (data.viewMode && data.cellHeight) {
          return;
        }

        // Check if this drop has already been processed by the first system (old safety system)
        if (dropProcessed.current.has(event.id) || currentDropEventId.current === event.id) {
          return;
        }

        // NEW: Special handling for the Month view - only change the date
        if (data.viewMode === "month" && data.targetDate) {
          const originalStart = new Date(event.start);
          const originalEnd = new Date(event.end);
          const targetDate = new Date(data.targetDate);

          // Create new dates preserving the original hours
          const newStart = new Date(targetDate);
          newStart.setHours(
            originalStart.getHours(),
            originalStart.getMinutes(),
            originalStart.getSeconds(),
            originalStart.getMilliseconds()
          );

          const newEnd = new Date(targetDate);
          newEnd.setHours(
            originalEnd.getHours(),
            originalEnd.getMinutes(),
            originalEnd.getSeconds(),
            originalEnd.getMilliseconds()
          );

          // If the event spans multiple days, adjust the end date
          const originalDurationDays = Math.ceil(
            (originalEnd.getTime() - originalStart.getTime()) / (24 * 60 * 60 * 1000)
          );
          if (originalDurationDays > 1) {
            newEnd.setDate(newStart.getDate() + originalDurationDays - 1);
          }

          const updates: Partial<EyCalendarEvent> = {
            start: newStart,
            end: newEnd,
          };

          if (data.targetResourceId && data.targetResourceId !== event.resourceId) {
            updates.resourceId = data.targetResourceId;
          }

          // Callbacks
          callbacks?.onEventDrag?.(event, newStart, newEnd, data.targetResourceId);
          updateEvent(event.id, updates);
          callbacks?.onEventUpdate?.(event.id, updates);

          return;
        }

        if (location.current.input.clientY !== undefined && data.viewMode && data.cellHeight) {
          const containerRect = element.getBoundingClientRect();

          // Retrieve the offset from the Map or use 0 by default
          const dragData = dragInitialData.current;
          const storedOffset = dragOffsets.current.get(event.id);
          const initialOffset = storedOffset || dragData?.initialOffset || 0;

          const targetTime = calculateTargetTime(
            location.current.input.clientY,
            containerRect,
            data.cellHeight,
            initialOffset // Use the calculated offset
          );

          // Calculate the new date with the calculated time
          const baseDate = data.targetDate || event.start;
          const newStart = new Date(baseDate);
          newStart.setHours(targetTime.hour, targetTime.minutes, 0, 0);

          const duration = event.end.getTime() - event.start.getTime();
          const newEnd = new Date(newStart.getTime() + duration);

          // Update the event with the new position
          const updates: Partial<EyCalendarEvent> = {
            start: newStart,
            end: newEnd,
          };

          if (data.targetResourceId && data.targetResourceId !== event.resourceId) {
            updates.resourceId = data.targetResourceId;
          }

          // Callbacks
          callbacks?.onEventDrag?.(event, newStart, newEnd, data.targetResourceId);
          updateEvent(event.id, updates);
          callbacks?.onEventUpdate?.(event.id, updates);
        }
      },
    });
  };

  /**
   * Handles the drop of an event
   */
  const handleEventDrop = (event: EyCalendarEvent, dropData: DropEventData) => {
    const newStart = dropData.targetDate || event.start;
    const duration = event.end.getTime() - event.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    // Calculate the new dates
    const updates: Partial<EyCalendarEvent> = {
      start: newStart,
      end: newEnd,
    };

    // Change resource if necessary
    if (dropData.targetResourceId && dropData.targetResourceId !== event.resourceId) {
      updates.resourceId = dropData.targetResourceId;
    }

    // Callback onEventDrop with DropTarget data
    const dropTarget = {
      id: `drop-${Date.now()}`,
      type: dropData.targetResourceId ? "resource" : "timeslot",
      dateStart: newStart,
      dateEnd: newEnd,
      resourceId: dropData.targetResourceId,
      bounds: new DOMRect(),
      isValid: true,
    } as const;

    callbacks?.onEventDrop?.(event, dropTarget as any);

    // Update the event
    updateEvent(event.id, updates);

    // Update callback
    callbacks?.onEventUpdate?.(event.id, updates);
  };

  /**
   * Hook to configure a draggable element
   */
  const useDraggableElement = (event: EyCalendarEvent) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const cleanup = makeDraggable(element, event);

      return cleanup;
    }, [event]);

    return {
      ref: elementRef,
      isDragging: draggedEvent?.id === event.id,
    };
  };

  /**
   * Hook to configure a drop target element
   */
  const useDropTarget = (data: Partial<DropEventData>) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const cleanup = makeDropTarget(element, data);

      return cleanup;
    }, [data]);

    return {
      ref: elementRef,
      isDropTarget: true,
    };
  };

  /**
   * Updates the temporary position during drag
   */
  const updateTempPosition = (position: EventPosition) => {
    setTempPosition(position);
    setTempEventPosition(position);
  };

  /**
   * Cancels the current drag
   */
  const cancelDrag = () => {
    setIsDragging(false);
    setDraggedEvent(null);
    setTempPosition(null);
    setDragging(false);
    setDraggedEventId(undefined);
    setTempEventPosition(undefined);
  };

  /**
   * Check if an event can be moved
   */
  const canDragEvent = (event: EyCalendarEvent): boolean => {
    // Logique personnalisable pour autoriser/interdire le drag
    if (event.custom?.readOnly) return false;
    if (event.isRecurring && !event.custom?.allowDragRecurring) return false;

    return true;
  };

  /**
   * Valid if a drop is allowed
   */
  const canDropEvent = (
    event: EyCalendarEvent,
    targetDate: Date,
    targetResourceId?: string
  ): boolean => {
    // Basic validation
    if (!targetDate) return false;

    // Check resource constraints
    if (targetResourceId && event.resourceId !== targetResourceId) {
      // Note: Resource availability check would require access to resources context
      // For now, we allow drops to any resource
      // TODO: Add resource availability check when resources are available in context
    }

    // Other customizable validations
    return true;
  };

  /**
   * Configures an element as resizable with Pragmatic DnD (as in Gantt)
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
      return draggable({
        element,
        getInitialData: () => ({
          type: "calendar-event-resize",
          eventId: event.id,
          event,
          resizeHandle: handle,
        }),
        onDragStart: ({ location }) => {
          // Store the initial data for resizing
          dragInitialData.current = {
            eventId: event.id,
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end),
            initialMouseY: location.initial.input.clientY,
            isResizing: true,
            resizeHandle: handle,
          };

          setIsDragging(true);
          setDraggedEvent(event);
          setDragging(true);
          setDraggedEventId(event.id);

          // Resize start callback
          resizeCallbacks?.onResizeStart?.(event.id, handle);
        },
        onDrag: ({ location }) => {
          const dragData = dragInitialData.current;
          if (
            !dragData ||
            !location.current.input.clientY ||
            !dragData.originalStart ||
            !dragData.originalEnd
          ) {
            return;
          }

          // Find the drop container to calculate the new position
          const container = element.closest('[data-drop-target="true"]') || element.parentElement;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const cellHeight = viewState.cellHeight || 64;

          const targetTime = calculateTargetTime(
            location.current.input.clientY,
            containerRect,
            cellHeight,
            0
          );

          // Calculate the new target date
          const targetDate = new Date(dragData.originalStart);
          targetDate.setHours(targetTime.hour, targetTime.minutes, 0, 0);

          let newStart = dragData.originalStart;
          let newEnd = dragData.originalEnd;

          if (handle === "top") {
            // Resize the beginning
            newStart = targetDate;
            // Verify that start < end (minimum 15 minutes)
            if (newStart >= dragData.originalEnd) {
              newStart = new Date(dragData.originalEnd.getTime() - 15 * 60 * 1000);
            }
          } else {
            // Resize the end
            newEnd = targetDate;
            // Verify that end > start (minimum 15 minutes)
            if (newEnd <= dragData.originalStart) {
              newEnd = new Date(dragData.originalStart.getTime() + 15 * 60 * 1000);
            }
          }

          // Resize callback in progress for visual feedback
          resizeCallbacks?.onResize?.(event.id, newStart, newEnd, handle);
        },
        onDrop: ({ location }) => {
          const dragData = dragInitialData.current;
          if (
            !dragData ||
            !location.current.input.clientY ||
            !dragData.originalStart ||
            !dragData.originalEnd
          ) {
            return;
          }

          // Final calculation for the drop
          const container = element.closest('[data-drop-target="true"]') || element.parentElement;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const cellHeight = viewState.cellHeight || 64;

          const targetTime = calculateTargetTime(
            location.current.input.clientY,
            containerRect,
            cellHeight,
            0
          );

          const targetDate = new Date(dragData.originalStart);
          targetDate.setHours(targetTime.hour, targetTime.minutes, 0, 0);

          let updates: Partial<EyCalendarEvent> = {};
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

          // Callback onEventResize BEFORE onEventUpdate
          callbacks?.onEventResize?.(event, finalStart, finalEnd);

          // Apply changes
          updateEvent(event.id, updates);
          callbacks?.onEventUpdate?.(event.id, updates);

          // Resize completion callback (local)
          resizeCallbacks?.onResizeEnd?.();

          // Reset status
          setDragging(false);
          setDraggedEventId(undefined);
          setTempEventPosition(undefined);
          dragInitialData.current = {};
        },
      });
    },
    [
      callbacks,
      updateEvent,
      setDragging,
      setDraggedEventId,
      setTempEventPosition,
      viewState.cellHeight,
    ]
  );

  // ============================================================================
  // AUTOMATIC CLEANING TO PREVENT MEMORY LEAKS
  // ============================================================================

  // Periodic cleaning of Maps and Sets to prevent accumulation
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // TODO Phase 5: Reactivate with EventsContext
      // Clean up offsets for events that no longer exist
      // const currentEventIds = new Set(eventsState.events.map((e) => e.id));
      // const offsetKeys = Array.from(dragOffsets.current.keys());

      // offsetKeys.forEach((eventId) => {
      //   if (!currentEventIds.has(eventId)) {
      //     dragOffsets.current.delete(eventId);
      //   }
      // });

      // Clean the treated drops (after 30 seconds)
      if (dropProcessed.current.size > 100) {
        dropProcessed.current.clear();
      }
    }, 30000); // Cleaning every 30 seconds

    return () => clearInterval(cleanupInterval);
  }, []); // Independent cleanup interval

  // Final cleanup on component unmount
  useEffect(() => {
    const offsetsRef = dragOffsets.current;
    const dropProcessedRef = dropProcessed.current;

    return () => {
      offsetsRef.clear();
      dropProcessedRef.clear();
      dragInitialData.current = {};
    };
  }, []);

  return {
    // Drag & drop state
    isDragging,
    draggedEvent,
    tempPosition,

    // Hooks for elements
    useDraggableElement,
    useDropTarget,

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
