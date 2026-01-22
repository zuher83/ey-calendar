// Hook pour gérer la navigation entre vues et l'état de la vue courante
// src/components/ey-calendar/hooks/useEyCalendarView.ts

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEvents } from "../context/EventsContext";
import { useOptions } from "../context/OptionsContext";
import { useView } from "../context/ViewContext";
import type { EyCalendarEvent, ViewMode } from "../types";
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

/**
 * Hook pour gérer la navigation entre vues et l'état de la vue courante
 */
export function useEyCalendarView(): CalendarViewResult {
  const { state: viewState, setViewMode, setCurrentDate } = useView();
  const { state: eventsState } = useEvents();
  const { currentView, currentDate } = viewState;
  const { events } = eventsState;

  // Get options from OptionsContext (labels, locale)
  const { options } = useOptions();
  const labels = useEyCalendarLabels(options.labels, options.locale);
  const locale = options.locale;

  // Calcul de la plage visible selon la vue
  const visibleRange = useMemo(() => {
    let start: Date;
    let end: Date;
    let days: Date[] = [];

    switch (currentView) {
      case "month": {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);

        // Ajouter les jours du mois précédent et suivant pour compléter la grille
        const monthStart = startOfWeek(start, { weekStartsOn: 1 }); // Lundi
        const monthEnd = endOfWeek(end, { weekStartsOn: 1 });

        start = monthStart;
        end = monthEnd;

        // Générer tous les jours de la grille mensuelle
        let currentDay = start;
        while (currentDay <= end) {
          days.push(new Date(currentDay));
          currentDay = addDays(currentDay, 1);
        }
        break;
      }

      case "week": {
        start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lundi
        end = endOfWeek(currentDate, { weekStartsOn: 1 }); // Dimanche

        // Générer les 7 jours de la semaine
        for (let i = 0; i < 7; i++) {
          days.push(addDays(start, i));
        }
        break;
      }

      case "day": {
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        days = [new Date(currentDate)];
        break;
      }

      case "planning": {
        // Vue planning : affiche généralement une semaine ou un mois
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });

        for (let i = 0; i < 7; i++) {
          days.push(addDays(start, i));
        }
        break;
      }

      default: {
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        days = [new Date(currentDate)];
      }
    }

    return { start, end, days };
  }, [currentView, currentDate]);

  // Informations de navigation
  const navigation = useMemo((): NavigationInfo => {
    // Navigation limits can be configured
    const canGoNext = true; // No limit to the future
    const canGoPrevious = true; // No limit to the past

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
  }, [currentView, currentDate, visibleRange, labels, locale]);

  // Statistiques de la vue courante
  const stats = useMemo((): ViewStats => {
    const visibleEvents = events.filter((event) => {
      return event.start <= visibleRange.end && event.end >= visibleRange.start;
    });

    const allDayEvents = visibleEvents.filter((event) => event.isAllDay).length;
    const timedEvents = visibleEvents.length - allDayEvents;

    // Calculer les événements en conflit (simplifié)
    const conflictingEvents = visibleEvents.filter((event) => {
      return visibleEvents.some(
        (otherEvent) =>
          otherEvent.id !== event.id && event.start < otherEvent.end && event.end > otherEvent.start
      );
    }).length;

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
  }, [events, visibleRange]);

  // Actions de navigation
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
            // Aller au 1er jour du mois suivant
            nextDate = startOfMonth(addMonths(currentDate, 1));
            break;
          case "week":
          case "planning":
            // Aller au début de la semaine suivante
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
            // Aller au 1er jour du mois précédent
            previousDate = startOfMonth(addMonths(currentDate, -1));
            break;
          case "week":
          case "planning":
            // Aller au début de la semaine précédente
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

        // Normaliser selon la vue
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
    [currentView, currentDate, setViewMode, setCurrentDate]
  );

  // Utilitaires
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
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        return events.filter((event) => {
          return event.start < dayEnd && event.end > dayStart;
        });
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
    [visibleRange, currentView, currentDate, events, navigation.currentLabel, labels]
  );

  return {
    currentView,
    currentDate,
    visibleRange,
    navigation,
    stats,
    actions,
    utils,
  };
}
