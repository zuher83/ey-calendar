import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { ViewMode } from "../types";

export interface VisibleDateRange {
  start: Date;
  end: Date;
  days: Date[];
}

function buildVisibleDateRange(days: Date[]): VisibleDateRange {
  const start = startOfDay(days[0]);
  const end = endOfDay(days[days.length - 1]);

  return { start, end, days };
}

function filterVisibleDays(days: Date[], showWeekends: boolean): Date[] {
  return showWeekends ? days : days.filter((day) => !isWeekend(day));
}

export function getVisibleDateRange(
  currentDate: Date,
  viewMode: ViewMode,
  showWeekends: boolean = true
): VisibleDateRange {
  switch (viewMode) {
    case "month": {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      const days = filterVisibleDays(eachDayOfInterval({ start, end }), showWeekends);

      return buildVisibleDateRange(days);
    }

    case "week":
    case "planning": {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const days = filterVisibleDays(eachDayOfInterval({ start, end }), showWeekends);

      return buildVisibleDateRange(days);
    }

    case "day":
    default: {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);

      return {
        start,
        end,
        days: [new Date(start)],
      };
    }
  }
}
