// Context for calendar callbacks
// src/components/ey-calendar/context/CallbacksContext.tsx

import React, { createContext, useContext, useMemo } from "react";
import type { EyCalendarCallbacks } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface CallbacksContextValue {
  callbacks: EyCalendarCallbacks;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CallbacksContext = createContext<CallbacksContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface CallbacksProviderProps {
  children: React.ReactNode;
  callbacks?: EyCalendarCallbacks;
}

export function CallbacksProvider({ children, callbacks = {} }: CallbacksProviderProps) {
  const contextValue = useMemo(() => ({ callbacks }), [callbacks]);

  return <CallbacksContext.Provider value={contextValue}>{children}</CallbacksContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCallbacks() {
  const context = useContext(CallbacksContext);
  if (context === undefined) {
    throw new Error("useCallbacks must be used within a CallbacksProvider");
  }

  return context;
}

export default CallbacksContext;
