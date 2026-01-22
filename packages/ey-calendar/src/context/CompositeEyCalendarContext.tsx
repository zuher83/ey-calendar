// Provider composite qui combine tous les contextes spécialisés
// Remplace l'ancien CalendarContext monolithique

import React from "react";
import type { EyCalendarCallbacks, EyCalendarEvent, EyCalendarOptions, ViewMode } from "../types";
import { CallbacksProvider } from "./CallbacksContext";
import { CallbacksObserver } from "./CallbacksObserver";
import { DragDropProvider } from "./DragDropContext";
import { EventsProvider } from "./EventsContext";
import { OptionsProvider } from "./OptionsContext";
import { ViewProvider } from "./ViewContext";

// ============================================================================
// PROPS POUR LE PROVIDER COMPOSITE
// ============================================================================

interface CalendarProviderProps {
  children: React.ReactNode;
  initialEvents?: EyCalendarEvent[];
  initialView?: ViewMode;
  initialDate?: Date;
  initialCellHeight?: number;
  callbacks?: EyCalendarCallbacks;
  options?: Partial<EyCalendarOptions>;
}

// ============================================================================
// PROVIDER COMPOSITE
// ============================================================================

export function EyCalendarProvider({
  children,
  initialEvents = [],
  initialView = "week",
  initialDate = new Date(),
  initialCellHeight = 64,
  callbacks = {},
  options = {},
}: CalendarProviderProps) {
  return (
    <OptionsProvider options={options}>
      <CallbacksProvider callbacks={callbacks}>
        <ViewProvider
          initialView={initialView}
          initialDate={initialDate}
          initialCellHeight={initialCellHeight}
        >
          <EventsProvider initialEvents={initialEvents}>
            <DragDropProvider>
              <CallbacksObserver />
              {children}
            </DragDropProvider>
          </EventsProvider>
        </ViewProvider>
      </CallbacksProvider>
    </OptionsProvider>
  );
}

// ============================================================================
// EXPORTS DES HOOKS
// ============================================================================

export { useEvents } from "./EventsContext";
export { useView } from "./ViewContext";
export { useDragDrop } from "./DragDropContext";
export { useCallbacks } from "./CallbacksContext";
export { useOptions } from "./OptionsContext";
