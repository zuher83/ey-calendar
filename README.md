# EyCalendar

A React calendar component designed for building scheduling applications. Headless, themeable, and framework-agnostic styling.

[![npm version](https://img.shields.io/npm/v/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![npm downloads](https://img.shields.io/npm/dm/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zuher83/ey-calendar/blob/main/CONTRIBUTING.md)

## Features

🎯 **Callback-Driven Architecture** — Complete control over data flow and business logic  
✨ **Multiple Views** — Day, Week, Month, and Planning views  
🎨 **Headless & Themeable** — Full styling control with CSS variables or custom classes  
🖱️ **Drag & Drop** — Built-in event drag and drop with callbacks  
🌍 **i18n Ready** — English, French, German included (easily extensible)  
⚡ **Performance First** — Optimized rendering with React 18/19  
📦 **Tree-shakeable** — ESM + CJS, import only what you need  
♿ **Accessible** — Keyboard navigation and ARIA labels  
🔧 **TypeScript** — Fully typed API

## Philosophy

EyCalendar is built on three practical principles:

### 1. Callback-Driven Integration

EyCalendar renders your events and emits callbacks for user interactions. Keep your source of truth in local state, Redux, Zustand, or your backend, and react to drag, resize, creation, deletion, and navigation with your own business logic.

- ✅ Integrate with **any state management** (Redux, Zustand, Context, etc.)
- ✅ Connect to **any backend** (REST, GraphQL, WebSockets, etc.)
- ✅ Implement **your own permissions, validation, and optimistic updates**
- ✅ Use convenience callbacks like `onEventCreate` when you want to return a new event directly

### 2. Headless Styling

Complete separation between structure and visual design:

- **Structure** — Layout, positioning, and grid logic are handled internally
- **Theme** — Visual styling (colors, borders, typography) is customizable via CSS variables
- **Headless** — Full control with `unstyled` mode and custom `classNames`

### 3. Framework Agnostic

Works seamlessly with any CSS framework (Tailwind, Bootstrap, MUI) or no framework at all.

## Installation

```bash
npm install @emoory/ey-calendar
# or
pnpm add @emoory/ey-calendar
# or
yarn add @emoory/ey-calendar
```

## Quick Start

```tsx
import { useState } from "react";
import { EyCalendar, type EyCalendarEvent } from "@emoory/ey-calendar";
import "@emoory/ey-calendar/styles.css";

function App() {
  const [events, setEvents] = useState<EyCalendarEvent[]>([
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(2026, 0, 20, 10, 0),
      end: new Date(2026, 0, 20, 11, 0),
    },
  ]);

  return (
    <EyCalendar
      events={events}
      defaultView="week"
      onEventClick={(event) => {
        console.log("Clicked:", event);
      }}
      onEventDrop={(event, dropTarget) => {
        setEvents((prev) =>
          prev.map((currentEvent) =>
            currentEvent.id === event.id
              ? {
                  ...currentEvent,
                  start: dropTarget.dateStart,
                  end: dropTarget.dateEnd,
                }
              : currentEvent
          )
        );
      }}
      onTimeSlotClick={(date) => {
        setEvents((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            title: "New Event",
            start: date,
            end: new Date(date.getTime() + 60 * 60 * 1000),
          },
        ]);
      }}
    />
  );
}
```

## Styling

EyCalendar uses a CSS-first approach with namespaced classes (`ey-cal-*`) and CSS variables.

### Three modes of usage

| Mode               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| **Standalone**     | Import the CSS bundle, works without any framework         |
| **Theme override** | Customize via CSS variables on `.ey-cal-root`              |
| **Headless**       | Use `unstyled` prop + custom `classNames` for full control |

### CSS imports

```tsx
// Full bundle (structure + theme)
import "@emoory/ey-calendar/styles.css";
// Or import separately
import "@emoory/ey-calendar/styles/structure.css";
import "@emoory/ey-calendar/styles/theme.css";
```

### CSS variables

Override theme variables on `.ey-cal-root`:

```css
.ey-cal-root {
  --ey-cal-primary: #3b82f6;
  --ey-cal-background: #ffffff;
  --ey-cal-foreground: #1f2937;
  --ey-cal-border: #e5e7eb;
  --ey-cal-radius: 0.5rem;
}
```

### Headless mode (Tailwind, CSS Modules, etc.)

Copy the example Tailwind overlay from [apps/examples/themes/tailwind.ts](./apps/examples/themes/tailwind.ts) into your app and pass it to the calendar:

```tsx
import { tailwindTheme } from "./themes/tailwind";

<EyCalendar events={events} theme={tailwindTheme} />;
```

**Advanced: Override specific classes**

```tsx
import { tailwindTheme } from "./themes/tailwind";

<EyCalendar
  events={events}
  theme={{
    ...tailwindTheme,
    root: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl",
    toolbar: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
    eventBar: "rounded-lg shadow-lg hover:scale-105 transition-transform",
  }}
/>;
```

**Fully headless (no default styles)**

```tsx
<EyCalendar
  events={events}
  unstyled
  theme={{
    root: "my-calendar",
    toolbar: "my-toolbar",
    weekView: "my-week-view",
  }}
/>
```

> 💡 **Tip**: Start with the [Tailwind theme](./apps/examples/themes/tailwind.ts), copy it to your project, and customize it to match your design system.

## Callback-Driven Integration

EyCalendar exposes callbacks for clicks, drag and resize, creation, navigation, and render lifecycle.

### Event Interactions

- `onEventClick` — Handle event clicks (open modal, navigate, etc.)
- `onEventDoubleClick` — Handle double-clicks (quick edit, etc.)
- `onEventHover` — React to hover interactions
- `onEventDrag` — Observe drag preview updates
- `onEventDrop` — Handle the final drop result via a `DropTarget`
- `onEventResize` — Handle event resizing
- `onEventUpdate` — Generic event update handler
- `onEventDelete` — Handle event deletion
- `onEventCreate` — Return a new event from a clicked `TimeSlot`

### Time Slots & Navigation

- `onDateChange` — Track current date changes
- `onViewChange` — Track view mode changes with the active date
- `onDateRangeChange` — Track the visible date range
- `onTimeSlotClick` — Handle empty slot clicks
- `onTimeSlotDoubleClick` — Handle empty slot double-clicks
- `onShowMoreClick` — Handle month overflow interactions
- `onRenderComplete` — Observe render timing and event count
- `onScrollChange` — Observe scroll position changes

### Backend Integration Examples

#### REST API

```tsx
<EyCalendar
  events={events}
  onEventDrop={async (event, dropTarget) => {
    const updates = {
      start: dropTarget.dateStart,
      end: dropTarget.dateEnd,
    };

    updateLocalEvent(event.id, updates);

    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    } catch (error) {
      revertLocalEvent(event.id);
    }
  }}
/>
```

#### GraphQL

```tsx
<EyCalendar
  events={events}
  onEventDrop={(event, dropTarget) => {
    updateEvent({
      variables: {
        id: event.id,
        start: dropTarget.dateStart,
        end: dropTarget.dateEnd,
      },
      optimisticResponse: { ... },
    });
  }}
/>
```

#### State Management (Redux, Zustand)

```tsx
<EyCalendar
  events={events}
  onEventDrop={(event, dropTarget) => {
    dispatch(
      moveEvent({
        id: event.id,
        start: dropTarget.dateStart,
        end: dropTarget.dateEnd,
      })
    );
  }}
  onTimeSlotClick={(date) => {
    dispatch(openCreateEventModal(date));
  }}
/>
```

### Why Callback-Driven?

Traditional calendar libraries often:

- ❌ Manage event state internally (hard to integrate with backends)
- ❌ Force you into their state management patterns
- ❌ Require complex configuration to sync with your API

**EyCalendar is different:**

- ✅ **You can keep the source of truth outside the calendar**
- ✅ **You control the logic** — Every interaction is a callback
- ✅ **Works with anything** — REST, GraphQL, WebSockets, local state
- ✅ **Simple integration** — Just handle the callbacks you need

This makes EyCalendar perfect for:

- 🏢 Enterprise applications with complex business logic
- 🔌 Backend-first architectures (API-driven UIs)
- 🎨 Design systems that need calendar functionality
- 🚀 Rapid prototyping with full control

## API Overview

### Props

```tsx
interface EyCalendarProps {
  events?: EyCalendarEvent[];

  // View configuration
  defaultView?: "day" | "week" | "month" | "planning";
  defaultDate?: Date;
  height?: string | number;
  width?: string | number;

  // Styling
  theme?: Partial<Record<EyCalendarClassKey, string>>;
  unstyled?: boolean;
  classNames?: EyCalendarClassNames;

  // Callbacks
  onEventClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventDrop?: (event: EyCalendarEvent, dropTarget: DropTarget) => void;
  onEventResize?: (event: EyCalendarEvent, newStart: Date, newEnd: Date) => void;
  onTimeSlotClick?: (date: Date, e: React.MouseEvent) => void;
  onTimeSlotDoubleClick?: (date: Date, e: React.MouseEvent) => void;
  onEventCreate?: (timeSlot: TimeSlot) => EyCalendarEvent | void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: ViewMode, date: Date) => void;
  onShowMoreClick?: (
    date: Date,
    hiddenEvents: EyCalendarEvent[],
    allEvents: EyCalendarEvent[]
  ) => void;
  onRenderComplete?: (renderTime: number, eventCount: number) => void;

  // Grouped configuration remains available when preferred
  options?: Partial<EyCalendarOptions>;
}
```

**Real-world example:**

```tsx
import { fr } from "date-fns/locale";
import { tailwindTheme } from "./themes/tailwind";

<EyCalendar
  events={events}
  defaultDate={currentDate}
  defaultView="week"
  height="100%"
  onEventClick={handleEventClick}
  onEventDrop={(event, dropTarget) => {
    handleEventDrop(event.id, dropTarget.dateStart, dropTarget.dateEnd);
  }}
  onEventResize={(event, newStart, newEnd) => {
    handleEventResize(event.id, newStart, newEnd);
  }}
  onTimeSlotClick={handleTimeSlotClick}
  locale={fr}
  theme={{
    ...tailwindTheme,
    root: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
    toolbar: "bg-transparent border-b border-gray-200",
  }}
/>;
```

## Examples

Check out real-world integration examples:

- 🔷 [Next.js App Router](./apps/examples/nextjs-app) — Server Components + API Routes
- ⚡ [Vite + React](./apps/examples/vite-react) — Client-side state management
- 🎨 [Tailwind Theme](./apps/examples/themes/tailwind.ts) — Pre-built Tailwind classes (copy & customize)

### Using the Tailwind theme

1. **Copy the theme file** to your project:

   ```bash
   curl -o src/themes/calendar-tailwind.ts https://raw.githubusercontent.com/zuher83/ey-calendar/main/apps/examples/themes/tailwind.ts
   ```

2. **Import and use it**:

   ```tsx
   import { tailwindTheme } from "./themes/calendar-tailwind";

   <EyCalendar options={{ theme: tailwindTheme }} />;
   ```

3. **Customize it** with spread operator:
   ```tsx
   <EyCalendar
     options={{
       theme: {
         ...tailwindTheme,
         eventBar: "rounded-xl shadow-xl hover:shadow-2xl",
       },
     }}
   />
   ```

## Links

- [Documentation](https://github.com/zuher83/ey-calendar)
- [Playground](https://stackblitz.com/github/zuher83/ey-calendar/tree/main/apps/playground)
- [Changelog](./packages/ey-calendar/CHANGELOG.md)
- [Issues](https://github.com/zuher83/ey-calendar/issues)
- [Discussions](https://github.com/zuher83/ey-calendar/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) to get started.

## License

MIT © [Zuher ELMAS - Emoory Team](https://github.com/zuher83)

## Project structure

```
ey-calendar/
├── packages/
│   └── ey-calendar/          # Published npm package
├── apps/
│   ├── playground/           # Development environment
│   └── examples/             # Integration examples
│       ├── nextjs-app/
│       └── vite-react/
```

## Development

This project uses Turborepo with pnpm workspaces.

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development
pnpm build            # Build all packages
pnpm validate:publication # Validate the packed package contract and example consumers
pnpm validate:consumers # Build the Vite and Next example consumers
pnpm lint             # Run linter
```

## Roadmap

See our [ROADMAP.md](./ROADMAP.md) for planned features and upcoming releases.

## Status

EyCalendar is in active development. The core functionality is stable, but breaking changes may occur before v1.0.
