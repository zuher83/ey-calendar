# Creating Changesets

When you make changes to the `@emoory/ey-calendar` package, you need to create a changeset to document your changes.

## How to create a changeset

Run the following command in the root of the monorepo:

```bash
pnpm changeset
```

Follow the prompts:

1. **Which packages would you like to include?** — Select `@emoory/ey-calendar`
2. **What kind of change is this?** — Choose:
   - `major` — Breaking changes (e.g., API changes, removed features)
   - `minor` — New features (e.g., new props, new components)
   - `patch` — Bug fixes, documentation, internal refactors
3. **Write a summary** — Describe your changes clearly

## Changeset Message Guidelines

Write clear, user-facing messages that explain **what** changed and **why** it matters:

### ✅ Good Examples

```
Add support for custom event rendering via renderEvent prop

This allows users to completely customize how events appear in the calendar
```

```
Fix event overlap calculation in month view

Events were incorrectly positioned when spanning multiple weeks
```

```
BREAKING: Rename onDateChanged to onDateChange for consistency

The old prop name is no longer supported. Update your code:
- onDateChanged={(date) => ...}
+ onDateChange={(date) => ...}
```

### ❌ Bad Examples

```
Update code
```

```
Fix bug
```

```
Changes
```

## Changeset Types

- **Major (Breaking)** — Prefix with `BREAKING:` and explain migration path
- **Minor (Feature)** — Start with action verb: "Add", "Support", "Allow", "Enable"
- **Patch (Fix)** — Start with "Fix", "Improve", "Update", "Optimize"

## Multiple Changes

If you have multiple unrelated changes, create separate changesets:

```bash
pnpm changeset  # First change
pnpm changeset  # Second change
```

## Tips

- Keep messages concise but descriptive
- Think from the user's perspective
- Include migration instructions for breaking changes
- Reference issues when relevant: `Fixes #123`
