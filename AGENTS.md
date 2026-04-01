# AGENTS.md

This repo contains two apps — an **Astro SSR app** (`astro-app/`) and a **Next.js App Router app** (`next-app/`). Both share PocketBase as a backend, TailwindCSS v4 for styling, and shadcn/ui (new-york style) for components.

## Build/Lint/Test Commands

Always check `pwd` before running commands. Use **pnpm** exclusively.

### Astro App (`astro-app/`)

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
```

No linter or test runner is configured for `astro-app`.

### Next.js App (`next-app/`)

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint (eslint-config-next + typescript)
```

No test runner is configured for `next-app`.

## Project Structure

```
astro-app/src/
  actions/        # Astro server actions (defineAction, exported as `server`)
  components/     # React .tsx components + ui/ (shadcn)
  layouts/        # .astro layouts (BaseLayout, Layout)
  pages/          # .astro pages + api/ routes
  lib/            # utilities, data fetching, definitions, types/
  stores/         # nanostores (query.ts, settings.ts)
  middleware.ts   # auth + posthog middleware

next-app/
  app/            # App Router pages, layouts, actions/
  components/     # React components + ui/ (shadcn)
  lib/            # utilities, pocketbase helpers, definitions, types/
```

## Code Style

### Imports

- Use `@/` path alias for all imports (configured in both tsconfigs)
- Use `import type { ... }` for type-only imports
- Import types from `@/lib/definitions` — never duplicate type definitions
- Zod is imported from `astro/zod` in astro-app, `zod` in next-app

### Types & Data Schemas

- Define Zod schemas first in `*/lib/definitions.ts`, then export inferred types: `export type FooType = z.infer<typeof FooZ>`
- Server Actions in next-app export their own state types (e.g., `LoginFormState`)
- Use TypeScript interfaces for all component props

### Components

- shadcn/ui style: **new-york**, base color **neutral**, CSS variables enabled
- Add shadcn components: `pnpm dlx shadcn@latest add <component>` (run from the respective app dir)
- Keep components focused, dumb, and reusable — prefer composition over complex props

### Astro App Specifics

- `.astro` files for layouts/pages/static content, `.tsx` for interactive React components
- Use `client:load` / `client:idle` / `client:visible` directives on React islands
- Astro Actions: defined in `src/actions/`, exported as `server` object, use `defineAction` from `astro:actions`
  - Call from pages: `Astro.callAction(actions.namespace.action, input)`
  - Call from React: `actions.namespace.action()` from `astro:actions`
  - Throw `ActionError` for client-visible errors
- Auth state: `Astro.locals.isAuthed`, `Astro.locals.user`, `Astro.locals.pb`
- Data fetching in React: React Query via nanostores (`@/stores/query`), pass `client` as second arg to `useQuery`/`useMutation`

### Next.js App Specifics

- Server Components by default; only use `'use client'` when hooks/events/browser APIs are needed
- Server Actions in `app/actions/`, marked with `'use server'` at file top
- Forms: `useActionState` hook, Zod validation, return `{ error?, success?, message? }`
- Auth: `getAuthenticatedUser()` / `initPocketBase()` from `@/lib/pocketbase-server`
- Handle `ClientResponseError` from PocketBase; check `NEXT_REDIRECT` digest for redirect errors

### Styling

- **TailwindCSS v4 only** — no inline styles, CSS modules, `@apply` in components, or styled-components
- Use **semantic color names** only: `primary`, `secondary`, `accent`, `destructive`, `muted`, `background`, `foreground`, `card`, `border`, `input`, `ring`
- **Never** use explicit colors like `bg-red-500`, `text-blue-600`, etc.
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode is automatic via CSS variables — no extra code needed
- Match existing spacing, typography, and layout patterns before adding new styles

### Error Handling

- Astro actions: throw `ActionError` (from `astro:actions`) for errors visible to clients
- Next.js server actions: return error state objects `{ error: string }`; handle `ClientResponseError` from PocketBase
- React components: check `.error` property on action responses; handle gracefully

### Naming Conventions

- Zod schemas: PascalCase with `Z` suffix (e.g., `UserZ`, `MatchupZ`)
- Inferred types: PascalCase with `Type` suffix (e.g., `UserType`, `MatchupType`)
- Files: kebab-case for utils (`data-client.ts`), PascalCase folders for component groups
- `cn()` utility from `@/lib/utils` for merging Tailwind classes

### Logging

- astro-app uses `pino` — get a logger via `getLogger('context:name')` from `@/lib/logger`
- next-app has its own logger in `@/lib/logger`

## Environment Variables

Both apps use `.env` files (gitignored). Key variables:
- `POCKETBASE_URL`, `POCKETBASE_PUBLIC_URL` — PocketBase instance
- `ADMIN_USER`, `ADMIN_PASSWORD` — superuser credentials (astro-app)
- `POSTHOG_API_HOST`, `POSTHOG_API_TOKEN` — analytics
- In astro-app, env vars are accessed via `astro:env/server` and `astro:env/client`
