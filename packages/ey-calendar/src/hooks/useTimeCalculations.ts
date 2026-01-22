// Hook pour les calculs temporels et génération des créneaux horaires
// src/components/ey-calendar/hooks/useTimeCalculations.ts

import { useMemo } from "react";
import {
  addHours,
  addMinutes,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getHours,
  isAfter,
  isBefore,
  isToday,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DEFAULT_TIME_SLOT_CONFIG } from "../constants";
import { useOptions } from "../context/OptionsContext";
import { useView } from "../context/ViewContext";
import type { TimeSlot } from "../types";

/**
 * Interface pour les informations de vue
 */
interface ViewInfo {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  visibleDays: Date[];
}

/**
 * Interface pour la grille mensuelle
 */
interface MonthGrid {
  weeks: Array<{
    id: string;
    days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      dayOfWeek: number;
    }>;
  }>;
}

/**
 * Interface pour les créneaux horaires groupés
 */
interface HourSlots {
  hour: number;
  formattedTime: string;
  slots: TimeSlot[];
}

/**
 * Interface pour les utilitaires temporels
 */
interface TimeUtils {
  formatDate: (date: Date, pattern?: string) => string;
  isInViewRange: (date: Date) => boolean;
  getSlotForDate: (date: Date) => TimeSlot | undefined;
  getDateForSlot: (slotId: string) => Date | undefined;
  snapToGrid: (date: Date) => Date;
}

/**
 * Interface pour les résultats du hook useTimeCalculations
 */
interface TimeCalculationsResult {
  timeSlots: TimeSlot[];
  viewInfo: ViewInfo;
  monthGrid?: MonthGrid;
  hourSlots?: HourSlots[];
  utils: TimeUtils;
}

/**
 * Hook for all calendar time calculations
 */
