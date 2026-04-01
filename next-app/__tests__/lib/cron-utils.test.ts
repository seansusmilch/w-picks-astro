import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BatchOperationTracker,
  trackPerformance,
  generateExecutionMetrics,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/cron-utils';
import type { BatchOperationOptions } from '@/lib/cron-utils';

vi.mock('@/lib/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { getLogger } from '@/lib/logger';

const mockLogger = getLogger('test');

describe('BatchOperationTracker', () => {
  let perfNowMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    let now = 0;
    perfNowMock = vi.fn(() => now);
    vi.spyOn(performance, 'now').mockImplementation(perfNowMock);
    vi.mocked(mockLogger.info).mockClear();
    vi.mocked(mockLogger.error).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs start on construction', () => {
    const options: BatchOperationOptions = { name: 'test-batch', totalItems: 100 };
    new BatchOperationTracker(mockLogger, options);

    expect(mockLogger.info).toHaveBeenCalledWith(
      { operation: 'test-batch', totalItems: 100 },
      'Starting batch operation: test-batch'
    );
  });

  it('increments success count on recordSuccess', () => {
    const tracker = new BatchOperationTracker(mockLogger, { name: 'test' });
    tracker.recordSuccess();
    tracker.recordSuccess();

    const metrics = tracker.complete();
    expect(metrics.successCount).toBe(2);
    expect(metrics.processedItems).toBe(2);
  });

  it('increments error count on recordError', () => {
    const tracker = new BatchOperationTracker(mockLogger, { name: 'test' });
    tracker.recordError(new Error('fail'));
    tracker.recordError(new Error('fail2'));

    const metrics = tracker.complete();
    expect(metrics.errorCount).toBe(2);
    expect(metrics.processedItems).toBe(2);
  });

  it('complete returns correct metrics', () => {
    const tracker = new BatchOperationTracker(mockLogger, { name: 'test', totalItems: 4 });
    tracker.recordSuccess();
    tracker.recordSuccess();
    tracker.recordError(new Error('fail'));
    tracker.recordSuccess();

    const metrics = tracker.complete();
    expect(metrics.name).toBe('test');
    expect(metrics.successCount).toBe(3);
    expect(metrics.errorCount).toBe(1);
    expect(metrics.processedItems).toBe(4);
    expect(typeof metrics.durationMs).toBe('string');
    expect(typeof metrics.itemsPerSecond).toBe('string');
  });
});

describe('trackPerformance', () => {
  beforeEach(() => {
    vi.mocked(mockLogger.info).mockClear();
    vi.mocked(mockLogger.error).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with result on success', async () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(200);
    const fn = vi.fn().mockResolvedValue('done');
    const result = await trackPerformance('testFn', fn, mockLogger);
    expect(result).toBe('done');
    expect(mockLogger.info).toHaveBeenCalledWith(
      { function: 'testFn', durationMs: '100.00' },
      'Completed testFn in 100.00ms'
    );
  });

  it('rethrows on error', async () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(200);
    const err = new Error('boom');
    const fn = vi.fn().mockRejectedValue(err);
    await expect(trackPerformance('failFn', fn, mockLogger)).rejects.toThrow('boom');
    expect(mockLogger.error).toHaveBeenCalledWith(
      { function: 'failFn', durationMs: '100.00', error: 'boom' },
      'Error in failFn after 100.00ms'
    );
  });
});

describe('generateExecutionMetrics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns startTime, endTime, durationMs', () => {
    vi.spyOn(performance, 'now').mockReturnValue(500);
    const metrics = generateExecutionMetrics(100);
    expect(metrics).toHaveProperty('startTime');
    expect(metrics).toHaveProperty('endTime');
    expect(metrics).toHaveProperty('durationMs');
    expect(typeof metrics.durationMs).toBe('string');
  });
});

describe('createSuccessResponse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns Response with status 200 and success true', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(300);
    const res = createSuccessResponse('ok', 100, { extra: 'data' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('ok');
    expect(body.metrics).toBeDefined();
    expect(body.extra).toBe('data');
  });
});

describe('createErrorResponse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns Response with status 500 and success false', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(300);
    const err = new Error('something broke');
    const res = createErrorResponse(err, 100);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('something broke');
    expect(body.metrics).toBeDefined();
  });
});
