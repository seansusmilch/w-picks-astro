import { describe, it, expect } from 'vitest';
import {
  BaseZ,
  UserSettingsZ,
  UserZ,
  MatchupZ,
  PickZ,
  ScoreboardZ,
  StatZ,
  WeeklyStatZ,
  GameZ,
  PageEntryZ,
  MatchupsByCodePrefixZ,
  ReactionZ,
} from '@/lib/definitions';

const validBase = {
  id: '123456789012345',
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
};

const validCode = '20240203LALNYK1';

describe('BaseZ', () => {
  it('parses valid base fields', () => {
    const result = BaseZ.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects id shorter than 15 chars', () => {
    const result = BaseZ.safeParse({ ...validBase, id: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects id longer than 15 chars', () => {
    const result = BaseZ.safeParse({ ...validBase, id: '1234567890123456' });
    expect(result.success).toBe(false);
  });

  it('rejects missing id', () => {
    const { id: _, ...noId } = validBase;
    const result = BaseZ.safeParse(noId);
    expect(result.success).toBe(false);
  });
});

describe('UserSettingsZ', () => {
  it('applies defaults when empty object given', () => {
    const result = UserSettingsZ.parse({});
    expect(result).toEqual({ colorfulPicks: true, hideFromLatestPicks: false });
  });

  it('parses explicit values', () => {
    const result = UserSettingsZ.parse({
      colorfulPicks: false,
      hideFromLatestPicks: true,
    });
    expect(result).toEqual({
      colorfulPicks: false,
      hideFromLatestPicks: true,
    });
  });

  it('rejects non-boolean values', () => {
    const result = UserSettingsZ.safeParse({ colorfulPicks: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('UserZ', () => {
  const validUser = {
    ...validBase,
    email: 'test@example.com',
    username: 'testuser',
    avatar: 'avatar.png',
    bio: 'Hello',
  };

  it('parses a valid user', () => {
    const result = UserZ.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('accepts optional avatar_url', () => {
    const result = UserZ.safeParse({
      ...validUser,
      avatar_url: 'http://example.com/avatar.png',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-url avatar_url', () => {
    const result = UserZ.safeParse({
      ...validUser,
      avatar_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('applies default settings when not provided', () => {
    const result = UserZ.parse(validUser);
    expect(result.settings).toEqual({
      colorfulPicks: true,
      hideFromLatestPicks: false,
    });
  });

  it('accepts null settings', () => {
    const result = UserZ.safeParse({ ...validUser, settings: null });
    expect(result.success).toBe(true);
  });
});

describe('MatchupZ', () => {
  const validMatchup = {
    ...validBase,
    code: validCode,
    time_utc: '2024-02-03T19:00:00Z',
    home_code: 'LAL',
    away_code: 'NYK',
    home_meta: { wins: 30, losses: 10 },
    away_meta: { wins: 20, losses: 20 },
    scoreboard: '123456789012345',
  };

  it('parses a valid matchup', () => {
    const result = MatchupZ.safeParse(validMatchup);
    expect(result.success).toBe(true);
  });

  it('accepts null home/away meta', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      home_meta: null,
      away_meta: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string scoreboard', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      scoreboard: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects scoreboard that is neither 15 chars nor empty', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      scoreboard: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative wins in meta', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      home_meta: { wins: -1, losses: 10 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects code not exactly 15 chars', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      code: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects home_code not exactly 3 chars', () => {
    const result = MatchupZ.safeParse({
      ...validMatchup,
      home_code: 'LAKERS',
    });
    expect(result.success).toBe(false);
  });
});

describe('PickZ', () => {
  const validPick = {
    ...validBase,
    matchup: '123456789012345',
    win_prediction: 'LAL',
    comment: 'Going with the Lakers',
    user: '678901234567890',
    status: 'upcoming',
    result: '',
  };

  it('parses a valid pick', () => {
    const result = PickZ.safeParse(validPick);
    expect(result.success).toBe(true);
  });

  it('rejects pick with matchup not 15 chars', () => {
    const result = PickZ.safeParse({
      ...validPick,
      matchup: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects pick with win_prediction not 3 chars', () => {
    const result = PickZ.safeParse({
      ...validPick,
      win_prediction: 'TOOLONG',
    });
    expect(result.success).toBe(false);
  });

  it('accepts pick with expand', () => {
    const validUser = {
      ...validBase,
      email: 'test@example.com',
      username: 'testuser',
      avatar: 'avatar.png',
      bio: 'Hello',
    };
    const validMatchup = {
      ...validBase,
      code: validCode,
      time_utc: '2024-02-03T19:00:00Z',
      home_code: 'LAL',
      away_code: 'NYK',
      home_meta: null,
      away_meta: null,
      scoreboard: '',
    };
    const result = PickZ.safeParse({
      ...validPick,
      expand: { user: validUser, matchup: validMatchup },
    });
    expect(result.success).toBe(true);
  });
});

describe('ScoreboardZ', () => {
  const validScoreboard = {
    ...validBase,
    code: validCode,
    status: 3,
    status_text: 'Final',
    home_score: 105,
    away_score: 113,
  };

  it('parses a valid scoreboard', () => {
    const result = ScoreboardZ.safeParse(validScoreboard);
    expect(result.success).toBe(true);
  });

  it('rejects status below 0', () => {
    const result = ScoreboardZ.safeParse({
      ...validScoreboard,
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects status above 3', () => {
    const result = ScoreboardZ.safeParse({
      ...validScoreboard,
      status: 4,
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid status values', () => {
    for (const status of [0, 1, 2, 3]) {
      const result = ScoreboardZ.safeParse({ ...validScoreboard, status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects negative scores', () => {
    const result = ScoreboardZ.safeParse({
      ...validScoreboard,
      home_score: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe('StatZ', () => {
  const validStat = {
    user: '123456789012345',
    total_picks: 50,
    win_picks: 30,
    lose_picks: 20,
    win_loss_ratio: 1.5,
    win_pick_rate: 60,
  };

  it('parses valid stats', () => {
    const result = StatZ.safeParse(validStat);
    expect(result.success).toBe(true);
  });

  it('accepts null win_loss_ratio', () => {
    const result = StatZ.safeParse({ ...validStat, win_loss_ratio: null });
    expect(result.success).toBe(true);
  });

  it('accepts null win_pick_rate', () => {
    const result = StatZ.safeParse({ ...validStat, win_pick_rate: null });
    expect(result.success).toBe(true);
  });

  it('rejects win_pick_rate above 100', () => {
    const result = StatZ.safeParse({ ...validStat, win_pick_rate: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects negative total_picks', () => {
    const result = StatZ.safeParse({ ...validStat, total_picks: -1 });
    expect(result.success).toBe(false);
  });
});

describe('WeeklyStatZ', () => {
  const validWeekly = {
    user: '123456789012345',
    total_picks: 10,
    win_picks: 6,
    lose_picks: 4,
    win_loss_ratio: 1.5,
    win_pick_rate: 60,
    year_week: '2024-W05',
  };

  it('parses valid weekly stats', () => {
    const result = WeeklyStatZ.safeParse(validWeekly);
    expect(result.success).toBe(true);
  });

  it('rejects invalid year_week format', () => {
    const result = WeeklyStatZ.safeParse({
      ...validWeekly,
      year_week: '2024-05',
    });
    expect(result.success).toBe(false);
  });

  it('rejects year_week not 8 chars', () => {
    const result = WeeklyStatZ.safeParse({
      ...validWeekly,
      year_week: '2024-W5',
    });
    expect(result.success).toBe(false);
  });
});

describe('GameZ', () => {
  const validMatchup = {
    ...validBase,
    code: validCode,
    time_utc: '2024-02-03T19:00:00Z',
    home_code: 'LAL',
    away_code: 'NYK',
    home_meta: null,
    away_meta: null,
    scoreboard: '',
  };

  const validPick = {
    ...validBase,
    matchup: '123456789012345',
    win_prediction: 'LAL',
    comment: '',
    user: '678901234567890',
    status: 'upcoming',
    result: '',
  };

  it('parses a game with matchup, optional scoreboard, and picks', () => {
    const result = GameZ.safeParse({
      matchup: validMatchup,
      picks: [validPick],
    });
    expect(result.success).toBe(true);
  });

  it('accepts game without scoreboard', () => {
    const result = GameZ.safeParse({
      matchup: validMatchup,
      picks: [],
    });
    expect(result.success).toBe(true);
  });
});

describe('PageEntryZ', () => {
  it('parses valid page entry', () => {
    const result = PageEntryZ.safeParse({
      date_code: '20240203',
      title: 'Feb 3 Games',
      href: 'https://example.com/games',
    });
    expect(result.success).toBe(true);
  });

  it('accepts numeric date_code', () => {
    const result = PageEntryZ.safeParse({
      date_code: 20240203,
      title: 'Feb 3 Games',
      href: 'https://example.com/games',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid href', () => {
    const result = PageEntryZ.safeParse({
      date_code: '20240203',
      title: 'Feb 3 Games',
      href: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('MatchupsByCodePrefixZ', () => {
  it('parses valid entry', () => {
    const result = MatchupsByCodePrefixZ.safeParse({
      date_code: '20240203',
      matchup_count: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative matchup_count', () => {
    const result = MatchupsByCodePrefixZ.safeParse({
      date_code: '20240203',
      matchup_count: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('ReactionZ', () => {
  it('parses valid reaction', () => {
    const result = ReactionZ.safeParse({
      user: '123456789012345',
      pick: '678901234567890',
    });
    expect(result.success).toBe(true);
  });

  it('rejects user id not 15 chars', () => {
    const result = ReactionZ.safeParse({
      user: 'short',
      pick: '678901234567890',
    });
    expect(result.success).toBe(false);
  });

  it('rejects pick id not 15 chars', () => {
    const result = ReactionZ.safeParse({
      user: '123456789012345',
      pick: 'short',
    });
    expect(result.success).toBe(false);
  });
});
