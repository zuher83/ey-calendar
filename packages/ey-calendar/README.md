# @emoory/ey-calendar

A React calendar component designed for building scheduling applications. Headless, themeable, and framework-agnostic styling.

[![npm version](https://img.shields.io/npm/v/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![npm downloads](https://img.shields.io/npm/dm/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zuher83/ey-calendar/blob/main/CONTRIBUTING.md)

## Features

- Callback-driven integration for your own state and backend logic
- Day, week, month, and planning views
- Full CSS bundle, structure-only CSS, theme-only CSS, or fully unstyled mode
- Drag and drop with resize support
- English, French, and German locale helpers
- React 18 and React 19 peer support
- ESM + CJS package surface with stable root exports
- TypeScript-first public API

## Philosophy

EyCalendar is built around three practical ideas:

### 1. Callback-driven integration

EyCalendar renders your events and emits callbacks for interactions. You keep the source of truth in local state, Redux, Zustand, or your backend, and decide how updates are persisted.

- Integrate with any state management approach
- Connect to REST, GraphQL, WebSockets, or local-only flows
- Keep permission rules, validation, and optimistic updates in your app
- Use convenience callbacks like `onEventCreate` when you want to return a new event directly

### 2. Headless styling

Structure and visuals are intentionally separated:

- Structure: layout, positioning, and grid logic are handled internally
- Theme: visual classes can be layered with the `theme` prop
- Headless: use `unstyled` with `classNames` when you want full control

### 3. Framework-agnostic styling

EyCalendar works with plain CSS, CSS Modules, Tailwind, or any other class-based system.

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

EyCalendar uses namespaced `ey-cal-*` classes and supports three main styling modes.

### CSS imports

```tsx
import "@emoory/ey-calendar/styles.css";
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

### Tailwind or class-based theme overlay

Copy the example theme from GitHub and adapt it locally:

- Theme source: https://github.com/zuher83/ey-calendar/blob/main/apps/examples/themes/tailwind.ts

```tsx
import { tailwindTheme } from "./themes/tailwind";

<EyCalendar events={events} theme={tailwindTheme} />;
```

You can then override specific visual classes:

```tsx
<EyCalendar
  events={events}
  theme={{
    ...tailwindTheme,
    root: "bg-white rounded-xl shadow-2xl",
    toolbar: "bg-slate-900 text-white",
    eventBar: "rounded-lg shadow-lg",
  }}
/>
```

### Fully headless mode

Use `unstyled` with `classNames` when you want to own the full styling layer:

```tsx
<EyCalendar
  events={events}
  unstyled
  classNames={{
    root: "my-calendar",
    toolbar: "my-toolbar",
    weekView: "my-week-view",
  }}
/>
```

## Stable Root Imports

The package root intentionally exposes the stable consumer surface:

```tsx
import {
  EyCalendar,
  EyCalendarToolbar,
  enCalendar,
  frCalendar,
  deCalendar,
  resolveTheme,
  cn,
} from "@emoory/ey-calendar";

import type {
  EyCalendarEvent,
  EyCalendarOptions,
  EyCalendarCallbacks,
  EyCalendarClassKey,
  EyCalendarClassNames,
  EyCalendarThemeClasses,
  DropTarget,
  TimeSlot,
} from "@emoory/ey-calendar";
```

Do not rely on internal package paths. If you need the example Tailwind overlay, copy it from GitHub instead of importing from a non-public subpath.

## Callback-driven integration

### Event interactions

- `onEventClick`
- `onEventDoubleClick`
- `onEventHover`
- `onEventDrag`
- `onEventDrop`
- `onEventResize`
- `onEventUpdate`
- `onEventDelete`
- `onEventCreate`

### Time slots and navigation

- `onTimeSlotClick`
- `onTimeSlotDoubleClick`
- `onDateChange`
- `onViewChange`
- `onDateRangeChange`
- `onShowMoreClick`
- `onRenderComplete`
- `onScrollChange`

### Backend integration example

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
  onTimeSlotClick={(date) => {
    openCreateEventModal(date);
  }}
/>
```

## API Overview

Core public props and callbacks:

```tsx
interface EyCalendarProps {
  events?: EyCalendarEvent[];
  defaultView?: "day" | "week" | "month" | "planning";
  defaultDate?: Date;
  height?: string | number;
  width?: string | number;
  theme?: Partial<Record<EyCalendarClassKey, string>>;
  unstyled?: boolean;
  classNames?: EyCalendarClassNames;

  onEventClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventDoubleClick?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventHover?: (event: EyCalendarEvent, e: React.MouseEvent) => void;
  onEventDrag?: (
    event: EyCalendarEvent,
    newStart: Date,
    newEnd: Date,
    newResourceId?: string
  ) => void;
  onEventResize?: (event: EyCalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventDrop?: (event: EyCalendarEvent, dropTarget: DropTarget) => void;
  onTimeSlotClick?: (date: Date, e: React.MouseEvent, resourceId?: string) => void;
  onTimeSlotDoubleClick?: (date: Date, e: React.MouseEvent, resourceId?: string) => void;
  onEventCreate?: (timeSlot: TimeSlot, resourceId?: string) => EyCalendarEvent | void;
  onEventUpdate?: (eventId: string, updates: Partial<EyCalendarEvent>) => void;
  onEventDelete?: (eventId: string) => void;
  onViewChange?: (view: ViewMode, date: Date) => void;
  onDateChange?: (date: Date) => void;
  onDateRangeChange?: (range: DateRange) => void;
  onShowMoreClick?: (
    date: Date,
    hiddenEvents: EyCalendarEvent[],
    allEvents: EyCalendarEvent[]
  ) => void;
  onRenderComplete?: (renderTime: number, eventCount: number) => void;
  onScrollChange?: (position: { x: number; y: number }) => void;

  options?: Partial<EyCalendarOptions>;
}
```

## Compatibility

- React 18 and React 19 via peer dependencies
- Stable root import from `@emoory/ey-calendar`
- Published CSS entrypoints: `styles.css`, `styles/structure.css`, `styles/theme.css`
- Works with bundled CSS, theme overlays, or fully headless `unstyled` mode
- Reference integrations available for [Vite + React](https://github.com/zuher83/ey-calendar/tree/main/apps/examples/vite-react) and [Next.js App Router](https://github.com/zuher83/ey-calendar/tree/main/apps/examples/nextjs-app)

## Current Status

Available today:

- Day, week, month, and planning views
- Click, double-click, drag, resize, create, delete, and month overflow interactions
- Callback-driven integration with your own state and backend flows
- Full CSS bundle, structure-only CSS, theme-only CSS, and headless styling overrides
- English, French, and German locale helpers
- Localized ARIA labels, live view announcements, and keyboard date navigation for week/month surfaces
- Hot-path optimizations for time slot calculations and week event grouping
- Curated npm export surface with stable root imports

## Roadmap Snapshot

Before 1.0, the main remaining work is:

- Finalize public API guarantees
- Raise automated coverage toward the 1.0 target
- Expand the example gallery and complete the API documentation
- Add repository-level React 18 consumer validation in addition to the current React 19 consumers

Not in the current public contract:

- Resource axis / multi-resource scheduling
- Virtualization

Future enhancements tracked separately:

- Year view
- Planning/List view improvements
- Mobile views and touch interactions

Full roadmap: https://github.com/zuher83/ey-calendar/blob/main/ROADMAP.md

## Examples

- Next.js App Router: https://github.com/zuher83/ey-calendar/tree/main/apps/examples/nextjs-app
- Vite + React: https://github.com/zuher83/ey-calendar/tree/main/apps/examples/vite-react
- Tailwind theme source: https://github.com/zuher83/ey-calendar/blob/main/apps/examples/themes/tailwind.ts

### Using the Tailwind theme example

1. Copy the theme file into your project:

   ```bash
   curl -o src/themes/calendar-tailwind.ts https://raw.githubusercontent.com/zuher83/ey-calendar/main/apps/examples/themes/tailwind.ts
   ```

2. Import and use it:

   ```tsx
   import { tailwindTheme } from "./themes/calendar-tailwind";

   <EyCalendar events={events} theme={tailwindTheme} />;
   ```

3. Customize it with object spread:

   ```tsx
   <EyCalendar
     events={events}
     theme={{
       ...tailwindTheme,
       eventBar: "rounded-xl shadow-xl hover:shadow-2xl",
     }}
   />
   ```

## Links

- Repository: https://github.com/zuher83/ey-calendar
- Playground: https://stackblitz.com/github/zuher83/ey-calendar/tree/main/apps/playground
- Changelog: https://github.com/zuher83/ey-calendar/blob/main/packages/ey-calendar/CHANGELOG.md
- Contributing: https://github.com/zuher83/ey-calendar/blob/main/CONTRIBUTING.md
- Roadmap: https://github.com/zuher83/ey-calendar/blob/main/ROADMAP.md
- Issues: https://github.com/zuher83/ey-calendar/issues
- Discussions: https://github.com/zuher83/ey-calendar/discussions

## Status

EyCalendar is in active development. The core functionality is stable, but breaking changes may occur before v1.0.

## License

MIT © [Zuher ELMAS - Emoory Team](https://github.com/zuher83/ey-calendar/blob/main/LICENSE)
