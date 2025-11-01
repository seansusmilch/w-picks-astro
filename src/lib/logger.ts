import pino from 'pino';

// Detect if we're in Next.js environment
// Next.js sets NEXT_RUNTIME during server-side rendering
const isNextJs = typeof process !== 'undefined' && 
  (process.env.NEXT_RUNTIME !== undefined || 
   process.env.NEXT_PHASE !== undefined);

// Configure the base logger
// In Next.js, don't use pino-pretty transport as it uses worker threads
// which don't work well with Next.js server components and webpack bundling
const baseLogger = isNextJs || process.env.NODE_ENV === 'production'
  ? pino({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
    })
  : pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      },
      level: 'debug',
    });

// Default logger (for backward compatibility)
const logger = baseLogger;

/**
 * Creates a new logger instance with the provided name
 * @param name The name to include in the log records (typically the filename or module name)
 * @returns A new logger instance with the name included in all log entries
 */
export function getLogger(name: string) {
  return baseLogger.child({ name });
}

export default logger;
