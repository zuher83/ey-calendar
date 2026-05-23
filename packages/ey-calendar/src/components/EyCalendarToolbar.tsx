// Toolbar with navigation and view selection
// src/components/ey-calendar/components/CalendarToolbar.tsx

import { useOptions } from "../context/OptionsContext";
import { useEyCalendarNavigation } from "../hooks/useEyCalendarView";
import type { ViewMode } from "../types";
import { DefaultButton } from "./defaults";

/**
 * Interface for CalendarToolbar props
 */
export interface CalendarToolbarProps {
  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Show navigation buttons
   */
  showNavigation?: boolean;

  /**
   * Show view selector
   */
  showViewSelector?: boolean;

  /**
   * Show "Today" button
   */
  showTodayButton?: boolean;

  /**
   * Show current period title
   */
  showTitle?: boolean;
}

/**
 * Toolbar with navigation and view selection
 */
export function EyCalendarToolbar({
  className = "",
  showNavigation = true,
  showViewSelector = true,
  showTodayButton = true,
  showTitle = true,
}: CalendarToolbarProps) {
  const { options } = useOptions();
  const { currentView, navigation, actions, utils } = useEyCalendarNavigation();
  const showTodayAction = showTodayButton && options.showToday !== false;
  const labels = options.labels;
  const getClass = options.getClass;

  // Get custom Button component if provided
  const Button = options.components?.Button ?? DefaultButton;

  return (
    <div
      className={getClass("toolbar") + (className ? ` ${className}` : "")}
      role="toolbar"
      aria-label={labels.ariaCalendarToolbar}
      data-eycalendar-toolbar=""
    >
      {/* Left section: Navigation */}
      <div className={getClass("toolbarNavigation")} data-eycalendar-toolbar-navigation="">
        {showTodayAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.goToToday}
            className={getClass("buttonToday")}
            data-eycalendar-button-today=""
          >
            {navigation.todayLabel}
          </Button>
        )}

        {showNavigation && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={actions.goToPrevious}
              disabled={!navigation.canGoPrevious}
              className={getClass("buttonNav")}
              title={navigation.previousLabel}
              aria-label={navigation.previousLabel}
              data-eycalendar-button-nav="prev"
            >
              <ChevronLeftIcon className={getClass("iconChevron")} aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={actions.goToNext}
              disabled={!navigation.canGoNext}
              className={getClass("buttonNav")}
              title={navigation.nextLabel}
              aria-label={navigation.nextLabel}
              data-eycalendar-button-nav="next"
            >
              <ChevronRightIcon className={getClass("iconChevron")} aria-hidden="true" />
            </Button>
          </>
        )}
      </div>

      {/* Center section: Title */}
      {showTitle && (
        <div className={getClass("toolbarTitle")} data-eycalendar-toolbar-title="">
          {utils.formatViewTitle()}
        </div>
      )}

      {/* Right section: View selector */}
      {showViewSelector && (
        <ViewSelector
          currentView={currentView}
          onViewChange={actions.setView}
          getViewLabel={utils.getViewLabel}
          getClass={getClass}
          Button={Button}
        />
      )}
    </div>
  );
}

/**
 * View selector component
 */
interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  getViewLabel: (view: ViewMode) => string;
  getClass: (key: import("../types").EyCalendarClassKey) => string;
  Button: React.ComponentType<import("../types").DefaultButtonProps>;
}

function ViewSelector({
  currentView,
  onViewChange,
  getViewLabel,
  getClass,
  Button,
}: ViewSelectorProps) {
  const views: ViewMode[] = ["month", "week", "day", "planning"];

  return (
    <div className={getClass("toolbarViewSelector")} data-eycalendar-view-selector="">
      {views.map((view) => (
        <Button
          key={view}
          variant={currentView === view ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view)}
          className={currentView === view ? getClass("buttonViewActive") : getClass("buttonView")}
          aria-pressed={currentView === view}
          data-eycalendar-button-view={view}
          data-active={currentView === view ? "true" : undefined}
        >
          {getViewLabel(view)}
        </Button>
      ))}
    </div>
  );
}

/**
 * Chevron left icon
 */
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/**
 * Chevron right icon
 */
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * Default export
 */
export default EyCalendarToolbar;
