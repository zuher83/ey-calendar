// Context spécialisé pour le drag & drop
// Séparé du CalendarContext principal pour améliorer les performances

import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef } from "react";
import type { EventPosition } from "../types";

// ============================================================================
// TYPES POUR LE CONTEXT DRAG & DROP
// ============================================================================

interface DragDropState {
  isDragging: boolean;
  draggedEventId?: string;
  tempEventPosition?: EventPosition;
  isResizing: boolean;
  resizeHandle?: "top" | "bottom";
  hoveredEventId?: string;
}

type DragDropAction =
  | { type: "SET_DRAGGING"; payload: boolean }
  | { type: "SET_DRAGGED_EVENT"; payload: string | undefined }
  | { type: "SET_TEMP_EVENT_POSITION"; payload: EventPosition | undefined }
  | { type: "SET_RESIZING"; payload: boolean }
  | { type: "SET_RESIZE_HANDLE"; payload: "top" | "bottom" | undefined }
  | { type: "SET_HOVERED_EVENT"; payload: string | undefined }
  | { type: "RESET_DRAG_STATE" };

interface SharedDragSession {
  eventId?: string;
  originalStart?: Date;
  originalEnd?: Date;
  initialMouseY?: number;
  initialOffset?: number;
  isResizing?: boolean;
  resizeHandle?: "top" | "bottom";
}

interface DragDropContextValue {
  state: DragDropState;
  // Actions
  setDragging: (isDragging: boolean) => void;
  setDraggedEvent: (eventId: string | undefined) => void;
  setTempEventPosition: (position: EventPosition | undefined) => void;
  setResizing: (isResizing: boolean) => void;
  setResizeHandle: (handle: "top" | "bottom" | undefined) => void;
  setHoveredEvent: (eventId: string | undefined) => void;
  resetDragState: () => void;
  sharedSessionRef: React.MutableRefObject<SharedDragSession>;
  sharedOffsetsRef: React.MutableRefObject<Map<string, number>>;
  resetSharedSession: () => void;
}

// ============================================================================
// REDUCER POUR LE DRAG & DROP
// ============================================================================

function dragDropReducer(state: DragDropState, action: DragDropAction): DragDropState {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload };

    case "SET_DRAGGED_EVENT":
      return { ...state, draggedEventId: action.payload };

    case "SET_TEMP_EVENT_POSITION":
      return { ...state, tempEventPosition: action.payload };

    case "SET_RESIZING":
      return { ...state, isResizing: action.payload };

    case "SET_RESIZE_HANDLE":
      return { ...state, resizeHandle: action.payload };

    case "SET_HOVERED_EVENT":
      return { ...state, hoveredEventId: action.payload };

    case "RESET_DRAG_STATE":
      return {
        isDragging: false,
        draggedEventId: undefined,
        tempEventPosition: undefined,
        isResizing: false,
        resizeHandle: undefined,
        hoveredEventId: undefined,
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT ET PROVIDER
// ============================================================================

const DragDropContext = createContext<DragDropContextValue | undefined>(undefined);

interface DragDropProviderProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [state, dispatch] = useReducer(dragDropReducer, {
    isDragging: false,
    draggedEventId: undefined,
    tempEventPosition: undefined,
    isResizing: false,
    resizeHandle: undefined,
    hoveredEventId: undefined,
  });
  const sharedSessionRef = useRef<SharedDragSession>({});
  const sharedOffsetsRef = useRef<Map<string, number>>(new Map());

  const resetSharedSession = useCallback(() => {
    sharedSessionRef.current = {};
    sharedOffsetsRef.current.clear();
  }, []);

  // Actions memoized pour éviter les re-renders
  const actions = useMemo(
    () => ({
      setDragging: (isDragging: boolean) => dispatch({ type: "SET_DRAGGING", payload: isDragging }),
      setDraggedEvent: (eventId: string | undefined) =>
        dispatch({ type: "SET_DRAGGED_EVENT", payload: eventId }),
      setTempEventPosition: (position: EventPosition | undefined) =>
        dispatch({ type: "SET_TEMP_EVENT_POSITION", payload: position }),
      setResizing: (isResizing: boolean) => dispatch({ type: "SET_RESIZING", payload: isResizing }),
      setResizeHandle: (handle: "top" | "bottom" | undefined) =>
        dispatch({ type: "SET_RESIZE_HANDLE", payload: handle }),
      setHoveredEvent: (eventId: string | undefined) =>
        dispatch({ type: "SET_HOVERED_EVENT", payload: eventId }),
      resetDragState: () => dispatch({ type: "RESET_DRAG_STATE" }),
    }),
    []
  );

  const contextValue = useMemo(
    () => ({
      state,
      ...actions,
      sharedSessionRef,
      sharedOffsetsRef,
      resetSharedSession,
    }),
    [state, actions, resetSharedSession]
  );

  return <DragDropContext.Provider value={contextValue}>{children}</DragDropContext.Provider>;
}

// ============================================================================
// HOOK POUR UTILISER LE CONTEXT
// ============================================================================

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }

  return context;
}
