// Context for calendar options (locale, theme, labels, components)
// src/components/ey-calendar/context/OptionsContext.tsx

import React, { createContext, useContext, useMemo } from "react";
import type { Locale } from "date-fns";
import { DEFAULT_COMPONENTS } from "../constants/components";
import { useEyCalendarLabels } from "../hooks/useEyCalendarLabels";
import type {
  EyCalendarClassNames,
  EyCalendarComponents,
  EyCalendarLabels,
  EyCalendarThemeClasses,
} from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarOptionsContextValue {
  locale?: Locale;
  theme?: string | EyCalendarThemeClasses;
  unstyled?: boolean;
  classNames?: EyCalendarClassNames;
  components?: Partial<EyCalendarComponents>;
  labels?: Partial<EyCalendarLabels>;
  autoHeight?: boolean;
  detectedHeight?: number;
  showWeekNumbers?: boolean;
}

interface OptionsContextValue {
  options: CalendarOptionsContextValue;
}

// ============================================================================
// CONTEXT
// ============================================================================

const OptionsContext = createContext<OptionsContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface OptionsProviderProps {
  children: React.ReactNode;
  options?: CalendarOptionsContextValue;
}

export function OptionsProvider({ children, options = {} }: OptionsProviderProps) {
  // Use the hook to automatically select labels based on locale
  const resolvedLabels = useEyCalendarLabels(options.labels, options.locale);

  const contextValue = useMemo(
    () => ({
      options: {
        locale: options.locale,
        theme: options.theme,
        unstyled: options.unstyled ?? false,
        classNames: options.classNames ?? {},
        components: { ...DEFAULT_COMPONENTS, ...options.components },
        labels: resolvedLabels,
        autoHeight: options.autoHeight ?? false,
        detectedHeight: options.detectedHeight,
        showWeekNumbers: options.showWeekNumbers ?? false,
      },
    }),
    [
      options.locale,
      options.theme,
      options.unstyled,
      options.classNames,
      options.components,
      resolvedLabels,
      options.autoHeight,
      options.detectedHeight,
      options.showWeekNumbers,
    ]
  );

  return <OptionsContext.Provider value={contextValue}>{children}</OptionsContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOptions() {
  const context = useContext(OptionsContext);
  if (context === undefined) {
    throw new Error("useOptions must be used within an OptionsProvider");
  }

  return context;
}

export default OptionsContext;
