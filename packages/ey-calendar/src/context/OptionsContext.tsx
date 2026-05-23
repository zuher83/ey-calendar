// Context for calendar options (locale, theme, labels, components)
// src/components/ey-calendar/context/OptionsContext.tsx

import React, { createContext, useContext, useMemo } from "react";
import type { Locale } from "date-fns";
import { DefaultBadge, DefaultButton } from "../components/defaults";
import { DEFAULT_COMPONENTS } from "../constants/components";
import { useEyCalendarClasses, type GetEyCalendarClass } from "../hooks/useEyCalendarClasses";
import { useEyCalendarLabels } from "../hooks/useEyCalendarLabels";
import type {
  EyCalendarClassNames,
  EyCalendarComponents,
  EyCalendarLabels,
  EyCalendarThemeClasses,
  TimeSlotConfig,
} from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarOptionsContextValue {
  locale?: Locale;
  timeSlots?: TimeSlotConfig;
  showWeekends?: boolean;
  showToday?: boolean;
  highlightToday?: boolean;
  readonly?: boolean;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  enableCreate?: boolean;
  enableDelete?: boolean;
  theme?: string | EyCalendarThemeClasses;
  unstyled?: boolean;
  classNames?: EyCalendarClassNames;
  components?: Partial<EyCalendarComponents>;
  labels?: Partial<EyCalendarLabels>;
  autoHeight?: boolean;
  detectedHeight?: number;
  showWeekNumbers?: boolean;
}

export interface ResolvedCalendarOptions extends Omit<
  CalendarOptionsContextValue,
  "components" | "labels"
> {
  components: Required<EyCalendarComponents>;
  labels: EyCalendarLabels;
  getClass: GetEyCalendarClass;
}

interface OptionsContextValue {
  options: ResolvedCalendarOptions;
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
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });
  const resolvedComponents = useMemo<Required<EyCalendarComponents>>(
    () => ({
      Button: DefaultButton,
      Badge: DefaultBadge,
      ...DEFAULT_COMPONENTS,
      ...options.components,
    }),
    [options.components]
  );

  const contextValue = useMemo(
    () => ({
      options: {
        locale: options.locale,
        timeSlots: options.timeSlots,
        showWeekends: options.showWeekends ?? true,
        showToday: options.showToday ?? true,
        highlightToday: options.highlightToday ?? true,
        readonly: options.readonly ?? false,
        enableDragDrop: options.enableDragDrop ?? true,
        enableResize: options.enableResize ?? true,
        enableCreate: options.enableCreate ?? true,
        enableDelete: options.enableDelete ?? true,
        theme: options.theme,
        unstyled: options.unstyled ?? false,
        classNames: options.classNames ?? {},
        components: resolvedComponents,
        labels: resolvedLabels,
        getClass,
        autoHeight: options.autoHeight ?? false,
        detectedHeight: options.detectedHeight,
        showWeekNumbers: options.showWeekNumbers ?? false,
      },
    }),
    [
      options.locale,
      options.timeSlots,
      options.showWeekends,
      options.showToday,
      options.highlightToday,
      options.readonly,
      options.enableDragDrop,
      options.enableResize,
      options.enableCreate,
      options.enableDelete,
      options.theme,
      options.unstyled,
      options.classNames,
      resolvedComponents,
      resolvedLabels,
      getClass,
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
