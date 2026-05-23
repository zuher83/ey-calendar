// Mobile event dot indicator for month view cells

import { useOptions } from "../../../context/OptionsContext";
import type { EyCalendarEvent } from "../../../types";
import { cn } from "../../../utils/cn";
import { getEventColor } from "../../../utils/eventUtils";

export function MobileDot({ dayEvents }: { dayEvents: EyCalendarEvent[] }) {
  const { options } = useOptions();
  const getClass = options.getClass;

  if (dayEvents.length === 0) {
    return null;
  }

  return (
    <span
      className={cn(getClass("monthEventDot"), getClass("monthEventDotMobile"))}
      style={{ backgroundColor: getEventColor(dayEvents[0]) }}
    />
  );
}
