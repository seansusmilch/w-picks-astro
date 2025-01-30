import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getWeeklyStats } from '@/lib/stats';
import { expandAvatarUrl } from '@/lib/data_common';
import { WeeklyStatZ } from '@/lib/definitions';

export const stats = {
  getWeeklyStats: defineAction({
    accept: 'json',
    input: z.object({
      week: WeeklyStatZ.shape.year_week,
    }),
    handler: async ({ week }) => {
      const weeklyStats = await getWeeklyStats(week);
      return expandAvatarUrl(weeklyStats);
    },
  }),
};
