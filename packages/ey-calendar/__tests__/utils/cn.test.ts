// Tests for cn utility
import { cn } from "../../src/utils/cn";

describe("cn", () => {
  it("merges several classes", () => {
    expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
  });

  it("manages conditional classes", () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("ignores undefined values", () => {
    expect(cn("base", undefined, "other")).toBe("base other");
  });

  it("ignores null values", () => {
    expect(cn("base", null, "other")).toBe("base other");
  });

  it("ignores empty strings", () => {
    expect(cn("base", "", "other")).toBe("base other");
  });

  it("manages objects with conditions", () => {
    expect(
      cn("base", {
        active: true,
        disabled: false,
        hidden: false,
      })
    ).toBe("base active");
  });

  it("manages arrays", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("manages arrays with conditions", () => {
    const condition = false;
    expect(cn(["class1", condition && "class2", "class3"])).toBe("class1 class3");
  });

  it("deduplicates classes (clsx behavior)", () => {
    // Note: clsx does not automatically deduplicate identical classes
    expect(cn("btn", "btn", "btn-primary")).toBe("btn btn btn-primary");
  });

  it("returns an empty string if no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns an empty string if all arguments are falsy", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });

  it("manages a complex mix of types", () => {
    const isActive = true;
    const isDisabled = false;

    expect(
      cn(
        "base-class",
        ["array1", "array2"],
        {
          active: isActive,
          disabled: isDisabled,
        },
        isActive && "conditional-class",
        undefined,
        null,
        ""
      )
    ).toBe("base-class array1 array2 active conditional-class");
  });

  it("preserves the order of classes", () => {
    expect(cn("z-10", "z-20")).toBe("z-10 z-20");
  });

  it("manages Tailwind classes", () => {
    expect(
      cn("bg-blue-500", "hover:bg-blue-700", "text-white", "font-bold", "py-2", "px-4", "rounded")
    ).toBe("bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded");
  });

  it("manages conditional Tailwind modifiers", () => {
    const isLarge = true;
    const isSmall = false;

    expect(cn("btn", isLarge && "btn-lg", isSmall && "btn-sm")).toBe("btn btn-lg");
  });
});
