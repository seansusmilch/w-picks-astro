# AGENTS.md — astro-app

Astro SSR app sharing PocketBase backend with next-app. TailwindCSS v4 + shadcn/ui (new-york style).

## Commands

Always check `pwd` before running commands. Use **pnpm** exclusively.

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
```

No linter or test runner is configured.

## Project Structure

```
src/
  actions/        # Server actions (defineAction, exported as `server`)
  components/     # React .tsx components + ui/ (shadcn)
  layouts/        # .astro layouts (BaseLayout, Layout)
  pages/          # .astro pages + api/ routes
  lib/            # utilities, data fetching, definitions, types/
  stores/         # nanostores (query.ts, settings.ts)
  middleware.ts   # auth + posthog middleware
```

## Code Style

### Imports

- Use `@/` path alias
- Use `import type { ... }` for type-only imports
- Import types from `@/lib/definitions` — never duplicate type definitions
- Zod is imported from `astro/zod`

### Types & Data Schemas

- Define Zod schemas first in `lib/definitions.ts`, then export inferred types: `export type FooType = z.infer<typeof FooZ>`
- Use TypeScript interfaces for all component props

### Components

- shadcn/ui style: **new-york**, base color **neutral**, CSS variables enabled
- Add shadcn components: `pnpm dlx shadcn@latest add <component>`
- Keep components focused, dumb, and reusable — prefer composition over complex props
- `.astro` files for layouts/pages/static content, `.tsx` for interactive React components
- Use `client:load` / `client:idle` / `client:visible` directives on React islands

### Astro Actions

- Defined in `src/actions/`, exported as `server` object, use `defineAction` from `astro:actions`
- Call from pages: `Astro.callAction(actions.namespace.action, input)`
- Call from React: `actions.namespace.action()` from `astro:actions`
- Throw `ActionError` for client-visible errors
- Auth state: `Astro.locals.isAuthed`, `Astro.locals.user`, `Astro.locals.pb`

### Data Fetching

- React Query via nanostores (`@/stores/query`), pass `client` as second arg to `useQuery`/`useMutation`

### Styling

- **TailwindCSS v4 only** — no inline styles, CSS modules, `@apply` in components, or styled-components
- Use **semantic color names** only: `primary`, `secondary`, `accent`, `destructive`, `muted`, `background`, `foreground`, `card`, `border`, `input`, `ring`
- **Never** use explicit colors like `bg-red-500`, `text-blue-600`, etc.
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode is automatic via CSS variables

### Error Handling

- Throw `ActionError` (from `astro:actions`) for errors visible to clients
- React components: check `.error` property on action responses; handle gracefully

### Naming Conventions

- Zod schemas: PascalCase with `Z` suffix (e.g., `UserZ`, `MatchupZ`)
- Inferred types: PascalCase with `Type` suffix (e.g., `UserType`, `MatchupType`)
- Files: kebab-case for utils, PascalCase folders for component groups
- `cn()` utility from `@/lib/utils` for merging Tailwind classes

### Logging

- Uses `pino` — get a logger via `getLogger('context:name')` from `@/lib/logger`

## Environment Variables

`.env` file (gitignored). Key variables:
- `POCKETBASE_URL`, `POCKETBASE_PUBLIC_URL` — PocketBase instance
- `ADMIN_USER`, `ADMIN_PASSWORD` — superuser credentials
- `POSTHOG_API_HOST`, `POSTHOG_API_TOKEN` — analytics
- Accessed via `astro:env/server` and `astro:env/client`
