export function moveFocusByOffset(currentTarget: HTMLElement, selector: string, offset: number) {
  if (typeof document === "undefined") {
    return;
  }

  const focusableElements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );

  const currentIndex = focusableElements.indexOf(currentTarget);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = Math.min(Math.max(currentIndex + offset, 0), focusableElements.length - 1);
  focusableElements[nextIndex]?.focus();
}

export function moveFocusToBoundary(selector: string, boundary: "start" | "end") {
  if (typeof document === "undefined") {
    return;
  }

  const focusableElements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );

  if (focusableElements.length === 0) {
    return;
  }

  const target =
    boundary === "start"
      ? focusableElements[0]
      : focusableElements[focusableElements.length - 1];

  target?.focus();
}
