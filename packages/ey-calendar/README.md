# @emoory/ey-calendar

A React calendar component designed for building scheduling applications. Headless, themeable, and framework-agnostic styling.

[![npm version](https://img.shields.io/npm/v/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![npm downloads](https://img.shields.io/npm/dm/@emoory/ey-calendar.svg)](https://www.npmjs.com/package/@emoory/ey-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Multiple Views** — Day, Week, Month, and Planning views  
🎨 **Headless & Themeable** — Full styling control with CSS variables or custom classes  
🖱️ **Drag & Drop** — Built-in event drag and drop with [@atlaskit/pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop)  
🌍 **i18n Ready** — English, French, German included (easily extensible)  
⚡ **Performance First** — Optimized rendering with React 18/19  
📦 **Tree-shakeable** — ESM + CJS, import only what you need  
♿ **Accessible** — Keyboard navigation and ARIA labels  
🔧 **TypeScript** — Fully typed API

## Installation

```bash
npm install @emoory/ey-calendar
```

## Usage

```tsx
import { EyCalendar } from "@emoory/ey-calendar";
import "@emoory/ey-calendar/styles.css";

function App() {
  return (
    <EyCalendar
      events={[
        {
          id: "1",
          title: "Meeting",
          start: new Date(2026, 0, 20, 10, 0),
          end: new Date(2026, 0, 20, 11, 0),
        },
      ]}
      defaultView="week"
    />
  );
}
```

## Styling

Three modes of usage:

1. **Standalone** — Import `styles.css`, works without any CSS framework
2. **Theme override** — Customize via CSS variables on `.ey-cal-root`
3. **Headless** — Use `unstyled` prop + custom `classNames`

```tsx
// CSS imports
import "@emoory/ey-calendar/styles.css"; // Full bundle
import "@emoory/ey-calendar/styles/structure.css"; // Layout only
import "@emoory/ey-calendar/styles/theme.css"; // Theme only
```

## Features

- Views: Day, Week, Month, Planning
- Drag & Drop: Move and resize events
- i18n: English, French, German
- TypeScript: Full type definitions
- React 18/19 compatible

## Documentation

See the [main repository](https://github.com/zuher83/ey-calendar) for full documentation.

## License

MIT © [Zuher ELMAS - Emoory Team](../../LICENSE)
