import { describe, it, expect } from 'vitest';
import {
  transformNBAGameToScoreboard,
  transformNBAGamesToScoreboards,
  findScoreboardByCode,
} from '@/lib/nba-scoreboard-utils';
import type { Game } from '@/lib/types/nba-scoreboards';

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    gameCode: '0022400001',
    gameStatus: 1,
    gameStatusText: '7:30 PM ET',
    homeTeam: {
      teamTricode: 'BOS',
      score: 0,
    },
    awayTeam: {
      teamTricode: 'NYK',
      score: 0,
    },
    ...overrides,
  } as Game;
}

describe('transformNBAGameToScoreboard', () => {
  it('transforms a valid game to a scoreboard', () => {
    const game = makeGame();
    const result = transformNBAGameToScoreboard(game);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('0022400001');
    expect(result!.status).toBe(1);
    expect(result!.status_text).toBe('7:30 PM ET');
    expect(result!.home_score).toBe(0);
    expect(result!.away_score).toBe(0);
  });

  it('returns null if gameCode is missing', () => {
    const game = makeGame({ gameCode: undefined } as Partial<Game>);
    const result = transformNBAGameToScoreboard(game as Game);
    expect(result).toBeNull();
  });

  it('returns null if gameStatus is not a number', () => {
    const game = makeGame({ gameStatus: undefined } as Partial<Game>);
    const result = transformNBAGameToScoreboard(game as Game);
    expect(result).toBeNull();
  });

  it('clamps scores to non-negative', () => {
    const game = makeGame({
      homeTeam: { teamTricode: 'BOS', score: -5 },
      awayTeam: { teamTricode: 'NYK', score: -10 },
    } as Partial<Game>);
    const result = transformNBAGameToScoreboard(game as Game);

    expect(result).not.toBeNull();
    expect(result!.home_score).toBe(0);
    expect(result!.away_score).toBe(0);
  });

  it('clamps status to valid range (0-3)', () => {
    const highStatus = makeGame({ gameStatus: 5 } as Partial<Game>);
    const result = transformNBAGameToScoreboard(highStatus as Game);
    expect(result!.status).toBe(3);

    const lowStatus = makeGame({ gameStatus: -1 } as Partial<Game>);
    const lowResult = transformNBAGameToScoreboard(lowStatus as Game);
    expect(lowResult!.status).toBe(0);
  });

  it('defaults scores to 0 when teams are missing', () => {
    const game = makeGame({ homeTeam: undefined, awayTeam: undefined } as Partial<Game>);
    const result = transformNBAGameToScoreboard(game as Game);

    expect(result).not.toBeNull();
    expect(result!.home_score).toBe(0);
    expect(result!.away_score).toBe(0);
  });

  it('trims status text and defaults to empty string', () => {
    const withSpaces = makeGame({ gameStatusText: '  Q1 2:30  ' });
    expect(transformNBAGameToScoreboard(withSpaces)!.status_text).toBe('Q1 2:30');

    const noText = makeGame({ gameStatusText: undefined } as Partial<Game>);
    expect(transformNBAGameToScoreboard(noText as Game)!.status_text).toBe('');
  });

  it('includes placeholder id, created, updated fields', () => {
    const result = transformNBAGameToScoreboard(makeGame());
    expect(result).toHaveProperty('id', '');
    expect(result).toHaveProperty('created');
    expect(result).toHaveProperty('updated');
  });
});

describe('transformNBAGamesToScoreboards', () => {
  it('transforms multiple valid games', () => {
    const games = [
      makeGame({ gameCode: '001' }),
      makeGame({ gameCode: '002' }),
    ];
    const result = transformNBAGamesToScoreboards(games as Game[]);
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('001');
    expect(result[1].code).toBe('002');
  });

  it('filters out invalid games', () => {
    const games = [
      makeGame({ gameCode: '001' }),
      makeGame({ gameCode: undefined } as Partial<Game>),
      makeGame({ gameCode: '003' }),
    ];
    const result = transformNBAGamesToScoreboards(games as Game[]);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(transformNBAGamesToScoreboards([])).toEqual([]);
  });
});

describe('findScoreboardByCode', () => {
  const scoreboards = [
    { id: '1', created: '', updated: '', code: '001', status: 1, status_text: '', home_score: 0, away_score: 0 },
    { id: '2', created: '', updated: '', code: '002', status: 2, status_text: '', home_score: 10, away_score: 5 },
  ];

  it('finds a scoreboard by code', () => {
    expect(findScoreboardByCode(scoreboards, '001')).toBe(scoreboards[0]);
  });

  it('returns null when code not found', () => {
    expect(findScoreboardByCode(scoreboards, '999')).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(findScoreboardByCode([], '001')).toBeNull();
  });
});
