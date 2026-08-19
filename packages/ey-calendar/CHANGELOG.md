# Changelog

## 0.4.0

### Minor Changes

- [#9](https://github.com/zuher83/ey-calendar/pull/9) [`38e4c0a`](https://github.com/zuher83/ey-calendar/commit/38e4c0a6cfb4a7e735a380a6fc1b68ba7a3c16c5) Thanks [@zuher83](https://github.com/zuher83)! - Update `@atlaskit/pragmatic-drag-and-drop` from `^1.7.7` to `^3.0.0`

  Applications that already use pragmatic-drag-and-drop no longer end up with two copies of it. Each instance keeps its own usage ledger, so drop targets registered by one are invisible to the other: dragging an item between the calendar and the rest of the host application could not work, and the library was bundled twice.

  The v2 and v3 majors are additive for the single entry point this package uses, so the upgrade needs no behavioral change. The deprecated `/element/adapter` import is replaced by `/adapter/element-adapter`.

  The public API of the calendar is unchanged: the drag payload types are declared by this package and never re-exported from pragmatic-drag-and-drop.

## 0.3.0

### Minor Changes

- [#6](https://github.com/zuher83/ey-calendar/pull/6) [`b7df45b`](https://github.com/zuher83/ey-calendar/commit/b7df45b063333cf0000d341e1f3d4ce0cb4ea74b) Thanks [@zuher83](https://github.com/zuher83)! - Honor `maxEventsPerSlot`, and stop displaying a time for events that have none

  `maxEventsPerSlot` was declared as a public option, with a default value, but was
  read by no component: how many events a month cell displayed only ever derived
  from the available height. It now caps that budget, and the events it hides fall
  into the existing "+N more" overflow.

  Events no longer display a time when that time carries no meaning:
  - all-day events no longer print `00:00`. `isAllDay` used to route events between
    the all-day band and the grid without ever affecting their label;
  - the new `showEventTime` option hides the time of timestamped events whose hour
    is not meaningful to the user (`showEventTime: false`).

  Both rules also apply to the month tooltip and to accessible labels, which a
  consumer could not reach with CSS.

  The unused `ViewConfig` and `EyCalendarState` types are removed. Neither was
  exported, so the public type surface is unchanged.

## 0.2.0

### Minor Changes

- [#3](https://github.com/zuher83/ey-calendar/pull/3) [`7f7be97`](https://github.com/zuher83/ey-calendar/commit/7f7be97374dc043fe03f5aad6eea893af98b8578) Thanks [@zuher83](https://github.com/zuher83)! - Add lightweight view hooks and safer calendar interactions

  Expose narrower view hooks for navigation and visible event counts,
  support optimistic revert handling for event updates, and improve
  month, week, and planning behavior for keyboard, responsive, and
  multi-instance usage.

## 0.1.1

### Patch Changes

- [#1](https://github.com/zuher83/ey-calendar/pull/1) [`6b82c5a`](https://github.com/zuher83/ey-calendar/commit/6b82c5a801a91f727b962adb08df025e419bcdb0) Thanks [@zuher83](https://github.com/zuher83)! - Production build optimizations: minify CSS (-35%) and JS (-55%) bundles, migrate default components to pure CSS classes

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-20

### Added

- Initial release
- Headless calendar component
- Multiple views: Day, Week, Month, Planning
- Drag and drop support
- i18n support (EN, FR, DE)
- TypeScript support
- Default themes
