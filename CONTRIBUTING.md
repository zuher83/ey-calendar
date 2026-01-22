# Contributing

Guidelines for contributing to EyCalendar.

## Setup

```bash
git clone https://github.com/zuher83/ey-calendar.git
cd ey-calendar
pnpm install
```

## Development

```bash
pnpm dev                                    # Start all apps
pnpm dev --filter=playground                # Start playground only
pnpm dev --filter=@emoory/ey-calendar       # Watch library only
pnpm build                                  # Build all
pnpm build --filter=@emoory/ey-calendar     # Build library only
pnpm lint                                   # Lint
pnpm lint:fix                               # Fix lint issues
pnpm format                                 # Format code
```

## Project structure

```
packages/ey-calendar/src/
├── components/       # React components
│   ├── views/        # Day, Week, Month, Planning views
│   ├── events/       # Event rendering (EventBar)
│   └── defaults/     # Default replaceable components
├── context/          # React contexts (composite pattern)
├── hooks/            # Custom hooks
├── types/            # TypeScript definitions
├── styles/           # CSS files (structure + theme)
├── themes/           # Theme resolver
├── locales/          # i18n (en, fr, de)
└── utils/            # Utility functions
```

## Conventions

### TypeScript

- Strict mode enabled
- Use `type` for simple aliases, `interface` for extensible objects
- Export types from `types/index.ts`

### Components

- Functional components with TypeScript
- Props interface exported with component

### Naming

- Components: `PascalCase`
- Hooks: `useCamelCase`
- Files: `PascalCase.tsx` (components), `camelCase.ts` (utils)
- CSS classes: `ey-cal-*` namespace

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) in **English**:

```
type: short summary (max 50 chars)

Longer description explaining WHY, not just WHAT.
Wrap lines at 72 characters.
```

**Types:** `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `chore`, `revert`, `i18n`

**Examples:**

```
feat: add week number display option
fix: prevent event drop on past time slots
refactor: split monolithic context into specialized contexts
chore: update date-fns to v4.1.0
```

See [.github/copilot-commit-instructions.md](.github/copilot-commit-instructions.md) for detailed guidelines.

## Pull requests

1. Create a branch from `main`
2. Make changes
3. Run `pnpm lint` and `pnpm build`
4. Create a changeset if modifying the library:
   ```bash
   pnpm changeset
   ```
5. Open a PR

## Architecture notes

### Headless pattern

The calendar uses a 3-level class system:

1. **Structure** (`styles/classes.ts`) — Layout classes (`ey-cal-*`)
2. **Theme** (`styles/ey-calendar.theme.css`) — Visual styles via CSS variables
3. **Custom** (`classNames` prop) — User overrides

### Context architecture

Composite provider pattern with separate contexts:

- `ViewContext` — Current view state
- `EventsContext` — Event data
- `OptionsContext` — Configuration
- `CallbacksContext` — User callbacks
- `DragDropContext` — Drag & drop state

### Data attributes

Dynamic states use `data-*` attributes instead of classes:

- `data-today`, `data-past`, `data-selected`
- `data-dragging`, `data-conflict`, `data-hovered`
- `data-outside-month`, `data-weekend`

## Questions

Open an issue on GitHub.
