// Hook pour gérer la navigation entre vues et l'état de la vue courante
// src/components/ey-calendar/hooks/useEyCalendarView.ts

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfMonth,
  startOfWeek,
  type Locale,
} from "date-fns";
import { useEvents } from "../context/EventsContext";
import { useOptions } from "../context/OptionsContext";
import { useViewActions, useViewCurrentDate, useViewCurrentView } from "../context/ViewContext";
import type { EyCalendarEvent, ViewMode } from "../types";
import { getEventsForDate, getEventsInDateRange } from "../utils/eventUtils";
import { getVisibleDateRange } from "../utils/viewRangeUtils";
import { useEyCalendarLabels } from "./useEyCalendarLabels";

/**
 * Interface pour les informations de navigation
 */
interface NavigationInfo {
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextLabel: string;
  previousLabel: string;
  currentLabel: string;
  todayLabel: string;
}

/**
 * Interface pour les statistiques de la vue courante
 */
interface ViewStats {
  totalEvents: number;
  visibleEvents: number;
  conflictingEvents: number;
  allDayEvents: number;
  timedEvents: number;
  averageEventsPerDay: number;
}

/**
 * Interface pour les résultats du hook useEyCalendarView
 */
interface CalendarViewResult {
  // État de la vue
  currentView: ViewMode;
  currentDate: Date;
  visibleRange: {
    start: Date;
    end: Date;
    days: Date[];
  };

  // Navigation
  navigation: NavigationInfo;

  // Statistiques
  stats: ViewStats;

  // Actions
  actions: {
    setView: (view: ViewMode) => void;
    setDate: (date: Date) => void;
    goToNext: () => void;
    goToPrevious: () => void;
    goToToday: () => void;
    goToDate: (date: Date) => void;
  };

  // Utilitaires de vue
  utils: {
    isDateVisible: (date: Date) => boolean;
    isDateToday: (date: Date) => boolean;
    isDateSelected: (date: Date) => boolean;
    getDateEvents: (date: Date) => EyCalendarEvent[];
    formatViewTitle: () => string;
    getViewLabel: (view: ViewMode) => string;
  };
}

type VisibleRange = CalendarViewResult["visibleRange"];
type CalendarViewNavigationResult = Omit<CalendarViewResult, "stats">;

