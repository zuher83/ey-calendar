---
"@emoory/ey-calendar": minor
---

Update `@atlaskit/pragmatic-drag-and-drop` from `^1.7.7` to `^3.0.0`

Applications that already use pragmatic-drag-and-drop no longer end up with two copies of it. Each instance keeps its own usage ledger, so drop targets registered by one are invisible to the other: dragging an item between the calendar and the rest of the host application could not work, and the library was bundled twice.

The v2 and v3 majors are additive for the single entry point this package uses, so the upgrade needs no behavioral change. The deprecated `/element/adapter` import is replaced by `/adapter/element-adapter`.

The public API of the calendar is unchanged: the drag payload types are declared by this package and never re-exported from pragmatic-drag-and-drop.
