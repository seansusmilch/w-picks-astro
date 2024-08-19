import { z } from 'zod';

export const MatchupType = z.object({
  id: z.string(),
  code: z.string(),
  time_utc: z.string(),
  home_code: z.string().length(3),
  away_code: z.string().length(3),
});
