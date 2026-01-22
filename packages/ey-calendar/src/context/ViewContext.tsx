// Context spécialisé pour la gestion des vues et navigation
// Séparé du CalendarContext principal pour améliorer les performances

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { ViewMode } from "../types";

// ============================================================================
// TYPES POUR LE CONTEXT VUES
// ============================================================================

interface ViewState {
  currentView: ViewMode;
  currentDate: Date;
  startDate: Date;
  endDate: Date;
  cellHeight: number;
  selectedDate?: Date;
  scrollPosition: { x: number; y: number };
}

type ViewAction =
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_CURRENT_DATE"; payload: Date }
  | { type: "SET_DATE_RANGE"; payload: { start: Date; end: Date } }
  | { type: "SET_CELL_HEIGHT"; payload: number }
  | { type: "SET_SELECTED_DATE"; payload: Date | undefined }
  | { type: "SET_SCROLL_POSITION"; payload: { x: number; y: number } };

interface ViewContextValue {
  state: ViewState;
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  setDateRange: (start: Date, end: Date) => void;
  setCellHeight: (height: number) => void;
  setSelectedDate: (date: Date | undefined) => void;
  setScrollPosition: (position: { x: number; y: number }) => void;
}

// ============================================================================
// UTILITAIRES POUR CALCUL DES DATES
// ============================================================================

function calculateDateRange(currentDate: Date, viewMode: ViewMode): { start: Date; end: Date } {
  const start = new Date(currentDate);
  const end = new Date(currentDate);

  switch (viewMode) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "week": {
      // Début de la semaine (lundi)
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + mondayOffset);
      start.setHours(0, 0, 0, 0);

      // Fin de la semaine (dimanche)
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "month": {
      // Début du mois
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      // Fin du mois
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "planning":
      // Vue planning = semaine par défaut
      start.setDate(start.getDate() - start.getDay() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      break;
  }

  return { start, end };
}

// ============================================================================
// REDUCER POUR LES VUES
// ============================================================================

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SET_VIEW_MODE": {
      const newDateRange = calculateDateRange(state.currentDate, action.payload);

      return {
        ...state,
        currentView: action.payload,
        startDate: newDateRange.start,
        endDate: newDateRange.end,
      };
    }

    case "SET_CURRENT_DATE": {
      const newDateRange = calculateDateRange(action.payload, state.currentView);

      return {
        ...state,
        currentDate: action.payload,
        startDate: newDateRange.start,
        endDate: newDateRange.end,
      };
    }

    case "SET_DATE_RANGE":
      return {
        ...state,
        startDate: action.payload.start,
        endDate: action.payload.end,
      };

    case "SET_CELL_HEIGHT":
      return { ...state, cellHeight: action.payload };

    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };

    case "SET_SCROLL_POSITION":
      return { ...state, scrollPosition: action.payload };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT ET PROVIDER
// ============================================================================

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

interface ViewProviderProps {
  children: React.ReactNode;
  initialView?: ViewMode;
  initialDate?: Date;
  initialCellHeight?: number;
}

export function ViewProvider({
  children,
  initialView = "week",
  initialDate = new Date(),
  initialCellHeight = 64,
}: ViewProviderProps) {
  const initialDateRange = calculateDateRange(initialDate, initialView);

  const [state, dispatch] = useReducer(viewReducer, {
    currentView: initialView,
    currentDate: initialDate,
    startDate: initialDateRange.start,
    endDate: initialDateRange.end,
    cellHeight: initialCellHeight,
    scrollPosition: { x: 0, y: 0 },
  });

  // Actions memoized pour éviter les re-renders
  const actions = useMemo(
    () => ({
      setViewMode: (mode: ViewMode) => dispatch({ type: "SET_VIEW_MODE", payload: mode }),
      setCurrentDate: (date: Date) => dispatch({ type: "SET_CURRENT_DATE", payload: date }),
      setDateRange: (start: Date, end: Date) =>
        dispatch({ type: "SET_DATE_RANGE", payload: { start, end } }),
      setCellHeight: (height: number) => dispatch({ type: "SET_CELL_HEIGHT", payload: height }),
      setSelectedDate: (date: Date | undefined) =>
        dispatch({ type: "SET_SELECTED_DATE", payload: date }),
      setScrollPosition: (position: { x: number; y: number }) =>
        dispatch({ type: "SET_SCROLL_POSITION", payload: position }),
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

  return <ViewContext.Provider value={contextValue}>{children}</ViewContext.Provider>;
}

// ============================================================================
// HOOK POUR UTILISER LE CONTEXT
// ============================================================================

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }

  return context;
}
