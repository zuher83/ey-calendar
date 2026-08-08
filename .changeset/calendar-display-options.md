---
"@emoory/ey-calendar": minor
---

Honor `maxEventsPerSlot`, and stop displaying a time for events that have none

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
