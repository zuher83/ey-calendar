import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
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

export function getVisibleDateRange(currentDate: Date, viewMode: ViewMode): VisibleDateRange {
  switch (viewMode) {
    case "month": {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

      return {
        start,
        end,
        days: eachDayOfInterval({ start, end }),
      };
    }

    case "week":
    case "planning": {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });

      return {
        start,
        end,
        days: eachDayOfInterval({ start, end }),
      };
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
