// Tests for useEyCalendarClasses hook
import { renderHook } from "@testing-library/react";
import { useEyCalendarClasses } from "../../src/hooks/useEyCalendarClasses";
import type { EyCalendarClassNames, EyCalendarThemeClasses } from "../../src/types";

describe("useEyCalendarClasses", () => {
  describe("Default classes", () => {
    it("returns the default structural classes", () => {
      const { result } = renderHook(() => useEyCalendarClasses());
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root");
      expect(getClass("toolbar")).toContain("ey-cal-toolbar");
      expect(getClass("weekView")).toContain("ey-cal-week-view");
    });

    it("returns an empty string for an invalid key", () => {
      const { result } = renderHook(() => useEyCalendarClasses());
      const getClass = result.current;

      // @ts-expect-error - Test avec une clé invalide
      expect(getClass("invalidKey")).toBe("");
    });
  });

  describe("Mode unstyled", () => {
    it("returns only structural classes when unstyled=true", () => {
      const { result } = renderHook(() => useEyCalendarClasses({ unstyled: true }));
      const getClass = result.current;

      const rootClass = getClass("root");
      expect(rootClass).toContain("ey-cal-root");

      // Ne devrait pas contenir de classes de thème
      expect(rootClass.split(" ").length).toBe(1);
    });

    it("still applies custom classNames in unstyled mode", () => {
      const customClassNames: EyCalendarClassNames = {
        root: "custom-root",
      };

      const { result } = renderHook(() =>
        useEyCalendarClasses({ unstyled: true, classNames: customClassNames })
      );
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root");
      expect(getClass("root")).toContain("custom-root");
    });
  });

  describe("Custom theme", () => {
    it("applies a custom theme", () => {
      const customTheme: EyCalendarThemeClasses = {
        root: "theme-root bg-white",
        toolbar: "theme-toolbar",
      };

      const { result } = renderHook(() => useEyCalendarClasses({ theme: customTheme }));
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root"); // Structure
      expect(getClass("root")).toContain("theme-root"); // Thème
      expect(getClass("root")).toContain("bg-white"); // Thème
    });

    it('uses the default theme if theme="default"', () => {
      const { result } = renderHook(() => useEyCalendarClasses({ theme: "default" }));
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root");
    });
  });

  describe("ClassNames custom (highest priority)", () => {
    it("applies custom classNames over everything", () => {
      const customClassNames: EyCalendarClassNames = {
        root: "override-root",
      };

      const { result } = renderHook(() => useEyCalendarClasses({ classNames: customClassNames }));
      const getClass = result.current;

      const rootClass = getClass("root");
      expect(rootClass).toContain("ey-cal-root"); // Structure
      expect(rootClass).toContain("override-root"); // Custom (dernière)
    });

    it("correctly merges the 3 levels (structure + theme + custom)", () => {
      const customTheme: EyCalendarThemeClasses = {
        root: "theme-bg",
      };
      const customClassNames: EyCalendarClassNames = {
        root: "custom-border",
      };

      const { result } = renderHook(() =>
        useEyCalendarClasses({
          theme: customTheme,
          classNames: customClassNames,
        })
      );
      const getClass = result.current;

      const rootClass = getClass("root");
      expect(rootClass).toContain("ey-cal-root"); // Level 1: Structure
      expect(rootClass).toContain("theme-bg"); // Level 2: Theme
      expect(rootClass).toContain("custom-border"); // Level 3: Custom
    });

    it("does not modify other keys not defined in classNames", () => {
      const customClassNames: EyCalendarClassNames = {
        root: "custom-root",
      };

      const { result } = renderHook(() => useEyCalendarClasses({ classNames: customClassNames }));
      const getClass = result.current;

      // toolbar n'a pas de custom className
      expect(getClass("toolbar")).toContain("ey-cal-toolbar");
      expect(getClass("toolbar")).not.toContain("custom-root");
    });
  });

  describe("Memoization", () => {
    it("returns the same reference if the options do not change", () => {
      const { result, rerender } = renderHook(() => useEyCalendarClasses());

      const getClass1 = result.current;
      const result1 = getClass1("root");

      rerender();

      const getClass2 = result.current;
      const result2 = getClass2("root");

      // Les résultats doivent être identiques
      expect(result1).toBe(result2);
    });

    it("returns a new function if theme changes", () => {
      const { result, rerender } = renderHook(({ theme }) => useEyCalendarClasses({ theme }), {
        initialProps: { theme: undefined as EyCalendarThemeClasses | undefined },
      });

      const getClass1 = result.current;

      rerender({ theme: { root: "new-theme" } });
      const getClass2 = result.current;

      expect(getClass1).not.toBe(getClass2);
    });

    it("returns a new function if unstyled changes", () => {
      const { result, rerender } = renderHook(
        ({ unstyled }) => useEyCalendarClasses({ unstyled }),
        {
          initialProps: { unstyled: false },
        }
      );

      const getClass1 = result.current;

      rerender({ unstyled: true });
      const getClass2 = result.current;

      expect(getClass1).not.toBe(getClass2);
    });
  });

  describe("Classes Tailwind", () => {
    it("works with Tailwind classes", () => {
      const tailwindTheme: EyCalendarThemeClasses = {
        root: "bg-white border border-gray-200 rounded-lg shadow-sm",
        toolbar: "bg-gray-50 border-b border-gray-200 px-4 py-2",
      };

      const { result } = renderHook(() => useEyCalendarClasses({ theme: tailwindTheme }));
      const getClass = result.current;

      expect(getClass("root")).toContain("bg-white");
      expect(getClass("root")).toContain("border-gray-200");
      expect(getClass("toolbar")).toContain("bg-gray-50");
    });

    it("manages Tailwind conditional classes", () => {
      const isActive = true;
      const customClassNames: EyCalendarClassNames = {
        button: isActive ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-300",
      };

      const { result } = renderHook(() => useEyCalendarClasses({ classNames: customClassNames }));
      const getClass = result.current;

      expect(getClass("button")).toContain("bg-blue-500");
      expect(getClass("button")).toContain("hover:bg-blue-700");
    });
  });

  describe("Edge cases", () => {
    it("handles an empty classNames object", () => {
      const { result } = renderHook(() => useEyCalendarClasses({ classNames: {} }));
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root");
    });

    it("manages classNames undefined", () => {
      const { result } = renderHook(() => useEyCalendarClasses({ classNames: undefined }));
      const getClass = result.current;

      expect(getClass("root")).toContain("ey-cal-root");
    });

    it("manages a partially defined theme", () => {
      const partialTheme: EyCalendarThemeClasses = {
        root: "custom-root",
        // The other keys are not defined.
      };

      const { result } = renderHook(() => useEyCalendarClasses({ theme: partialTheme }));
      const getClass = result.current;

      expect(getClass("root")).toContain("custom-root");
      expect(getClass("toolbar")).toContain("ey-cal-toolbar");
      expect(getClass("toolbar")).not.toContain("custom-root");
    });
  });
});
