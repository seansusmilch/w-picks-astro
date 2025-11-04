/**
 * Refresh intervals for data fetching (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  /** Refresh interval when games have scoreboards (10 seconds) */
  WITH_SCOREBOARD: 5 * 1000,
  /** Refresh interval when games don't have scoreboards (60 seconds) */
  WITHOUT_SCOREBOARD: 15 * 1000,
} as const;
