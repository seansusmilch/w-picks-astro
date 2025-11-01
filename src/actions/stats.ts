'use server';

import { z } from 'zod';
import { getWeeklyStats } from '@/lib/stats';
import { expandAvatarUrl } from '@/lib/data_common';
import { WeeklyStatZ } from '@/lib/definitions';
import { getLogger } from '@/lib/logger';

const logger = getLogger('actions:stats');

const getWeeklyStatsSchema = z.object({
  week: WeeklyStatZ.shape.year_week,
});

export async function getWeeklyStatsAction(data: z.infer<typeof getWeeklyStatsSchema>) {
  logger.info({ week: data.week }, 'Getting weekly stats');
  const weeklyStats = await getWeeklyStats(data.week);
  return expandAvatarUrl(weeklyStats);
}