export function useTimeCalculations(): TimeCalculationsResult {
  const { state } = useView();
  const { currentView, currentDate } = state;
  const { options } = useOptions();
  const locale = options.locale;

  // Calculation of start and end dates according to view
  const viewInfo = useMemo((): ViewInfo => {
    let startDate: Date;
    let endDate: Date;
    let visibleDays: Date[];

    switch (currentView) {
      case "month":
        startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }); // Lundi
        endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        visibleDays = eachDayOfInterval({ start: startDate, end: endDate });
        break;

      case "week":
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        visibleDays = eachDayOfInterval({ start: startDate, end: endDate });
        break;

      case "day":
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        visibleDays = [currentDate];
        break;

      case "planning":
        // Pour la vue planning, on prend la semaine courante par défaut
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        visibleDays = eachDayOfInterval({ start: startDate, end: endDate });
        break;

      default:
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        visibleDays = [currentDate];
    }

    return {
      startDate,
      endDate,
      totalDays: visibleDays.length,
      visibleDays,
    };
  }, [currentView, currentDate]);

  // Generate time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const config = DEFAULT_TIME_SLOT_CONFIG;

    // For the month view, we generate slots by day
    if (currentView === "month") {
      viewInfo.visibleDays.forEach((day, dayIndex) => {
        slots.push({
          id: `day-${format(day, "yyyy-MM-dd")}`,
          start: startOfDay(day),
          end: endOfDay(day),
          startTime: "00:00",
          endTime: "23:59",
          index: dayIndex,
          isWorkingTime: !isWeekend(day),
          isAvailable: true,
        });
      });
    }
    // For week/day views, generate time slots
    else if (currentView === "week" || currentView === "day") {
      let slotIndex = 0;

      viewInfo.visibleDays.forEach((day) => {
        const startHour = config.startHour;
        const endHour = config.endHour;
        const slotDuration = config.duration;

        for (let hour = startHour; hour < endHour; hour++) {
          const slotsPerHour = 60 / slotDuration;

          for (let slot = 0; slot < slotsPerHour; slot++) {
            const slotStart = addMinutes(addHours(startOfDay(day), hour), slot * slotDuration);
            const slotEnd = addMinutes(slotStart, slotDuration);

            slots.push({
              id: `slot-${format(slotStart, "yyyy-MM-dd-HH-mm")}`,
              start: slotStart,
              end: slotEnd,
              startTime: format(slotStart, "HH:mm"),
              endTime: format(slotEnd, "HH:mm"),
              index: slotIndex++,
              isWorkingTime: !isWeekend(day),
              isAvailable: true,
            });
          }
        }
      });
    }
    // For the planning view, we also generate slots by day.
    else if (currentView === "planning") {
      viewInfo.visibleDays.forEach((day, dayIndex) => {
        slots.push({
          id: `planning-${format(day, "yyyy-MM-dd")}`,
          start: startOfDay(day),
          end: endOfDay(day),
          startTime: "00:00",
          endTime: "23:59",
          index: dayIndex,
          isWorkingTime: !isWeekend(day),
          isAvailable: true,
        });
      });
    }

    return slots;
  }, [currentView, viewInfo]);

  // Monthly grid generation
  const monthGrid = useMemo((): MonthGrid | undefined => {
    if (currentView !== "month") return undefined;

    const weeks: MonthGrid["weeks"] = [];

    // Group days per week (7 days per week)
    for (let i = 0; i < viewInfo.visibleDays.length; i += 7) {
      const weekDays = viewInfo.visibleDays.slice(i, i + 7);
      const weekStart = weekDays[0];

      weeks.push({
        id: `week-${format(weekStart, "yyyy-MM-dd")}`,
        days: weekDays.map((day) => ({
          date: day,
          isCurrentMonth: day.getMonth() === currentDate.getMonth(),
          isToday: isToday(day),
          isWeekend: isWeekend(day),
          dayOfWeek: getDay(day),
        })),
      });
    }

    return { weeks };
  }, [currentView, viewInfo, currentDate]);

  // Generate time slots for week/day
  const hourSlots = useMemo((): HourSlots[] | undefined => {
    if (currentView !== "week" && currentView !== "day") return undefined;

    const config = DEFAULT_TIME_SLOT_CONFIG;
    const hours: HourSlots[] = [];

    for (let hour = config.startHour; hour < config.endHour; hour++) {
      const hourTimeSlots = timeSlots.filter((slot) => {
        const slotHour = getHours(slot.start);

        return slotHour === hour;
      });

      hours.push({
        hour,
        formattedTime: format(
          addHours(startOfDay(new Date()), hour),
          config.format === "12h" ? "h a" : "HH:mm"
        ),
        slots: hourTimeSlots,
      });
    }

    return hours;
  }, [currentView, timeSlots]);

  // Utilities
  const utils = useMemo(
    (): TimeUtils => ({
      formatDate: (date: Date, pattern: string = "dd/MM/yyyy") => {
        return format(date, pattern, { locale });
      },

      isInViewRange: (date: Date) => {
        return !isBefore(date, viewInfo.startDate) && !isAfter(date, viewInfo.endDate);
      },

      getSlotForDate: (date: Date) => {
        return timeSlots.find((slot) => {
          return !isBefore(date, slot.start) && isBefore(date, slot.end);
        });
      },

      getDateForSlot: (slotId: string) => {
        const slot = timeSlots.find((s) => s.id === slotId);

        return slot?.start;
      },

      snapToGrid: (date: Date) => {
        const config = DEFAULT_TIME_SLOT_CONFIG;

        if (currentView === "month" || currentView === "planning") {
          return startOfDay(date);
        }

        // For week/day, snap to nearest time slot
        const dayStart = startOfDay(date);
        const minutesFromStart = Math.floor((date.getTime() - dayStart.getTime()) / (1000 * 60));
        const slotIndex = Math.round(minutesFromStart / config.duration);

        return addMinutes(dayStart, slotIndex * config.duration);
      },
    }),
    [timeSlots, viewInfo, currentView, locale]
  );

  return {
    timeSlots,
    viewInfo,
    monthGrid,
    hourSlots,
    utils,
  };
}
