import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
  }),
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  BatchOperationTracker,
  trackPerformance,
  generateExecutionMetrics,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/cron-utils';
import type { BatchOperationOptions } from '@/lib/cron-utils';

function createMockLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
}

describe('BatchOperationTracker', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
  });

  function createTracker(
    options: Partial<BatchOperationOptions> = {}
  ): BatchOperationTracker {
    return new BatchOperationTracker(mockLogger, {
      name: options.name || 'test-operation',
      totalItems: options.totalItems,
      logProgressEvery: options.logProgressEvery,
    });
  }

  it('logs initial info on construction', () => {
    createTracker({ name: 'my-op', totalItems: 10 });
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'my-op', totalItems: 10 }),
      expect.stringContaining('Starting batch operation: my-op')
    );
  });

  it('tracks success count', () => {
    const tracker = createTracker();
    tracker.recordSuccess('item-1');
    tracker.recordSuccess('item-2');

    const metrics = tracker.complete();
    expect(metrics.successCount).toBe(2);
    expect(metrics.processedItems).toBe(2);
  });

  it('tracks error count', () => {
    const tracker = createTracker();
    tracker.recordError(new Error('fail'), 'item-1');

    const metrics = tracker.complete();
    expect(metrics.errorCount).toBe(1);
    expect(metrics.processedItems).toBe(1);
    expect(metrics.successCount).toBe(0);
  });

  it('tracks mixed successes and errors', () => {
    const tracker = createTracker();
    tracker.recordSuccess('a');
    tracker.recordError(new Error('fail'), 'b');
    tracker.recordSuccess('c');

    const metrics = tracker.complete();
    expect(metrics.successCount).toBe(2);
    expect(metrics.errorCount).toBe(1);
    expect(metrics.processedItems).toBe(3);
  });

  it('includes name in metrics', () => {
    const tracker = createTracker({ name: 'test-name' });
    tracker.recordSuccess();

    const metrics = tracker.complete();
    expect(metrics.name).toBe('test-name');
  });

  it('calculates itemsPerSecond', () => {
    const tracker = createTracker();
    tracker.recordSuccess();
    tracker.recordSuccess();

    const metrics = tracker.complete();
    expect(Number(metrics.itemsPerSecond)).toBeGreaterThan(0);
  });

  it('includes durationMs as a string', () => {
    const tracker = createTracker();
    tracker.recordSuccess();

    const metrics = tracker.complete();
    expect(typeof metrics.durationMs).toBe('string');
    expect(Number(metrics.durationMs)).toBeGreaterThanOrEqual(0);
  });

  it('logs progress at configured interval', () => {
    const tracker = createTracker({ logProgressEvery: 2 });
    mockLogger.info.mockClear();

    tracker.recordSuccess('a');
    expect(mockLogger.info).not.toHaveBeenCalledWith(
      expect.objectContaining({ processed: 1 }),
      expect.anything()
    );

    tracker.recordSuccess('b');
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ processed: 2 }),
      expect.stringContaining('Batch progress')
    );
  });

  it('logs completion', () => {
    const tracker = createTracker({ name: 'my-op' });
    tracker.recordSuccess();
    mockLogger.info.mockClear();

    tracker.complete();

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'my-op' }),
      expect.stringContaining('Completed batch operation: my-op')
    );
  });
});

describe('trackPerformance', () => {
  it('returns the result of the function', async () => {
    const result = await trackPerformance('testFn', async () => 42);
    expect(result).toBe(42);
  });

  it('re-throws errors from the function', async () => {
    await expect(
      trackPerformance('failFn', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });
});

describe('generateExecutionMetrics', () => {
  it('returns metrics with startTime, endTime, and durationMs', () => {
    const startTime = performance.now() - 100;
    const metrics = generateExecutionMetrics(startTime);

    expect(metrics.startTime).toBeDefined();
    expect(metrics.endTime).toBeDefined();
    expect(metrics.durationMs).toBeDefined();
    expect(Number(metrics.durationMs)).toBeGreaterThanOrEqual(100);
  });

  it('merges additional metrics', () => {
    const startTime = performance.now();
    const metrics = generateExecutionMetrics(startTime, {
      customField: 'hello',
    });

    expect(metrics.customField).toBe('hello');
  });

  it('preserves explicit startTime in additionalMetrics', () => {
    const startTime = performance.now();
    const explicit = '2024-01-01T00:00:00Z';
    const metrics = generateExecutionMetrics(startTime, {
      startTime: explicit,
    });

    expect(metrics.startTime).toBe(explicit);
  });
});

describe('createErrorResponse', () => {
  it('returns a Response with status 500', async () => {
    const startTime = performance.now();
    const response = createErrorResponse(new Error('test error'), startTime);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('test error');
    expect(body.metrics).toBeDefined();
    expect(body.metrics.durationMs).toBeDefined();
  });

  it('handles non-Error objects', async () => {
    const startTime = performance.now();
    const response = createErrorResponse('string error', startTime);

    const body = await response.json();
    expect(body.error).toBe('string error');
  });

  it('merges additionalData into response body', async () => {
    const startTime = performance.now();
    const response = createErrorResponse(new Error('fail'), startTime, {
      extraInfo: 'details',
    });

    const body = await response.json();
    expect(body.extraInfo).toBe('details');
  });
});

describe('createSuccessResponse', () => {
  it('returns a Response with status 200', async () => {
    const startTime = performance.now();
    const response = createSuccessResponse('Job done', startTime);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Job done');
    expect(body.metrics).toBeDefined();
  });

  it('merges data into response body', async () => {
    const startTime = performance.now();
    const response = createSuccessResponse('Done', startTime, {
      created: 5,
      updated: 3,
    });

    const body = await response.json();
    expect(body.created).toBe(5);
    expect(body.updated).toBe(3);
  });
});
