import pino from 'pino';

// Configure the base logger
const baseLogger = pino({
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
