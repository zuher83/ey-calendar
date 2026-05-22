/**
 * CallbacksObserver component
 * Observes state changes and triggers appropriate callbacks
 * Must be placed inside all context providers
 *
 * Author: Zuher ELMAS de l'équipe Emoory
 */

import { useEffect, useRef } from "react";
import { useCallbacks } from "./CallbacksContext";
import {
  useViewCurrentDate,
  useViewCurrentView,
  useViewDateRange,
  useViewScrollPosition,
} from "./ViewContext";

/**
 * Component that observes state changes and triggers callbacks
 * This component doesn't render anything, it just observes and calls callbacks
 */
export function CallbacksObserver() {
  const { callbacks } = useCallbacks();
  const currentDate = useViewCurrentDate();
  const currentView = useViewCurrentView();
  const { startDate, endDate } = useViewDateRange();
  const scrollPosition = useViewScrollPosition();

  // Track previous values to detect changes
  const prevDateRange = useRef<{ start: Date; end: Date } | null>(null);
  const prevCurrentDate = useRef<Date | null>(null);
  const prevCurrentView = useRef<string | null>(null);
  const prevScrollPosition = useRef<{ x: number; y: number } | null>(null);

  // Trigger onDateRangeChange when date range changes
  useEffect(() => {
    const currentRange = { start: startDate, end: endDate };

    // Skip first render
    if (!prevDateRange.current) {
      prevDateRange.current = currentRange;

      return;
    }

    // Check if range actually changed
    const hasChanged =
      prevDateRange.current.start.getTime() !== currentRange.start.getTime() ||
      prevDateRange.current.end.getTime() !== currentRange.end.getTime();

    if (hasChanged) {
      callbacks.onDateRangeChange?.({ start: currentRange.start, end: currentRange.end });
      prevDateRange.current = currentRange;
    }
  }, [startDate, endDate, callbacks]);

  // Trigger onDateChange when current date changes
  useEffect(() => {
    // Skip first render
    if (!prevCurrentDate.current) {
      prevCurrentDate.current = currentDate;

      return;
    }

    // Check if date actually changed
    const hasChanged = prevCurrentDate.current.getTime() !== currentDate.getTime();

    if (hasChanged) {
      callbacks.onDateChange?.(currentDate);
      prevCurrentDate.current = currentDate;
    }
  }, [currentDate, callbacks]);

  // Trigger onViewChange when view mode changes
  useEffect(() => {
    // Skip first render
    if (!prevCurrentView.current) {
      prevCurrentView.current = currentView;

      return;
    }

    // Check if view actually changed
    const hasChanged = prevCurrentView.current !== currentView;

    if (hasChanged) {
      callbacks.onViewChange?.(currentView, currentDate);
      prevCurrentView.current = currentView;
    }
  }, [currentView, currentDate, callbacks]);

  // Trigger onScrollChange when scroll position changes
  useEffect(() => {
    // Skip first render
    if (!prevScrollPosition.current) {
      prevScrollPosition.current = scrollPosition;

      return;
    }

    // Check if position actually changed
    const hasChanged =
      prevScrollPosition.current.x !== scrollPosition.x ||
      prevScrollPosition.current.y !== scrollPosition.y;

    if (hasChanged) {
      callbacks.onScrollChange?.(scrollPosition);
      prevScrollPosition.current = scrollPosition;
    }
  }, [scrollPosition, callbacks]);

  // This component doesn't render anything
  return null;
}
