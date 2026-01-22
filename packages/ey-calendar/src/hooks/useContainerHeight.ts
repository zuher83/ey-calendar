/**
 * Hook to automatically detect container height using ResizeObserver
 * Provides fallback to default value if detection fails
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import { useEffect, useRef, useState } from "react";

/**
 * Configuration options for useContainerHeight hook
 */
export interface UseContainerHeightOptions {
  /**
   * Enable automatic height detection
   * @default false
   */
  enabled?: boolean;

  /**
   * Fallback height in pixels when detection fails or is disabled
   * @default 600
   */
  fallbackHeight?: number;

  /**
   * Debounce delay in milliseconds for resize events
   * @default 100
   */
  debounceMs?: number;

  /**
   * Callback fired when height changes
   */
  onHeightChange?: (height: number) => void;
}

/**
 * Return value of useContainerHeight hook
 */
export interface UseContainerHeightResult {
  /**
   * Ref to attach to the container element
   */
  containerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Current detected height, or fallback value
   */
  height: number;

  /**
   * Whether height detection is active and working
   */
  isDetecting: boolean;
}

/**
 * Hook to automatically detect and track container height using ResizeObserver
 *
 * @example
 * ```tsx
 * const { containerRef, height, isDetecting } = useContainerHeight({
 *   enabled: true,
 *   fallbackHeight: 600,
 *   debounceMs: 100,
 * });
 *
 * return (
 *   <div ref={containerRef} style={{ height: '100%' }}>
 *     <div style={{ height: `${height}px` }}>Content</div>
 *   </div>
 * );
 * ```
 */
export function useContainerHeight(
  options: UseContainerHeightOptions = {}
): UseContainerHeightResult {
  const { enabled = false, fallbackHeight = 600, debounceMs = 100, onHeightChange } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(fallbackHeight);
  const [isDetecting, setIsDetecting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    // Reset height when transitioning from enabled to disabled
    if (prevEnabledRef.current && !enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeight(fallbackHeight);
    }
    prevEnabledRef.current = enabled;
  }, [enabled, fallbackHeight]);

  useEffect(() => {
    // If not enabled, reset detecting state
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDetecting(false);
      return;
    }

    const element = containerRef.current;

    // If no element, cannot detect
    if (!element) {
      setIsDetecting(false);
      return;
    }

    // Check ResizeObserver support
    if (typeof ResizeObserver === "undefined") {
      console.warn("[useContainerHeight] ResizeObserver not supported, using fallback height");
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the height update
      timeoutRef.current = setTimeout(() => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height;

          // Only update if height is valid (> 0)
          if (newHeight > 0) {
            setHeight(newHeight);
            onHeightChange?.(newHeight);
          } else {
            // Fallback if height is 0
            setHeight(fallbackHeight);
          }
        }
      }, debounceMs);
    });

    // Start observing
    resizeObserver.observe(element);

    // Get initial height immediately
    const initialHeight = element.getBoundingClientRect().height;
    if (initialHeight > 0) {
      setHeight(initialHeight);
      onHeightChange?.(initialHeight);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsDetecting(false);
    };
  }, [enabled, fallbackHeight, debounceMs, onHeightChange]);

  return {
    containerRef,
    height,
    isDetecting,
  };
}

export default useContainerHeight;
