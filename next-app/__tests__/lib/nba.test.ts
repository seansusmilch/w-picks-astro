import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup/test-server';
import {
  fetchNBAScheduleEndpoint,
  fetchNBAScoreboardsEndpoint,
} from '@/lib/nba';

vi.mock('@/lib/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe('fetchNBAScheduleEndpoint', () => {
  it('returns parsed schedule data on success', async () => {
    const result = await fetchNBAScheduleEndpoint();
    expect(result).toBeDefined();
    expect(result.leagueSchedule).toBeDefined();
    expect(result.leagueSchedule.gameDates.length).toBeGreaterThan(0);
  });

  it('throws on API error', { timeout: 15000 }, async () => {
    server.use(
      http.get(
        'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json',
        () => HttpResponse.json({ error: 'Not Found' }, { status: 404 })
      )
    );

    await expect(fetchNBAScheduleEndpoint()).rejects.toThrow('NBA API returned 404');
  });
});

describe('fetchNBAScoreboardsEndpoint', () => {
  it('returns parsed scoreboard data on success', async () => {
    const result = await fetchNBAScoreboardsEndpoint();
    expect(result).toBeDefined();
    expect(result.scoreboard).toBeDefined();
  });

  it('throws on API error', { timeout: 15000 }, async () => {
    server.use(
      http.get(
        'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
        () => HttpResponse.json({ error: 'Not Found' }, { status: 500 })
      )
    );

    await expect(fetchNBAScoreboardsEndpoint()).rejects.toThrow('NBA API returned 500');
  });
});
