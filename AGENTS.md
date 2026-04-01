# AGENTS.md

This repo contains two apps sharing PocketBase as a backend, TailwindCSS v4 for styling, and shadcn/ui (new-york style).

- [**astro-app/**](./astro-app/AGENTS.md) — Astro SSR app
- [**next-app/**](./next-app/AGENTS.md) — Next.js App Router app

Always check `pwd` before running commands. Use **pnpm** exclusively.

## Shared Conventions

- `@/` path alias in both apps
- Zod schemas in `lib/definitions.ts`, inferred types as `FooType`
- shadcn/ui: new-york style, neutral base, CSS variables
- Semantic Tailwind color names only — never explicit colors
- kebab-case files, PascalCase component folders

## Shared Environment Variables

Both apps use `.env` (gitignored):
- `POCKETBASE_URL`, `POCKETBASE_PUBLIC_URL`
- `POSTHOG_API_HOST`, `POSTHOG_API_TOKEN`
- `ADMIN_USER`, `ADMIN_PASSWORD` (astro-app only)
