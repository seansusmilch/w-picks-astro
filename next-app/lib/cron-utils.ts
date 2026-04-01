import { getLogger } from './logger';
import { DateTime } from 'luxon';

const logger = getLogger('cron-utils');

export interface BatchOperationOptions {
  /**
   * Name of the batch operation
   */
  name: string;

  /**
   * Total number of items to process (if known)
   */
  totalItems?: number;

  /**
   * Log progress every N items
   */
  logProgressEvery?: number;
}

export interface BatchOperationMetrics {
  name: string;
  durationMs: string;
  processedItems: number;
  successCount: number;
  errorCount: number;
  itemsPerSecond: string;
}

/**
 * Tracks a batch operation with detailed metrics
 */
export class BatchOperationTracker {
  private logger: ReturnType<typeof getLogger>;
  private name: string;
  private startTime: number;
  private successCount: number = 0;
  private errorCount: number = 0;
  private totalItems?: number;
  private processedItems: number = 0;
  private logProgressEvery: number;
  private lastLogTime: number;

  constructor(logger: ReturnType<typeof getLogger>, options: BatchOperationOptions) {
    this.logger = logger;
    this.name = options.name;
    this.totalItems = options.totalItems;
    this.logProgressEvery = options.logProgressEvery || 50;
    this.startTime = performance.now();
    this.lastLogTime = this.startTime;

    this.logger.info({
      operation: this.name,
      totalItems: this.totalItems,
    }, `Starting batch operation: ${this.name}`);
  }

  /**
   * Record a successful operation
   */
  recordSuccess(itemId?: string): void {
    this.successCount++;
    this.processedItems++;
    this.maybeLogProgress(itemId);
  }

  /**
   * Record a failed operation
   */
  recordError(error: unknown, itemId?: string): void {
    this.errorCount++;
    this.processedItems++;

    this.logger.error({
      operation: this.name,
      itemId,
      error: error instanceof Error ? error.message : String(error),
    }, `Error in batch operation: ${this.name}`);

    this.maybeLogProgress(itemId);
  }

  /**
   * Log progress if needed based on configured interval
   */
  private maybeLogProgress(itemId?: string): void {
    const shouldLog =
      this.processedItems % this.logProgressEvery === 0 ||
      (this.totalItems && this.processedItems === this.totalItems);

    if (shouldLog) {
      const currentTime = performance.now();
      const elapsedSinceLastLog = currentTime - this.lastLogTime;
      const totalElapsed = currentTime - this.startTime;
      const itemsPerSecond =
        (this.logProgressEvery / elapsedSinceLastLog) * 1000;

      this.logger.info({
        operation: this.name,
        processed: this.processedItems,
        total: this.totalItems,
        success: this.successCount,
        errors: this.errorCount,
        progress: this.totalItems
          ? `${((this.processedItems / this.totalItems) * 100).toFixed(1)}%`
          : undefined,
        itemsPerSecond: itemsPerSecond.toFixed(2),
        elapsedMs: totalElapsed.toFixed(2),
        lastItemId: itemId,
      }, `Batch progress: ${this.name} - ${this.processedItems}${
        this.totalItems ? `/${this.totalItems}` : ''
      } items processed`);

      this.lastLogTime = currentTime;
    }
  }

  /**
   * Complete the batch operation and return metrics
   */
  complete(): BatchOperationMetrics {
    const endTime = performance.now();
    const durationMs = endTime - this.startTime;

    const metrics: BatchOperationMetrics = {
      name: this.name,
      durationMs: durationMs.toFixed(2),
      processedItems: this.processedItems,
      successCount: this.successCount,
      errorCount: this.errorCount,
      itemsPerSecond: ((this.processedItems / durationMs) * 1000).toFixed(2),
    };

    this.logger.info({
      operation: this.name,
      ...metrics,
    }, `Completed batch operation: ${this.name} in ${durationMs.toFixed(2)}ms`);

    return metrics;
  }
}

