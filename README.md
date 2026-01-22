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

EyCalendar is built on three core principles:

### 1. Callback-Driven (Uncontrolled Component)

The calendar **does not manage your data**. It renders events and delegates all interactions back to you via callbacks. This means:

- ✅ Integrate with **any state management** (Redux, Zustand, Context, etc.)
- ✅ Connect to **any backend** (REST, GraphQL, WebSockets, etc.)
- ✅ Implement **your own business logic** (permissions, validation, optimistic updates, etc.)
- ✅ Full control over **when and how** events are updated

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
      // Callback-driven: YOU control what happens
      onEventClick={(event) => {
        console.log("Clicked:", event);
        // Open modal, navigate, etc.
      }}
      onEventDrop={(eventId, newStart, newEnd) => {
        // Update your state or call your API
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, start: newStart, end: newEnd } : e))
        );
      }}
      onSlotClick={(date) => {
        // Create new event
        const newEvent = {
          id: crypto.randomUUID(),
          title: "New Event",
          start: date,
          end: new Date(date.getTime() + 3600000),
        };
        setEvents((prev) => [...prev, newEvent]);
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

Inject custom CSS classes directly via `options.theme`:

```tsx
import { tailwindTheme } from "@emoory/ey-calendar/themes/tailwind";

// Or copy from: apps/examples/themes/tailwind.ts

<EyCalendar
  events={events}
  options={{
    unstyled: false, // Keep structure, inject custom theme
    theme: tailwindTheme, // Use pre-made Tailwind theme
  }}
/>;
```

**Advanced: Override specific classes**

```tsx
import { tailwindTheme } from "./themes/tailwind";

<EyCalendar
  events={events}
  options={{
    theme: {
      ...tailwindTheme,
      // Override specific classes
      root: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl",
      toolbar: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
      eventBar: "rounded-lg shadow-lg hover:scale-105 transition-transform",
    },
  }}
/>;
```

**Fully headless (no default styles)**

```tsx
<EyCalendar
  events={events}
  options={{
    unstyled: true, // Disable all default styles
    theme: {
      root: "my-calendar",
      toolbar: "my-toolbar",
      weekView: "my-week-view",
      // ... map all 100+ class keys to your CSS
    },
  }}
/>
```

> 💡 **Tip**: Start with the [Tailwind theme](./apps/examples/themes/tailwind.ts), copy it to your project, and customize it to match your design system.

## Callback-Driven Integration

EyCalendar provides **14+ callbacks** for complete control over interactions:

### Event Interactions

- `onEventClick` — Handle event clicks (open modal, navigate, etc.)
- `onEventDoubleClick` — Handle double-clicks (quick edit, etc.)
- `onEventDrop` — Handle drag & drop (update backend, optimistic UI)
- `onEventResize` — Handle event resizing
- `onEventUpdate` — Generic event update handler
- `onEventDelete` — Handle event deletion
- `onEventCreate` — Handle new event creation

### Navigation & Selection

- `onDateChange` — Track current date changes
- `onViewChange` — Track view mode changes
- `onSlotClick` — Handle empty slot clicks (create event)
- `onCellClick` — Handle cell clicks
- `onDateClick` — Handle date header clicks

### Backend Integration Examples

#### REST API

```tsx
<EyCalendar
  events={events}
  onEventDrop={async (eventId, newStart, newEnd) => {
    // Optimistic update
    updateLocalEvent(eventId, newStart, newEnd);

    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({ start: newStart, end: newEnd }),
      });
    } catch (error) {
      // Rollback on error
      revertLocalEvent(eventId);
    }
  }}
/>
```

#### GraphQL

```tsx
<EyCalendar
  events={events}
  onEventDrop={(eventId, newStart, newEnd) => {
    updateEvent({
      variables: { id: eventId, start: newStart, end: newEnd },
      optimisticResponse: { ... },
    });
  }}
/>
```

#### State Management (Redux, Zustand)

```tsx
<EyCalendar
  events={events}
  onEventDrop={(eventId, newStart, newEnd) => {
    dispatch(moveEvent({ id: eventId, start: newStart, end: newEnd }));
  }}
  onSlotClick={(date) => {
    dispatch(openCreateEventModal(date));
  }}
/>
}
```

### Headless mode

For complete styling control (Tailwind, CSS-in-JS, etc.):

Why Callback-Driven?

Traditional calendar libraries often:

- ❌ Manage event state internally (hard to integrate with backends)
- ❌ Force you into their state management patterns
- ❌ Require complex configuration to sync with your API

**EyCalendar is different:**

- ✅ **You own the data** — Events are just props
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
  // Data (YOU control this)
  events: EyCalendarEvent[];

  // View configuration
  defaultView?: "day" | "week" | "month" | "planning";
  defaultDate?: Date;
  height?: string | number;
  width?: string | number;

  // Callbacks (YOU implement the logic)
  onEventClick?: (event: EyCalendarEvent) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
  onEventResize?: (eventId: string, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: ViewMode) => void;
  onShowMoreClick?: (
    date: Date,
    hiddenEvents: EyCalendarEvent[],
    allEvents: EyCalendarEvent[]
  ) => void;
  // ... 10+ more callbacks

  // Options (styling, features, i18n)
  options?: {
    // Styling
    theme?: Partial<Record<EyCalendarClassKey, string>>; // Inject custom CSS classes
    unstyled?: boolean; // Disable default styles

    // Features
    enableDragDrop?: boolean;
    enableResize?: boolean;
    enableCreate?: boolean;
    showWeekNumbers?: boolean;

    // i18n
    locale?: Locale; // date-fns locale
    labels?: EyCalendarLabels;
  };
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
  onEventDrop={handleEventDrop}
  onEventResize={handleEventResize}
  onSlotClick={handleTimeSlotClick}
  options={{
    enableDragDrop: true,
    enableResize: true,
    showWeekNumbers: true,
    locale: fr,
    theme: {
      ...tailwindTheme,
      // Override specific classes for dark mode
      root: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
      toolbar: "bg-transparent border-b border-gray-200",
    },
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
pnpm lint             # Run linter
```

## Roadmap

See our [ROADMAP.md](./ROADMAP.md) for planned features and upcoming releases.

## Status

EyCalendar is in active development. The core functionality is stable, but breaking changes may occur before v1.0.

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) to get started.

## Links

- [Documentation](https://github.com/zuher83/ey-calendar) (comming soon)
- [Changelog](./packages/ey-calendar/CHANGELOG.md)
- [Issues](https://github.com/zuher83/ey-calendar/issues)
- [Discussions](https://github.com/zuher83/ey-calendar/discussions)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT © [Zuher ELMAS - Emoory Team](LICENSE)
