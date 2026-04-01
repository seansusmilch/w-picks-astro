import { describe, it, expect } from 'vitest';
import {
  BaseZ,
  UserZ,
  UserSettingsZ,
  StatZ,
  WeeklyStatZ,
  MatchupZ,
  ScoreboardZ,
  PickZ,
  ReactionZ,
  GameZ,
} from '@/lib/definitions';

const validBase = {
  id: '123456789012345',
  created: '2025-01-01T00:00:00Z',
  updated: '2025-01-01T00:00:00Z',
};

describe('BaseZ', () => {
  it('accepts valid base fields', () => {
    expect(BaseZ.safeParse(validBase).success).toBe(true);
  });

  it('rejects id with wrong length', () => {
    expect(BaseZ.safeParse({ ...validBase, id: 'short' }).success).toBe(false);
  });
});

describe('UserSettingsZ', () => {
  it('applies defaults for missing fields', () => {
    const result = UserSettingsZ.parse({});
    expect(result.colorfulPicks).toBe(true);
    expect(result.hideFromLatestPicks).toBe(false);
  });

  it('accepts explicit values', () => {
    const result = UserSettingsZ.parse({ colorfulPicks: false, hideFromLatestPicks: true });
    expect(result.colorfulPicks).toBe(false);
    expect(result.hideFromLatestPicks).toBe(true);
  });
});

