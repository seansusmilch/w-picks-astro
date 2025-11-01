# W Picks Astro

A "pick-em" website for NBA

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm run build`           | Build your production site to `./dist/`          |
| `pnpm run preview`         | Preview your build locally, before deploying     |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |

## 🪵 Logging

The project uses [Pino](https://github.com/pinojs/pino) for logging. Pino is a very low overhead Node.js logger that outputs JSON logs and supports various transport options.

### How to Use the Logger

You can use the default logger or create a named logger to identify which file a log is coming from:

```typescript
// Default logger
import logger from '@/lib/logger';
logger.info('Using default logger');

// Named logger (recommended)
import { getLogger } from '@/lib/logger';
const logger = getLogger('my-module-name');
logger.info('This log will be tagged with [my-module-name]');
```

Logger levels:
```typescript
// Different log levels
logger.trace({ someData: 'value' }, 'Trace message');
logger.debug({ someData: 'value' }, 'Debug message');
logger.info({ someData: 'value' }, 'Info message');
logger.warn({ someData: 'value' }, 'Warning message');
logger.error({ someData: 'value' }, 'Error message');
logger.fatal({ someData: 'value' }, 'Fatal message');
```

The logger is configured with:
- `pino-pretty` transport to format logs nicely in development
- Debug level logging enabled
- Color-coded output
- Module name displayed in log entries (when using named loggers)

### Best Practices

1. Always use a named logger with the filename or module name to identify the source of logs
2. Always include structured data as the first parameter when possible
3. Use appropriate log levels:
   - `trace`: Very detailed debugging information
   - `debug`: Debugging information
   - `info`: Normal application behavior
   - `warn`: Something unexpected but not an error
   - `error`: Something failed
   - `fatal`: Application cannot continue

4. Add context to logs when possible (e.g., include request IDs, user IDs, etc.)
