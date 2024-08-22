import { z } from 'astro:content';

export const MatchupZ = z.object({
  id: z.string().length(15),
  code: z.string().length(15),
  time_utc: z.string(),
  home_code: z.string().length(3),
  away_code: z.string().length(3),
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
export const PickZ = z.object({
  id: z.string().length(15),
  matchup: z.string().length(15),
  win_prediction: z.string().length(3),
  comment: z.string(),
  user: z.string().length(15),
});

export type PickType = z.infer<typeof PickZ>;