describe('UserZ', () => {
  const validUser = {
    ...validBase,
    email: 'test@example.com',
    username: 'testuser',
    avatar: 'avatar.png',
    bio: 'hello',
  };

  it('accepts a valid user', () => {
    expect(UserZ.safeParse(validUser).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(UserZ.safeParse({ ...validUser, email: 'not-email' }).success).toBe(false);
  });

  it('accepts optional avatar_url', () => {
    const withUrl = { ...validUser, avatar_url: 'https://example.com/pic.png' };
    expect(UserZ.safeParse(withUrl).success).toBe(true);
  });

  it('accepts missing avatar_url', () => {
    expect(UserZ.safeParse(validUser).success).toBe(true);
  });

  it('accepts null settings', () => {
    const result = UserZ.parse({ ...validUser, settings: null });
    expect(result.settings).toBeNull();
  });
});

describe('StatZ', () => {
  it('accepts valid stats', () => {
    const stat = { user: '123456789012345', total_picks: 10, win_picks: 6, lose_picks: 4, win_loss_ratio: 1.5, win_pick_rate: 60 };
    expect(StatZ.safeParse(stat).success).toBe(true);
  });

  it('allows null win_loss_ratio and win_pick_rate', () => {
    const stat = { user: '123456789012345', total_picks: 0, win_picks: 0, lose_picks: 0, win_loss_ratio: null, win_pick_rate: null };
    expect(StatZ.safeParse(stat).success).toBe(true);
  });

  it('rejects negative picks', () => {
    const stat = { user: '123456789012345', total_picks: -1, win_picks: 0, lose_picks: 0, win_loss_ratio: null, win_pick_rate: null };
    expect(StatZ.safeParse(stat).success).toBe(false);
  });

  it('rejects win_pick_rate above 100', () => {
    const stat = { user: '123456789012345', total_picks: 0, win_picks: 0, lose_picks: 0, win_loss_ratio: null, win_pick_rate: 101 };
    expect(StatZ.safeParse(stat).success).toBe(false);
  });
});

describe('WeeklyStatZ', () => {
  it('accepts valid year_week format', () => {
    const stat = { user: '123456789012345', total_picks: 5, win_picks: 3, lose_picks: 2, win_loss_ratio: 1.5, win_pick_rate: 60, year_week: '2025-W01' };
    expect(WeeklyStatZ.safeParse(stat).success).toBe(true);
  });

  it('rejects invalid year_week format', () => {
    const stat = { user: '123456789012345', total_picks: 5, win_picks: 3, lose_picks: 2, win_loss_ratio: 1.5, win_pick_rate: 60, year_week: '2025-01' };
    expect(WeeklyStatZ.safeParse(stat).success).toBe(false);
  });
});

describe('MatchupZ', () => {
  const validMatchup = {
    ...validBase,
    code: '123456789012345',
    time_utc: '2025-01-15T00:00:00Z',
    home_code: 'BOS',
    away_code: 'NYK',
    home_meta: { wins: 30, losses: 10 },
    away_meta: { wins: 25, losses: 15 },
    scoreboard: '123456789012345',
  };

  it('accepts a valid matchup', () => {
    expect(MatchupZ.safeParse(validMatchup).success).toBe(true);
  });

  it('accepts null meta', () => {
    expect(MatchupZ.safeParse({ ...validMatchup, home_meta: null, away_meta: null }).success).toBe(true);
  });

  it('accepts empty scoreboard', () => {
    expect(MatchupZ.safeParse({ ...validMatchup, scoreboard: '' }).success).toBe(true);
  });

  it('rejects wrong team code length', () => {
    expect(MatchupZ.safeParse({ ...validMatchup, home_code: 'BOST' }).success).toBe(false);
  });
});

describe('ScoreboardZ', () => {
  const validScoreboard = {
    ...validBase,
    code: '123456789012345',
    status: 1,
    status_text: '7:30 PM ET',
    home_score: 50,
    away_score: 45,
  };

  it('accepts a valid scoreboard', () => {
    expect(ScoreboardZ.safeParse(validScoreboard).success).toBe(true);
  });

  it('rejects status outside 0-3', () => {
    expect(ScoreboardZ.safeParse({ ...validScoreboard, status: 4 }).success).toBe(false);
    expect(ScoreboardZ.safeParse({ ...validScoreboard, status: -1 }).success).toBe(false);
  });

  it('rejects negative scores', () => {
    expect(ScoreboardZ.safeParse({ ...validScoreboard, home_score: -1 }).success).toBe(false);
  });
});

describe('PickZ', () => {
  const validPick = {
    ...validBase,
    matchup: '123456789012345',
    win_prediction: 'BOS',
    comment: 'Going with the home team',
    user: '123456789012345',
    status: 'upcoming',
    result: '',
  };

  it('accepts a valid pick', () => {
    expect(PickZ.safeParse(validPick).success).toBe(true);
  });

  it('rejects wrong matchup length', () => {
    expect(PickZ.safeParse({ ...validPick, matchup: 'short' }).success).toBe(false);
  });

  it('rejects wrong win_prediction length', () => {
    expect(PickZ.safeParse({ ...validPick, win_prediction: 'BOST' }).success).toBe(false);
  });
});

describe('ReactionZ', () => {
  it('accepts valid reaction', () => {
    expect(ReactionZ.safeParse({ user: '123456789012345', pick: '123456789012345' }).success).toBe(true);
  });

  it('rejects wrong id length', () => {
    expect(ReactionZ.safeParse({ user: 'abc', pick: '123456789012345' }).success).toBe(false);
  });
});

describe('GameZ', () => {
  const validMatchup = {
    ...validBase,
    code: '123456789012345',
    time_utc: '2025-01-15T00:00:00Z',
    home_code: 'BOS',
    away_code: 'NYK',
    home_meta: null,
    away_meta: null,
    scoreboard: '',
  };

  it('accepts a valid game', () => {
    const game = { matchup: validMatchup, picks: [] };
    expect(GameZ.safeParse(game).success).toBe(true);
  });

  it('accepts optional scoreboard', () => {
    const scoreboard = { ...validBase, code: '123456789012345', status: 2, status_text: 'Q2', home_score: 50, away_score: 45 };
    const game = { matchup: validMatchup, scoreboard, picks: [] };
    expect(GameZ.safeParse(game).success).toBe(true);
  });
});
