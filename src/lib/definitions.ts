import { z } from 'astro/zod';

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
export const PickZ = z
  .object({
    id: z.string().length(15),
    matchup: z.string().length(15),
    win_prediction: z.string().length(3),
    comment: z.string(),
    user: z.string().length(15),
  })
  .required({ matchup: true, win_prediction: true, user: true });

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
export const ScoreboardZ = z.object({
  id: z.string().length(15),
  code: z.string().length(15),
  status: z.number().min(0).max(3),
  status_text: z.string(),
  home_score: z.number().min(0),
  away_score: z.number().min(0),
});
