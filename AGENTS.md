# AGENTS.md

Use the **frontend-design** skill whenever working with UI.

This repo contains two apps — an **Astro SSR app** (`astro-app/`) and a **Next.js App Router app** (`next-app/`). Both share PocketBase as a backend, TailwindCSS v4 for styling, and shadcn/ui (new-york style) for components.

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

## Coolify Deployment

- **Project UUID**: `x0cgcs0oos80csocwwcw8wk4`
- **Environment UUID**: `u8wgw480wwwcsgockokkccko`
- **Next App UUID**: `wck44k4s0o0coc0g04coock0` — http://lab.thestu.xyz:8000/project/x0cgcs0oos80csocwwcw8wk4/environment/u8wgw480wwwcsgockokkccko/application/wck44k4s0o0coc0g04coock0
- **Astro App UUID**: `u800wskkwko0kggok44cko80` — http://lab.thestu.xyz:8000/project/x0cgcs0oos80csocwwcw8wk4/environment/u8wgw480wwwcsgockokkccko/application/u800wskkwko0kggok44cko80
