import { useCallback } from "react";
import type React from "react";
import { useCallbacks } from "../context/CallbacksContext";
import { useEvents } from "../context/EventsContext";
import { useOptions } from "../context/OptionsContext";
import type { EyCalendarEvent } from "../types";

export function useEventKeyboardInteractions(
  event: EyCalendarEvent,
  onActivate?: (e: React.KeyboardEvent) => void
) {
  const { callbacks } = useCallbacks();
  const { deleteEvent } = useEvents();
  const { options } = useOptions();

  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate?.(e);
        return;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        options.enableDelete !== false &&
        options.readonly !== true &&
        !event.custom?.readOnly
      ) {
        e.preventDefault();
        e.stopPropagation();
        deleteEvent(event.id);
        callbacks?.onEventDelete?.(event.id);
      }
    },
    [callbacks, deleteEvent, event, onActivate, options.enableDelete, options.readonly]
  );
}
