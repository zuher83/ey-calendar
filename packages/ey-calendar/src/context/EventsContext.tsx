// Context spécialisé pour la gestion des événements
// Séparé du CalendarContext principal pour améliorer les performances

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { EventPosition, EyCalendarEvent } from "../types";

// ============================================================================
// TYPES POUR LE CONTEXT ÉVÉNEMENTS
// ============================================================================

interface EventsState {
  events: EyCalendarEvent[];
  selectedEventIds: string[];
  eventPositions: Map<string, EventPosition>;
}

type EventsAction =
  | { type: "SET_EVENTS"; payload: EyCalendarEvent[] }
  | { type: "UPDATE_EVENT"; payload: { id: string; updates: Partial<EyCalendarEvent> } }
  | { type: "ADD_EVENT"; payload: EyCalendarEvent }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_SELECTED_EVENTS"; payload: string[] }
  | { type: "TOGGLE_EVENT_SELECTION"; payload: string }
  | { type: "SET_EVENT_POSITIONS"; payload: Map<string, EventPosition> }
  | { type: "UPDATE_EVENT_POSITION"; payload: { eventId: string; position: EventPosition } };

interface EventsContextValue {
  state: EventsState;
  // Actions
  setEvents: (events: EyCalendarEvent[]) => void;
  updateEvent: (id: string, updates: Partial<EyCalendarEvent>) => void;
  addEvent: (event: EyCalendarEvent) => void;
  deleteEvent: (id: string) => void;
  setSelectedEvents: (ids: string[]) => void;
  toggleEventSelection: (id: string) => void;
  setEventPositions: (positions: Map<string, EventPosition>) => void;
  updateEventPosition: (eventId: string, position: EventPosition) => void;
}

// ============================================================================
// REDUCER POUR LES ÉVÉNEMENTS
// ============================================================================

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case "SET_EVENTS":
      return {
        ...state,
        events: action.payload,
        selectedEventIds: [], // Reset selection
      };

    case "UPDATE_EVENT": {
      const { id, updates } = action.payload;

      return {
        ...state,
        events: state.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
      };
    }

    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
        selectedEventIds: state.selectedEventIds.filter((id) => id !== action.payload),
      };

    case "SET_SELECTED_EVENTS":
      return { ...state, selectedEventIds: action.payload };

    case "TOGGLE_EVENT_SELECTION": {
      const eventId = action.payload;
      const isSelected = state.selectedEventIds.includes(eventId);

      return {
        ...state,
        selectedEventIds: isSelected
          ? state.selectedEventIds.filter((id) => id !== eventId)
          : [...state.selectedEventIds, eventId],
      };
    }

    case "SET_EVENT_POSITIONS":
      return { ...state, eventPositions: action.payload };

    case "UPDATE_EVENT_POSITION": {
      const { eventId, position } = action.payload;
      const newPositions = new Map(state.eventPositions);
      newPositions.set(eventId, position);

      return { ...state, eventPositions: newPositions };
    }

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT ET PROVIDER
// ============================================================================

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

interface EventsProviderProps {
  children: React.ReactNode;
  initialEvents?: EyCalendarEvent[];
}

export function EventsProvider({ children, initialEvents = [] }: EventsProviderProps) {
  const [state, dispatch] = useReducer(eventsReducer, {
    events: initialEvents,
    selectedEventIds: [],
    eventPositions: new Map(),
  });

  // Track if this is the first render to avoid double-setting events
  const isFirstRender = useRef(true);

  // Sync external events changes to internal state
  // This enables the "controlled component" pattern where parent can update events
  useEffect(() => {
    // Skip the first render since initialEvents is already set in useReducer
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    // Sync new events from parent
    dispatch({ type: "SET_EVENTS", payload: initialEvents });
  }, [initialEvents]);

  // Actions memoized pour éviter les re-renders
  const actions = useMemo(
    () => ({
      setEvents: (events: EyCalendarEvent[]) => dispatch({ type: "SET_EVENTS", payload: events }),
      updateEvent: (id: string, updates: Partial<EyCalendarEvent>) =>
        dispatch({ type: "UPDATE_EVENT", payload: { id, updates } }),
      addEvent: (event: EyCalendarEvent) => dispatch({ type: "ADD_EVENT", payload: event }),
      deleteEvent: (id: string) => dispatch({ type: "DELETE_EVENT", payload: id }),
      setSelectedEvents: (ids: string[]) => dispatch({ type: "SET_SELECTED_EVENTS", payload: ids }),
      toggleEventSelection: (id: string) =>
        dispatch({ type: "TOGGLE_EVENT_SELECTION", payload: id }),
      setEventPositions: (positions: Map<string, EventPosition>) =>
        dispatch({ type: "SET_EVENT_POSITIONS", payload: positions }),
      updateEventPosition: (eventId: string, position: EventPosition) =>
        dispatch({ type: "UPDATE_EVENT_POSITION", payload: { eventId, position } }),
    }),
    []
  );

  const contextValue = useMemo(
    () => ({
      state,
      ...actions,
    }),
    [state, actions]
  );

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>;
}

// ============================================================================
// HOOK POUR UTILISER LE CONTEXT
// ============================================================================

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }

  return context;
}
