// Tests for OptionsContext
import React from "react";
import { renderHook } from "@testing-library/react";
import { OptionsProvider, useOptions } from "../../src/context/OptionsContext";
import type { EyCalendarClassNames, EyCalendarThemeClasses } from "../../src/types";

describe("OptionsContext", () => {
  const createWrapper = (options = {}) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <OptionsProvider options={options}>{children}</OptionsProvider>
    );
    Wrapper.displayName = "OptionsTestWrapper";
    return Wrapper;
  };

  describe("Provider initialization", () => {
    it("provides default options when no options passed", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.options).toBeDefined();
      expect(result.current.options.unstyled).toBe(false);
      expect(result.current.options.autoHeight).toBe(false);
      expect(result.current.options.showWeekNumbers).toBe(false);
    });

    it("merges provided options with defaults", () => {
      const customOptions = {
        unstyled: true,
        autoHeight: true,
        showWeekNumbers: true,
      };

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(customOptions),
      });

      expect(result.current.options.unstyled).toBe(true);
      expect(result.current.options.autoHeight).toBe(true);
      expect(result.current.options.showWeekNumbers).toBe(true);
    });

    it("provides default components", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.options.components).toBeDefined();
      expect(typeof result.current.options.components).toBe("object");
    });

    it("merges custom components with defaults", () => {
      const CustomButton = () => <button>Custom</button>;
      const customOptions = {
        components: {
          Button: CustomButton,
        },
      };

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(customOptions),
      });

      expect(result.current.options.components?.Button).toBe(CustomButton);
    });
  });

  describe("Theme options", () => {
    it("accepts a string theme", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ theme: "default" }),
      });

      expect(result.current.options.theme).toBe("default");
    });

    it("accepts a custom theme object", () => {
      const customTheme: EyCalendarThemeClasses = {
        root: "custom-root bg-white",
        toolbar: "custom-toolbar",
      };

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ theme: customTheme }),
      });

      expect(result.current.options.theme).toBe(customTheme);
    });

    it("handles unstyled mode", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ unstyled: true }),
      });

      expect(result.current.options.unstyled).toBe(true);
    });

    it("accepts custom classNames", () => {
      const classNames: EyCalendarClassNames = {
        root: "custom-root",
        toolbar: "custom-toolbar",
      };

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ classNames }),
      });

      expect(result.current.options.classNames).toEqual(classNames);
    });
  });

  describe("Labels and locale", () => {
    it("provides default labels", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.options.labels).toBeDefined();
      expect(typeof result.current.options.labels).toBe("object");
    });

    it("accepts custom labels", () => {
      const customLabels = {
        today: "Custom Today",
        week: "Custom Week",
      };

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ labels: customLabels }),
      });

      expect(result.current.options.labels?.today).toBe("Custom Today");
    });

    it("accepts a locale", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const locale = { code: "fr" } as any;

      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ locale }),
      });

      expect(result.current.options.locale).toBe(locale);
    });
  });

  describe("Height options", () => {
    it("has autoHeight disabled by default", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.options.autoHeight).toBe(false);
    });

    it("enables autoHeight when specified", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ autoHeight: true }),
      });

      expect(result.current.options.autoHeight).toBe(true);
    });

    it("stores detected height", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ detectedHeight: 600 }),
      });

      expect(result.current.options.detectedHeight).toBe(600);
    });
  });

  describe("Week numbers option", () => {
    it("has showWeekNumbers disabled by default", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.options.showWeekNumbers).toBe(false);
    });

    it("enables showWeekNumbers when specified", () => {
      const { result } = renderHook(() => useOptions(), {
        wrapper: createWrapper({ showWeekNumbers: true }),
      });

      expect(result.current.options.showWeekNumbers).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("throws error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useOptions());
      }).toThrow("useOptions must be used within an OptionsProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("Memoization", () => {
    it("memoizes options object", () => {
      const customOptions = {
        unstyled: true,
        autoHeight: false,
      };

      const { result, rerender } = renderHook(() => useOptions(), {
        wrapper: createWrapper(customOptions),
      });

      const firstOptions = result.current.options;
      rerender();
      const secondOptions = result.current.options;

      expect(firstOptions).toBe(secondOptions);
    });
  });
});
