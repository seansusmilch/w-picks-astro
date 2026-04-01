# AGENTS.md — next-app

Next.js App Router app sharing PocketBase backend with astro-app. TailwindCSS v4 + shadcn/ui (new-york style).

## Commands

Always check `pwd` before running commands. Use **pnpm** exclusively.

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint (eslint-config-next + typescript)
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run Vitest once (CI mode)
```

## Project Structure

```
app/            # App Router pages, layouts, actions/
components/     # React components + ui/ (shadcn)
lib/            # utilities, pocketbase helpers, definitions, types/
```

## Code Style

### Imports

- Use `@/` path alias
- Use `import type { ... }` for type-only imports
- Import types from `@/lib/definitions` — never duplicate type definitions
- Zod is imported from `zod`

### Types & Data Schemas

- Define Zod schemas first in `lib/definitions.ts`, then export inferred types: `export type FooType = z.infer<typeof FooZ>`
- Server Actions export their own state types (e.g., `LoginFormState`)
- Use TypeScript interfaces for all component props

### Components

- shadcn/ui style: **new-york**, base color **neutral**, CSS variables enabled
- Add shadcn components: `pnpm dlx shadcn@latest add <component>`
- Keep components focused, dumb, and reusable — prefer composition over complex props
- Server Components by default; only use `'use client'` when hooks/events/browser APIs are needed

### Server Actions

- In `app/actions/`, marked with `'use server'` at file top
- Forms: `useActionState` hook, Zod validation, return `{ error?, success?, message? }`
- Auth: `getAuthenticatedUser()` / `initPocketBase()` from `@/lib/pocketbase-server`
- Handle `ClientResponseError` from PocketBase; check `NEXT_REDIRECT` digest for redirect errors

### Styling

- **TailwindCSS v4 only** — no inline styles, CSS modules, `@apply` in components, or styled-components
- Use **semantic color names** only: `primary`, `secondary`, `accent`, `destructive`, `muted`, `background`, `foreground`, `card`, `border`, `input`, `ring`
- **Never** use explicit colors like `bg-red-500`, `text-blue-600`, etc.
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode is automatic via CSS variables

### Error Handling

- Server actions: return error state objects `{ error: string }`; handle `ClientResponseError` from PocketBase
- React components: check `.error` property on action responses; handle gracefully

### Naming Conventions

- Zod schemas: PascalCase with `Z` suffix (e.g., `UserZ`, `MatchupZ`)
- Inferred types: PascalCase with `Type` suffix (e.g., `UserType`, `MatchupType`)
- Files: kebab-case for utils, PascalCase folders for component groups
- `cn()` utility from `@/lib/utils` for merging Tailwind classes

### Logging

- Uses its own logger in `@/lib/logger`

## Testing

- **Framework**: Vitest + MSW (Mock Service Worker)
- **Location**: `__tests__/`
- **Rule**: Always add tests for new features
- **Structure**:
  - `__tests__/lib/<name>.test.ts` — lib utilities and helpers
  - `__tests__/actions/<name>.test.ts` — server actions
  - `__tests__/api/<name>.test.ts` — API route handlers
- **Mocking**:
  - PocketBase: `vi.mock('@/lib/pocketbase-server')`
  - Next.js: `vi.mock('next/cache')`, `vi.mock('next/headers')`, `vi.mock('next/navigation')`
  - HTTP: import `server` from `__tests__/setup/test-server` and use `server.use(...)`
- **Fixtures**: use factories from `__tests__/fixtures/pocketbase-mock.ts` (`mockUser()`, `mockMatchup()`, `mockPick()`, `mockGame()`)
- **Note**: All PocketBase record IDs must be exactly 15 characters (enforced by Zod `BaseZ` schema)

## Environment Variables

`.env` file (gitignored). Key variables:
- `POCKETBASE_URL`, `POCKETBASE_PUBLIC_URL` — PocketBase instance
- `POSTHOG_API_HOST`, `POSTHOG_API_TOKEN` — analytics