/**
 * Creates an enhanced logger specifically for cron jobs with additional utility methods
 */
export function getCronLogger(name: string): ReturnType<typeof getLogger> & {
  trackBatchOperation: (options: BatchOperationOptions) => BatchOperationTracker;
} {
  const baseLogger = getLogger(name);

  // Add enhanced methods to the logger
  const enhancedLogger = baseLogger as ReturnType<typeof getLogger> & {
    trackBatchOperation: (options: BatchOperationOptions) => BatchOperationTracker;
  };

  // Add the batch operation tracker
  enhancedLogger.trackBatchOperation = (
    options: BatchOperationOptions
  ): BatchOperationTracker => {
    return new BatchOperationTracker(baseLogger, options);
  };

  return enhancedLogger;
}

/**
 * Helper function to track performance of asynchronous operations
 *
 * @param fnName Name of the function being tracked
 * @param fn The async function to execute and measure
 * @param loggerInstance Logger instance to use (defaults to cron-utils logger)
 * @returns Promise with the result of the function
 */
export function trackPerformance<T>(
  fnName: string,
  fn: () => Promise<T>,
  loggerInstance = logger
): Promise<T> {
  const startTime = performance.now();
  return fn()
    .then((result) => {
      const endTime = performance.now();
      const elapsedMs = endTime - startTime;
      loggerInstance.info(
        { function: fnName, durationMs: elapsedMs.toFixed(2) },
        `Completed ${fnName} in ${elapsedMs.toFixed(2)}ms`
      );
      return result;
    })
    .catch((error) => {
      const endTime = performance.now();
      const elapsedMs = endTime - startTime;
      loggerInstance.error(
        {
          function: fnName,
          durationMs: elapsedMs.toFixed(2),
          error: error instanceof Error ? error.message : String(error),
        },
        `Error in ${fnName} after ${elapsedMs.toFixed(2)}ms`
      );
      throw error;
    });
}

/**
 * Generate standard execution metrics for cron jobs
 */
export function generateExecutionMetrics(
  jobStartTime: number,
  additionalMetrics: Record<string, unknown> = {}
): Record<string, unknown> {
  const jobEndTime = performance.now();
  const jobDurationMs = jobEndTime - jobStartTime;

  return {
    startTime:
      additionalMetrics.startTime ||
      DateTime.now().minus({ milliseconds: jobDurationMs }).toISO(),
    endTime: DateTime.now().toISO(),
    durationMs: jobDurationMs.toFixed(2),
    ...additionalMetrics,
  };
}

/**
 * Create a standardized error response for cron jobs
 */
export function createErrorResponse(
  error: unknown,
  jobStartTime: number,
  additionalData: Record<string, unknown> = {}
): Response {
  const jobEndTime = performance.now();
  const jobDurationMs = jobEndTime - jobStartTime;
  const startTime =
    additionalData.startTime ||
    DateTime.now().minus({ milliseconds: jobDurationMs }).toISO();
  const endTime = DateTime.now().toISO();

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    error: errorMessage,
    stack: errorStack,
    durationMs: jobDurationMs.toFixed(2),
    startTime,
    endTime,
    ...additionalData,
  };

  logger.error(logData, `Job failed after ${jobDurationMs.toFixed(2)}ms`);

  return new Response(
    JSON.stringify({
      success: false,
      message: 'Operation failed',
      error: errorMessage,
      metrics: {
        startTime,
        endTime,
        durationMs: jobDurationMs.toFixed(2),
      },
      ...additionalData,
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create a standardized success response for cron jobs
 */
export function createSuccessResponse(
  message: string,
  jobStartTime: number,
  data: Record<string, unknown> = {}
): Response {
  const metrics = generateExecutionMetrics(jobStartTime, data.metrics || {});

  return new Response(
    JSON.stringify({
      success: true,
      message,
      metrics,
      ...data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

