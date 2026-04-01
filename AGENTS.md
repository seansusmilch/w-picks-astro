# AGENTS.md

Use the **frontend-design** skill whenever working with UI. Use **pnpm** exclusively. Always check `pwd` before running commands.

- [**astro-app/**](./astro-app/AGENTS.md) — Astro SSR app with React islands, nanostores, and pino logging.
- [**next-app/**](./next-app/AGENTS.md) — Next.js App Router app with server actions, React Query, and Vitest testing.

Both apps share PocketBase as a backend, TailwindCSS v4, and shadcn/ui (new-york style, neutral base).

## Before You Push

**Always verify your work compiles and passes checks before committing and pushing.** A broken build on main means a broken deployment. Run the appropriate commands from the app's `AGENTS.md` — typecheck, lint, and build. Fix any errors before pushing. If you changed tests, run them too.

## Coolify Deployment

- **Project UUID**: `x0cgcs0oos80csocwwcw8wk4`
- **Environment UUID**: `u8wgw480wwwcsgockokkccko`
- **Next App UUID**: `wck44k4s0o0coc0g04coock0`
- **Astro App UUID**: `u800wskkwko0kggok44cko80`
