// Pure style computation helpers for EventBar
// Extracted to enable independent testing and reduce EventBar complexity

import { DEFAULT_TIME_SLOT_CONFIG } from "../../constants";
import type { EventPosition, EyCalendarEvent, GridGranularity } from "../../types";
import {
  desaturateColor,
  getEventStyles,
  getOptimalTextColor,
  getStripedBackground,
  parseColorToRgb,
} from "../../utils/eventUtils";

export interface ResizePreviewState {
  isResizing: boolean;
  startTime?: Date;
  endTime?: Date;
  handle?: "top" | "bottom";
}

/**
 * Computes the adjusted position during a resize preview.
 * Returns the original position unchanged when no resize is in progress.
 */
export function computeResizePreviewPosition(
  resizePreview: ResizePreviewState,
  position: EventPosition | undefined,
  cellHeight: number,
  granularity: GridGranularity = DEFAULT_TIME_SLOT_CONFIG.granularity
): EventPosition | undefined {
  if (!resizePreview.isResizing || !resizePreview.startTime || !resizePreview.endTime || !position) {
    return position;
  }

  const effectiveCellHeight = cellHeight || 64;

  const startHour = resizePreview.startTime.getHours();
  const startMinutes = resizePreview.startTime.getMinutes();
  const endHour = resizePreview.endTime.getHours();
  const endMinutes = resizePreview.endTime.getMinutes();

  let newTop: number;
  let newHeight: number;

  if (granularity === "hour") {
    newTop = startHour * effectiveCellHeight;
    newHeight = (endHour - startHour) * effectiveCellHeight;
  } else if (granularity === "half-hour") {
    const slotsPerHour = 2;
    const slotHeight = effectiveCellHeight / slotsPerHour;
    newTop = (startHour * slotsPerHour + startMinutes / 30) * slotHeight;
    newHeight =
      (endHour * slotsPerHour + endMinutes / 30 - (startHour * slotsPerHour + startMinutes / 30)) *
      slotHeight;
  } else {
    const slotsPerHour = 4;
    const slotHeight = effectiveCellHeight / slotsPerHour;
    newTop = (startHour * slotsPerHour + startMinutes / 15) * slotHeight;
    newHeight =
      (endHour * slotsPerHour +
        endMinutes / 15 -
        (startHour * slotsPerHour + startMinutes / 15)) *
      slotHeight;
  }

  return {
    ...position,
    top: newTop,
    height: Math.max(newHeight, 20),
  };
}

export interface EventStylesInput {
  event: EyCalendarEvent;
  tempPosition: EventPosition | undefined;
  viewMode: "month" | "week" | "day" | "planning";
  isSelected: boolean;
  isDragging: boolean;
  isInConflict: boolean;
  isResizing: boolean;
  chronologicalZIndex: number;
  isInSingleColumn: boolean;
  isHovered: boolean;
  isPastEvent: boolean;
}

/**
 * Computes the full inline style object for an event bar.
 * Pure function — no side effects, no hooks.
 */
export function computeEventStyles(
  input: EventStylesInput
): Record<string, string | number | undefined> {
  const {
    event,
    tempPosition,
    viewMode,
    isSelected,
    isDragging,
    isResizing,
    chronologicalZIndex,
    isInSingleColumn,
    isHovered,
    isPastEvent,
  } = input;

  const useFullWidth = viewMode === "week" || viewMode === "day";
  const baseStyles = getEventStyles(event, tempPosition, {
    useFullWidth,
    isInSingleColumn,
    isPastEvent,
  }) as Record<string, string | number | undefined>;

  const isStriped = event?.isStriped === true;
  const baseColor = event.color || "#3b82f6";

  if (isStriped && (viewMode === "week" || viewMode === "day")) {
    const effectiveColor = isPastEvent
      ? desaturateColor(event.backgroundColor || baseColor, 50, 20)
      : event.backgroundColor || baseColor;
    const effectiveBorderColor = isPastEvent ? desaturateColor(baseColor, 40, 10) : baseColor;

    baseStyles.background = getStripedBackground(effectiveColor);
    baseStyles.borderColor = effectiveBorderColor;
    baseStyles.borderWidth = "1px";
    baseStyles.borderStyle = "solid";

    const optimalColor = getOptimalTextColor(effectiveColor);
    baseStyles.color =
      isPastEvent
        ? optimalColor === "#000000"
          ? "rgb(80, 80, 80)"
          : "rgb(240, 240, 240)"
        : optimalColor;
  }

  const finalZIndex = isHovered ? chronologicalZIndex + 20 : chronologicalZIndex;
  const eventColor = event.color || "#3b82f6";
  const colorRgb = parseColorToRgb(eventColor);
  const shadowColor = colorRgb ? `${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}` : "59, 130, 246";

  return {
    ...baseStyles,
    zIndex: finalZIndex,
    opacity: isDragging ? 0.6 : isResizing ? 0.8 : 1,
    boxShadow: isSelected
      ? `0 0 0 2px rgba(${shadowColor}, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)`
      : isResizing
        ? `0 0 0 2px rgba(${shadowColor}, 0.6), 0 4px 12px rgba(${shadowColor}, 0.2)`
        : isHovered
          ? "0 8px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)"
          : input.isInConflict
            ? "0 2px 8px rgba(0, 0, 0, 0.1)"
            : "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: isDragging || isResizing ? "none" : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    borderWidth: isResizing ? "2px" : "1px",
    borderColor: isResizing ? eventColor : undefined,
  };
}
