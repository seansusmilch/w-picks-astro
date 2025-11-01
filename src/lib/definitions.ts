import { z } from 'zod';

export const BaseZ = z.object({
  id: z.string().length(15),
  created: z.string(),
  updated: z.string(),
});

export const UserSettingsZ = z.object({
  colorfulPicks: z.boolean().default(true),
  hideFromLatestPicks: z.boolean().default(false),
});

export type UserSettingsType = z.infer<typeof UserSettingsZ>;

export const UserZ = BaseZ.extend({
  email: z.string().email(),
  username: z.string(),
  avatar: z.string(),
  bio: z.string(),
  avatar_url: z.string().url().optional(),
  settings: UserSettingsZ.nullable().default(UserSettingsZ.parse({})),
});

export type UserType = z.infer<typeof UserZ>;

export const MatchupZ = BaseZ.extend({
  code: z.string().length(15),
  time_utc: z.string(),
  home_code: z.string().length(3),
  away_code: z.string().length(3),
  home_meta: z
    .object({
      wins: z.number().min(0),
      losses: z.number().min(0),
    })
    .nullable(),
  away_meta: z
    .object({
      wins: z.number().min(0),
      losses: z.number().min(0),
    })
    .nullable(),
  scoreboard: z.string().length(15).or(z.literal('')),
});

export type MatchupType = z.infer<typeof MatchupZ>;

/**
 *{
  "matchup": "RELATION_RECORD_ID",
  "win_prediction": "test",
  "comment": "test",
  "user": "RELATION_RECORD_ID"
};
 */
export const PickZ = BaseZ.extend({
  matchup: z.string().length(15),
  win_prediction: z.string().length(3),
  comment: z.string(),
  user: z.string().length(15),
  status: z.string(),
  result: z.string(),
  expand: z
    .object({
      user: UserZ,
      matchup: MatchupZ,
    })
    .optional(),
}).required({ matchup: true, win_prediction: true, user: true });

export type PickType = z.infer<typeof PickZ>;

/**
 * {
 *  "id": "RELATION_RECORD_ID",
    "code": "20240203/LALNYK",
    "status": 3,
    "status_text": "Final",
    "home_score": 105,
    "away_score": 113,
  }
 */
export const ScoreboardZ = BaseZ.extend({
  code: z.string().length(15),
  status: z.number().min(0).max(3),
  status_text: z.string(),
  home_score: z.number().min(0),
  away_score: z.number().min(0),
});

export type ScoreboardType = z.infer<typeof ScoreboardZ>;

export const StatZ = z.object({
  user: z.string().length(15),
  total_picks: z.number().min(0),
  win_picks: z.number().min(0),
  lose_picks: z.number().min(0),
  win_loss_ratio: z.number().min(0).or(z.null()),
  win_pick_rate: z.number().min(0).max(100).or(z.null()),
});

export type StatType = z.infer<typeof StatZ>;

export const WeeklyStatZ = StatZ.extend({
  year_week: z
    .string()
    .length(8)
    .regex(/^\d{4}-W\d{2}$/),
});

export type WeeklyStatType = z.infer<typeof WeeklyStatZ>;

export const GameZ = z.object({
  matchup: MatchupZ,
  scoreboard: ScoreboardZ.optional(),
  picks: z.array(PickZ),
});

export type GameType = z.infer<typeof GameZ>;

export const PageEntryZ = z.object({
  date_code: z.union([z.string(), z.number()]),
  title: z.string(),
  href: z.string().url(),
});

export type PageEntryType = z.infer<typeof PageEntryZ>;

export const MatchupsByCodePrefixZ = z.object({
  date_code: z.union([z.string(), z.number()]),
  matchup_count: z.number().min(0),
});

export type MatchupsByCodePrefixType = z.infer<typeof MatchupsByCodePrefixZ>;

export const ReactionZ = z.object({
  user: z.string().length(15),
  pick: z.string().length(15),
});

export type ReactionType = z.infer<typeof ReactionZ>;
