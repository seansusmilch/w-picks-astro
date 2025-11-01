// Simple logger that follows the same pattern as Astro app
// Uses console for now, but can be upgraded to pino later

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private formatMessage(level: LogLevel, context: LogContext | undefined, message: string): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.name}]`;
    
    if (context) {
      console[level === 'fatal' ? 'error' : level](`${prefix} ${message}`, context);
    } else {
      console[level === 'fatal' ? 'error' : level](`${prefix} ${message}`);
    }
  }

  trace(context: LogContext | undefined, message: string): void;
  trace(message: string): void;
  trace(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('trace', undefined, contextOrMessage);
    } else {
      this.formatMessage('trace', contextOrMessage, message || '');
    }
  }

  debug(context: LogContext | undefined, message: string): void;
  debug(message: string): void;
  debug(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('debug', undefined, contextOrMessage);
    } else {
      this.formatMessage('debug', contextOrMessage, message || '');
    }
  }

  info(context: LogContext | undefined, message: string): void;
  info(message: string): void;
  info(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('info', undefined, contextOrMessage);
    } else {
      this.formatMessage('info', contextOrMessage, message || '');
    }
  }

  warn(context: LogContext | undefined, message: string): void;
  warn(message: string): void;
  warn(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('warn', undefined, contextOrMessage);
    } else {
      this.formatMessage('warn', contextOrMessage, message || '');
    }
  }

  error(context: LogContext | undefined, message: string): void;
  error(message: string): void;
  error(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('error', undefined, contextOrMessage);
    } else {
      this.formatMessage('error', contextOrMessage, message || '');
    }
  }

  fatal(context: LogContext | undefined, message: string): void;
  fatal(message: string): void;
  fatal(contextOrMessage: LogContext | string, message?: string): void {
    if (typeof contextOrMessage === 'string') {
      this.formatMessage('fatal', undefined, contextOrMessage);
    } else {
      this.formatMessage('fatal', contextOrMessage, message || '');
    }
  }
}

/**
 * Creates a new logger instance with the provided name
 * @param name The name to include in the log records (typically the filename or module name)
 * @returns A new logger instance with the name included in all log entries
 */
export function getLogger(name: string): Logger {
  return new Logger(name);
}

// Default logger (for backward compatibility)
export default getLogger('app');

