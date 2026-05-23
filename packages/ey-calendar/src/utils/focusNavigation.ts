const CALENDAR_ROOT_SELECTOR = "[data-eycalendar-root]";

function getFocusableElements(currentTarget: HTMLElement, selector: string): HTMLElement[] {
  if (typeof document === "undefined") {
    return [];
  }

  const rootElement = currentTarget.closest<HTMLElement>(CALENDAR_ROOT_SELECTOR);
  const focusScope: ParentNode = rootElement ?? document;

  return Array.from(focusScope.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

export function moveFocusByOffset(currentTarget: HTMLElement, selector: string, offset: number) {
  const focusableElements = getFocusableElements(currentTarget, selector);

  const currentIndex = focusableElements.indexOf(currentTarget);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = Math.min(Math.max(currentIndex + offset, 0), focusableElements.length - 1);
  focusableElements[nextIndex]?.focus();
}

export function moveFocusToBoundary(
  currentTarget: HTMLElement,
  selector: string,
  boundary: "start" | "end"
) {
  const focusableElements = getFocusableElements(currentTarget, selector);

  if (focusableElements.length === 0) {
    return;
  }

  const target =
    boundary === "start" ? focusableElements[0] : focusableElements[focusableElements.length - 1];

  target?.focus();
}
