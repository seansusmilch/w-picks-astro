import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { PostHogClient } from '@/lib/posthog';
import { POSTHOG_API_TOKEN } from 'astro:env/server';
import { getMatchupsAndPicksByCodePrefix } from '@/lib/matchups';
import { getScoreboardsByCodePrefix } from '@/lib/scoreboards';
import type { GameType } from '@/lib/definitions';
import { expandAvatarUrl } from '@/lib/data_common';
import { picks } from './picks';
import { users } from './users';

export const server = {
  isFeatureEnabled: defineAction({
    accept: 'json',
    input: z.object({
      feature: z.string(),
    }),
    async handler({ feature }, { cookies }) {
      const cookie = cookies.get(`ph_${POSTHOG_API_TOKEN}_posthog`);
      const distinctId = cookie?.json().distinct_id;
      if (!distinctId) {
        return crypto.randomUUID();
      }
      const posthogClient = PostHogClient();
      return await posthogClient.isFeatureEnabled(feature, distinctId);
    },
  }),
  getGamesByCodePrefix: defineAction({
    accept: 'json',
    input: z.object({
      codePrefix: z.string(),
    }),
    async handler({ codePrefix }) {
      const matchupsAndPicks = await getMatchupsAndPicksByCodePrefix(
        codePrefix
      );
      const scoreboards = await getScoreboardsByCodePrefix(codePrefix);

      const games: GameType[] = [];
      for (const matchup of matchupsAndPicks) {
        const picks = expandAvatarUrl(matchup.expand?.picks_via_matchup || []);
        const scoreboard =
          scoreboards.find((sb) => sb.code === matchup.code) || null;
        delete matchup.expand;
        games.push({ matchup, scoreboard, picks });
      }
      return games;
    },
  }),
  picks,
  users,
};
