import type { UserType, MatchupType, PickType, GameType } from '@/lib/definitions'

export function mockUser(overrides: Partial<UserType> = {}): UserType {
  return {
    id: 'mockuser0000001',
    created: '2025-01-01 00:00:00.000Z',
    updated: '2025-01-01 00:00:00.000Z',
    email: 'test@example.com',
    username: 'testuser',
    avatar: '',
    bio: '',
    settings: {
      colorfulPicks: true,
      hideFromLatestPicks: false,
    },
    ...overrides,
  }
}

export function mockMatchup(overrides: Partial<MatchupType> = {}): MatchupType {
  return {
    id: 'mockmatchup0001',
    created: '2025-01-01 00:00:00.000Z',
    updated: '2025-01-01 00:00:00.000Z',
    code: '0022400001',
    time_utc: '2025-03-15T23:30:00Z',
    home_code: 'BOS',
    away_code: 'LAL',
    home_meta: { wins: 45, losses: 12 },
    away_meta: { wins: 38, losses: 19 },
    scoreboard: '',
    ...overrides,
  }
}

export function mockPick(overrides: Partial<PickType> = {}): PickType {
  return {
    id: 'mockpick0000001',
    created: '2025-03-14 12:00:00.000Z',
    updated: '2025-03-14 12:00:00.000Z',
    matchup: 'mockmatchup0001',
    win_prediction: '105',
    comment: 'Test pick',
    user: 'mockuser0000001',
    status: 'pending',
    result: '',
    ...overrides,
  }
}

export function mockGame(overrides: Partial<GameType> = {}): GameType {
  return {
    matchup: mockMatchup(),
    picks: [mockPick()],
    ...overrides,
  }
}
