// Export consolidé des hooks du calendrier
// src/components/ey-calendar/hooks/index.tsx

// Hooks principaux
export { useEyCalendarView } from "./useEyCalendarView";
export { useTimeCalculations } from "./useTimeCalculations";
export { useDragAndDrop } from "./useDragAndDrop";
export { useContainerHeight } from "./useContainerHeight";
export type { UseContainerHeightOptions, UseContainerHeightResult } from "./useContainerHeight";

// Headless pattern hooks
export { useEyCalendarClasses } from "./useEyCalendarClasses";
export type { UseEyCalendarClassesOptions, GetEyCalendarClass } from "./useEyCalendarClasses";
export { useEyCalendarLabels } from "./useEyCalendarLabels";
export { useEyCalendarComponents } from "./useEyCalendarComponents";
