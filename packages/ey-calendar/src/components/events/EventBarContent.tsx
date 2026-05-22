// Renders the content area of an event bar based on display style
// Extracted from EventBar to separate render concerns from drag/resize logic

import { useOptions } from "../../context/OptionsContext";
import { useEyCalendarClasses } from "../../hooks/useEyCalendarClasses";
import { useEyCalendarComponents } from "../../hooks/useEyCalendarComponents";
import type { EventPosition, EyCalendarEvent } from "../../types";
import { cn } from "../../utils/cn";
import { formatDuration, formatTime } from "../../utils/dateUtils";
import { getEventDisplayTitle } from "../../utils/eventUtils";
import type { ResizePreviewState } from "./eventBarStyles";

export interface EventBarContentProps {
  event: EyCalendarEvent;
  displayStyle: "compact" | "minimal" | "full";
  position: EventPosition | undefined;
  viewMode: "month" | "week" | "day" | "planning";
  resizePreview: ResizePreviewState;
}

export function EventBarContent({
  event,
  displayStyle,
  position,
  viewMode,
  resizePreview,
}: EventBarContentProps) {
  const { options } = useOptions();
  const getClass = useEyCalendarClasses({
    theme: options.theme,
    unstyled: options.unstyled,
    classNames: options.classNames,
  });
  const Components = useEyCalendarComponents(options.components);
  const locale = options.locale;

  const title = getEventDisplayTitle(event, displayStyle === "compact" ? 15 : 40);

  const isSmallEvent = position && position.height < 50;
  const showTimePrefix =
    (viewMode === "week" || viewMode === "day") &&
    (displayStyle === "compact" || displayStyle === "minimal" || isSmallEvent);
  const timePrefix = showTimePrefix ? formatTime(event.start, locale) : "";

  switch (displayStyle) {
    case "compact":
      return (
        <div className={cn(getClass("eventContent"), getClass("eventContentCompact"))}>
          <span className={getClass("eventTitle")}>
            {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
            {title}
          </span>
        </div>
      );

    case "minimal":
      return (
        <div className={cn(getClass("eventContent"), getClass("eventContentMinimal"))}>
          <span className={getClass("eventTitle")}>
            {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
            {title}
          </span>
        </div>
      );

    case "full":
    default:
      return (
        <div className={cn(getClass("eventContent"), getClass("eventContentFull"))}>
          <div className={getClass("eventHeader")}>
            <h3 className={getClass("eventTitle")}>
              {timePrefix && <span className="mr-1 opacity-75">{timePrefix}</span>}
              {title}
            </h3>
          </div>

          {!isSmallEvent && (
            <div className={getClass("eventTime")}>
              {resizePreview.isResizing && resizePreview.startTime && resizePreview.endTime ? (
                <>
                  <span className={getClass("eventTimeResizing")}>
                    {formatTime(resizePreview.startTime, locale)}
                  </span>
                  <Components.SeparatorIcon />
                  <span className={getClass("eventTimeResizing")}>
                    {formatDuration(resizePreview.startTime, resizePreview.endTime)}
                  </span>
                </>
              ) : (
                <>
                  <span>{formatTime(event.start, locale)}</span>
                  <Components.SeparatorIcon />
                  <span>{formatDuration(event.start, event.end)}</span>
                </>
              )}
            </div>
          )}

          {position && position.height > 60 && event.description && (
            <p className={getClass("eventDescription")}>
              {event.description.substring(0, 50)}
              {event.description.length > 50 ? "..." : ""}
            </p>
          )}

          {position && position.height > 80 && event.location && (
            <div className={getClass("eventLocation")}>
              <Components.LocationIcon />
              <span className={getClass("eventLocationText")}>{event.location}</span>
            </div>
          )}
        </div>
      );
  }
}
