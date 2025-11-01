'use server';

import { z } from 'zod';
import { PostHogClient } from '@/lib/posthog';
import { getMatchupsAndPicksByCodePrefix } from '@/lib/matchups';
import { getScoreboardsByCodePrefix } from '@/lib/scoreboards';
import type { GameType } from '@/lib/definitions';
import { expandAvatarUrl } from '@/lib/data_common';
import { getLogger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { getRequestPB } from '@/lib/data';

const logger = getLogger('actions:index');
const POSTHOG_API_TOKEN = process.env.POSTHOG_API_TOKEN || '';

const isFeatureEnabledSchema = z.object({
  feature: z.string(),
});

export async function isFeatureEnabled(data: z.infer<typeof isFeatureEnabledSchema>) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(`ph_${POSTHOG_API_TOKEN}_posthog`);
  
  let distinctId: string;
  if (cookie) {
    try {
      const cookieData = JSON.parse(cookie.value);
      distinctId = cookieData.distinct_id;
    } catch (error) {
      distinctId = crypto.randomUUID();
    }
  } else {
    distinctId = crypto.randomUUID();
  }
  
  const posthogClient = PostHogClient();
  if (!posthogClient) {
    return false;
  }
  return await posthogClient.isFeatureEnabled(data.feature, distinctId);
}

const getGamesByCodePrefixSchema = z.object({
  codePrefix: z.string(),
});

export async function getGamesByCodePrefix(data: z.infer<typeof getGamesByCodePrefixSchema>) {
  const matchupsAndPicks = await getMatchupsAndPicksByCodePrefix(
    data.codePrefix
  );
  const scoreboards = await getScoreboardsByCodePrefix(data.codePrefix);

  const games: GameType[] = [];
  for (const matchup of matchupsAndPicks) {
    const picks = expandAvatarUrl(matchup.expand?.picks_via_matchup || []);
    const scoreboard =
      scoreboards.find((sb) => sb.code === matchup.code) || null;
    delete matchup.expand;
    games.push({ matchup, scoreboard, picks });
  }
  return games;
}

const submitFeedbackSchema = z.object({
  name: z.string(),
  feedback: z.string(),
  page: z.string().url(),
});

export async function submitFeedback(data: z.infer<typeof submitFeedbackSchema>) {
  // Use request PB which will automatically load auth from cookies if available
  const pb = await getRequestPB();

  try {
    await pb.collection('feedback').create(data);
  } catch (error) {
    logger.error({ error }, 'Error submitting feedback');
    throw new Error('Failed to submit feedback');
  }
}