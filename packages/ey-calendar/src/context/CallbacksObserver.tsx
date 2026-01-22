/**
 * CallbacksObserver component
 * Observes state changes and triggers appropriate callbacks
 * Must be placed inside all context providers
 *
 * Author: Zuher ELMAS de l'équipe Emoory
 */

import { useEffect, useRef } from "react";
import { useCallbacks } from "./CallbacksContext";
import { useView } from "./ViewContext";

/**
 * Component that observes state changes and triggers callbacks
 * This component doesn't render anything, it just observes and calls callbacks
 */
export function CallbacksObserver() {
  const { callbacks } = useCallbacks();
  const { state: viewState } = useView();

  // Track previous values to detect changes
  const prevDateRange = useRef<{ start: Date; end: Date } | null>(null);
  const prevCurrentDate = useRef<Date | null>(null);
  const prevCurrentView = useRef<string | null>(null);
  const prevScrollPosition = useRef<{ x: number; y: number } | null>(null);

  // Trigger onDateRangeChange when date range changes
  useEffect(() => {
    const currentRange = { start: viewState.startDate, end: viewState.endDate };

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
  }, [viewState.startDate, viewState.endDate, callbacks]);

  // Trigger onDateChange when current date changes
  useEffect(() => {
    // Skip first render
    if (!prevCurrentDate.current) {
      prevCurrentDate.current = viewState.currentDate;

      return;
    }

    // Check if date actually changed
    const hasChanged = prevCurrentDate.current.getTime() !== viewState.currentDate.getTime();

    if (hasChanged) {
      callbacks.onDateChange?.(viewState.currentDate);
      prevCurrentDate.current = viewState.currentDate;
    }
  }, [viewState.currentDate, callbacks]);

  // Trigger onViewChange when view mode changes
  useEffect(() => {
    // Skip first render
    if (!prevCurrentView.current) {
      prevCurrentView.current = viewState.currentView;

      return;
    }

    // Check if view actually changed
    const hasChanged = prevCurrentView.current !== viewState.currentView;

    if (hasChanged) {
      callbacks.onViewChange?.(viewState.currentView, viewState.currentDate);
      prevCurrentView.current = viewState.currentView;
    }
  }, [viewState.currentView, viewState.currentDate, callbacks]);

  // Trigger onScrollChange when scroll position changes
  useEffect(() => {
    // Skip first render
    if (!prevScrollPosition.current) {
      prevScrollPosition.current = viewState.scrollPosition;

      return;
    }

    // Check if position actually changed
    const hasChanged =
      prevScrollPosition.current.x !== viewState.scrollPosition.x ||
      prevScrollPosition.current.y !== viewState.scrollPosition.y;

    if (hasChanged) {
      callbacks.onScrollChange?.(viewState.scrollPosition);
      prevScrollPosition.current = viewState.scrollPosition;
    }
  }, [viewState.scrollPosition, callbacks]);

  // This component doesn't render anything
  return null;
}
