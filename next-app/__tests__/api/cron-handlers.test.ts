import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST as updateMatchups } from '@/app/api/cron/update-matchups/route';
import { POST as updateScoreboards } from '@/app/api/cron/update-scoreboards/route';
import { POST as cleanup } from '@/app/api/cron/cleanup/route';

vi.mock('@/lib/pocketbase-server', () => ({
  getAdminPocketBase: vi.fn(),
}));

vi.mock('@/lib/cron-utils', () => ({
  getCronLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackBatchOperation: vi.fn(() => ({
      recordSuccess: vi.fn(),
      recordError: vi.fn(),
      complete: vi.fn(() => ({ success: 0, errors: 0 })),
    })),
  })),
  trackPerformance: vi.fn((_name, fn) => fn()),
  createErrorResponse: vi.fn((_error, _startTime, _meta) => ({
    json: vi.fn(() => Promise.resolve({ error: 'Internal server error' })),
  })),
  generateExecutionMetrics: vi.fn((_startTime, _meta) => ({
    durationMs: '100.00',
    startTime: '2025-01-01T00:00:00.000Z',
    endTime: '2025-01-01T00:00:01.000Z',
    ..._meta,
  })),
}));

vi.mock('@/lib/logger', () => ({
  getLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('@/lib/nba', () => ({
  fetchNBAScheduleEndpoint: vi.fn(),
  fetchNBAScoreboardsEndpoint: vi.fn(),
}));

vi.mock('@/app/actions/matchups', () => ({
  getMatchupByCode: vi.fn(),
}));

vi.mock('@/app/actions/cron', () => ({
  getTodayMatchups: vi.fn(),
  attachMatchupToScoreboard: vi.fn(),
  updatePicksStatusByCode: vi.fn(),
  updateScoreboard: vi.fn(),
  updatePicksStatus: vi.fn(),
}));

describe('Cron handlers authentication', () => {
  const VALID_SECRET = 'test-cron-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = VALID_SECRET;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.restoreAllMocks();
  });

  describe('update-matchups cron handler', () => {
    it('returns 401 without auth header', async () => {
      const request = new Request('http://localhost/api/cron/update-matchups', {
        method: 'POST',
      });

      const response = await updateMatchups(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 401 with wrong secret', async () => {
      const request = new Request('http://localhost/api/cron/update-matchups', {
        method: 'POST',
        headers: { 'Cron-Secret': 'wrong-secret' },
      });

      const response = await updateMatchups(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 500 when CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;

      const request = new Request('http://localhost/api/cron/update-matchups', {
        method: 'POST',
        headers: { 'Cron-Secret': 'any-secret' },
      });

      const response = await updateMatchups(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Server configuration error');
    });
  });

  describe('update-scoreboards cron handler', () => {
    it('returns 401 without auth header', async () => {
      const request = new Request('http://localhost/api/cron/update-scoreboards', {
        method: 'POST',
      });

      const response = await updateScoreboards(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 401 with wrong secret', async () => {
      const request = new Request('http://localhost/api/cron/update-scoreboards', {
        method: 'POST',
        headers: { 'Cron-Secret': 'wrong-secret' },
      });

      const response = await updateScoreboards(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 500 when CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;

      const request = new Request('http://localhost/api/cron/update-scoreboards', {
        method: 'POST',
        headers: { 'Cron-Secret': 'any-secret' },
      });

      const response = await updateScoreboards(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Server configuration error');
    });
  });

  describe('cleanup cron handler', () => {
    it('returns 401 without auth header', async () => {
      const request = new Request('http://localhost/api/cron/cleanup', {
        method: 'POST',
      });

      const response = await cleanup(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 401 with wrong secret', async () => {
      const request = new Request('http://localhost/api/cron/cleanup', {
        method: 'POST',
        headers: { 'Cron-Secret': 'wrong-secret' },
      });

      const response = await cleanup(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 500 when CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;

      const request = new Request('http://localhost/api/cron/cleanup', {
        method: 'POST',
        headers: { 'Cron-Secret': 'any-secret' },
      });

      const response = await cleanup(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Server configuration error');
    });
  });
});