interface CalendarViewState {
  currentView: ViewMode;
  currentDate: Date;
  visibleRange: VisibleRange;
  events: EyCalendarEvent[];
  labels: ReturnType<typeof useEyCalendarLabels>;
  locale?: Locale;
  setViewMode: (view: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
}

function countConflictingEvents(events: EyCalendarEvent[]): number {
  if (events.length < 2) {
    return 0;
  }

  const sortedEvents = [...events].sort((leftEvent, rightEvent) => {
    const startDiff = leftEvent.start.getTime() - rightEvent.start.getTime();

    if (startDiff !== 0) {
      return startDiff;
    }

    return leftEvent.end.getTime() - rightEvent.end.getTime();
  });

  let conflictingCount = 0;
  let currentGroupSize = 0;
  let currentGroupEnd = Number.NEGATIVE_INFINITY;

  for (const event of sortedEvents) {
    const eventStart = event.start.getTime();
    const eventEnd = event.end.getTime();

    if (currentGroupSize === 0) {
      currentGroupSize = 1;
      currentGroupEnd = eventEnd;
      continue;
    }

    if (eventStart < currentGroupEnd) {
      currentGroupSize += 1;
      currentGroupEnd = Math.max(currentGroupEnd, eventEnd);
      continue;
    }

    if (currentGroupSize > 1) {
      conflictingCount += currentGroupSize;
    }

    currentGroupSize = 1;
    currentGroupEnd = eventEnd;
  }

  if (currentGroupSize > 1) {
    conflictingCount += currentGroupSize;
  }

  return conflictingCount;
}

function useCalendarViewState(): CalendarViewState {
  const currentView = useViewCurrentView();
  const currentDate = useViewCurrentDate();
  const { setViewMode, setCurrentDate } = useViewActions();
  const {
    state: { events },
  } = useEvents();
  const { options } = useOptions();
  const labels = useEyCalendarLabels(options.labels, options.locale);
  const locale = options.locale;
  const showWeekends = options.showWeekends !== false;

  const visibleRange = useMemo(() => {
    const range = getVisibleDateRange(currentDate, currentView, showWeekends);

    return { start: range.start, end: range.end, days: range.days };
  }, [currentDate, currentView, showWeekends]);

  return {
    currentView,
    currentDate,
    visibleRange,
    events,
    labels,
    locale,
    setViewMode,
    setCurrentDate,
  };
}

function useCalendarViewNavigation(state: CalendarViewState): CalendarViewNavigationResult {
  const {
    currentView,
    currentDate,
    events,
    labels,
    locale,
    visibleRange,
    setViewMode,
    setCurrentDate,
  } = state;

  const navigation = useMemo((): NavigationInfo => {
    const canGoNext = true;
    const canGoPrevious = true;

    let nextLabel = "";
    let previousLabel = "";
    let currentLabel = "";

    switch (currentView) {
      case "month":
        nextLabel = labels.navNextMonth;
        previousLabel = labels.navPreviousMonth;
        currentLabel = format(currentDate, "MMMM yyyy", { locale });
        break;

      case "week":
        nextLabel = labels.navNextWeek;
        previousLabel = labels.navPreviousWeek;
        currentLabel = `${labels.viewWeek} ${format(visibleRange.start, "dd MMM", { locale })} - ${format(visibleRange.end, "dd MMM yyyy", { locale })}`;
        break;

      case "day":
        nextLabel = labels.navNextDay;
        previousLabel = labels.navPreviousDay;
        currentLabel = format(currentDate, "EEEE dd MMMM yyyy", { locale });
        break;

      case "planning":
        nextLabel = labels.navNextPeriod;
        previousLabel = labels.navPreviousPeriod;
        currentLabel = `${labels.viewPlanning} ${format(visibleRange.start, "dd MMM", { locale })} - ${format(visibleRange.end, "dd MMM yyyy", { locale })}`;
        break;
    }

    return {
      canGoNext,
      canGoPrevious,
      nextLabel,
      previousLabel,
      currentLabel,
      todayLabel: labels.navToday,
    };
  }, [currentDate, currentView, labels, locale, visibleRange.end, visibleRange.start]);

  const actions = useMemo(
    () => ({
      setView: (view: ViewMode) => {
        setViewMode(view);
      },

      setDate: (date: Date) => {
        setCurrentDate(date);
      },

      goToNext: () => {
        let nextDate: Date;

        switch (currentView) {
          case "month":
            nextDate = startOfMonth(addMonths(currentDate, 1));
            break;
          case "week":
          case "planning":
            nextDate = startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });
            break;
          case "day":
            nextDate = addDays(currentDate, 1);
            break;
          default:
            nextDate = addDays(currentDate, 1);
        }

        setCurrentDate(nextDate);
      },

      goToPrevious: () => {
        let previousDate: Date;

        switch (currentView) {
          case "month":
            previousDate = startOfMonth(addMonths(currentDate, -1));
            break;
          case "week":
          case "planning":
            previousDate = startOfWeek(addWeeks(currentDate, -1), { weekStartsOn: 1 });
            break;
          case "day":
            previousDate = addDays(currentDate, -1);
            break;
          default:
            previousDate = addDays(currentDate, -1);
        }

        setCurrentDate(previousDate);
      },

      goToToday: () => {
        const today = new Date();
        let normalizedDate: Date;

        switch (currentView) {
          case "month":
            normalizedDate = startOfMonth(today);
            break;
          case "week":
          case "planning":
            normalizedDate = startOfWeek(today, { weekStartsOn: 1 });
            break;
          default:
            normalizedDate = today;
        }

        setCurrentDate(normalizedDate);
      },

      goToDate: (date: Date) => {
        setCurrentDate(date);
      },
    }),
    [currentDate, currentView, setCurrentDate, setViewMode]
  );

  const utils = useMemo(
    () => ({
      isDateVisible: (date: Date): boolean => {
        return date >= visibleRange.start && date <= visibleRange.end;
      },

      isDateToday: (date: Date): boolean => {
        return isSameDay(date, new Date());
      },

      isDateSelected: (date: Date): boolean => {
        switch (currentView) {
          case "month":
            return isSameMonth(date, currentDate);
          case "week":
          case "planning":
            return isSameWeek(date, currentDate, { weekStartsOn: 1 });
          case "day":
            return isSameDay(date, currentDate);
          default:
            return false;
        }
      },

      getDateEvents: (date: Date): EyCalendarEvent[] => {
        return getEventsForDate(events, date);
      },

      formatViewTitle: (): string => {
        return navigation.currentLabel;
      },

      getViewLabel: (view: ViewMode): string => {
        const labelsMap: Record<ViewMode, string> = {
          month: labels.viewMonth,
          week: labels.viewWeek,
          day: labels.viewDay,
          planning: labels.viewPlanning,
        };

        return labelsMap[view] || view;
      },
    }),
    [
      currentDate,
      currentView,
      events,
      labels,
      navigation.currentLabel,
      visibleRange.end,
      visibleRange.start,
    ]
  );

  return {
    currentView,
    currentDate,
    visibleRange,
    navigation,
    actions,
    utils,
  };
}

function useCalendarViewStats(events: EyCalendarEvent[], visibleRange: VisibleRange): ViewStats {
  return useMemo((): ViewStats => {
    const visibleEvents = getEventsInDateRange(events, visibleRange.start, visibleRange.end);
    const allDayEvents = visibleEvents.filter((event) => event.isAllDay).length;
    const timedEvents = visibleEvents.length - allDayEvents;
    const conflictingEvents = countConflictingEvents(visibleEvents);
    const dayCount = visibleRange.days.length;
    const averageEventsPerDay = dayCount > 0 ? visibleEvents.length / dayCount : 0;

    return {
      totalEvents: events.length,
      visibleEvents: visibleEvents.length,
      conflictingEvents,
      allDayEvents,
      timedEvents,
      averageEventsPerDay,
    };
  }, [events, visibleRange.days.length, visibleRange.end, visibleRange.start]);
}

export function useEyCalendarNavigation(): CalendarViewNavigationResult {
  const state = useCalendarViewState();

  return useCalendarViewNavigation(state);
}

export function useEyCalendarVisibleEventCount(): number {
  const { events, visibleRange } = useCalendarViewState();

  return useMemo(
    () => getEventsInDateRange(events, visibleRange.start, visibleRange.end).length,
    [events, visibleRange.end, visibleRange.start]
  );
}

/**
 * Hook pour gérer la navigation entre vues et l'état de la vue courante
 */
export function useEyCalendarView(): CalendarViewResult {
  const state = useCalendarViewState();
  const view = useCalendarViewNavigation(state);
  const stats = useCalendarViewStats(state.events, state.visibleRange);

  return {
    ...view,
    stats,
  };
}
