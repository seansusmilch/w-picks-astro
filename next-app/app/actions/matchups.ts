'use server';

import { initPocketBase } from '@/lib/pocketbase-server';
import type {
  MatchupType,
  ScoreboardType,
  PickType,
} from '@/lib/definitions';
import { MatchupZ, ScoreboardZ, PickZ } from '@/lib/definitions';
import { getCurrentWeekCodePrefixes } from '@/lib/date-utils';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

function getUserAvatarUrl(userId: string, filename: string): string | null {
  if (!filename || !userId) return null;
  return new URL(`/api/files/users/${userId}/${filename}`, POCKETBASE_URL).toString();
}

function expandAvatarUrls(picks: PickType[]): PickType[] {
  return picks.map((pick) => {
    if (pick.expand?.user) {
      return {
        ...pick,
        expand: {
          ...pick.expand,
          user: {
            ...pick.expand.user,
            avatar_url: getUserAvatarUrl(
              pick.expand.user.id,
              pick.expand.user.avatar
            ),
          },
        },
      };
    }
    return pick;
  });
}

export async function getMatchupByCode(
  code: string
): Promise<MatchupType | null> {
  const pb = await initPocketBase();

  try {
    const matchupRecord = await pb
      .collection('matchups')
      .getFirstListItem(`code = "${code}"`)
      .catch(() => null);

    if (!matchupRecord) return null;

    const parsedMatchup = MatchupZ.safeParse(matchupRecord);
    if (!parsedMatchup.success) {
      console.error('Matchup validation failed', parsedMatchup.error);
      return null;
    }

    return parsedMatchup.data;
  } catch (error) {
    console.error('Failed to fetch matchup', error);
    return null;
  }
}

export async function getScoreboardByCode(
  code: string
): Promise<ScoreboardType | null> {
  const pb = await initPocketBase();

  try {
    const scoreboardRecord = await pb
      .collection('scoreboards')
      .getFirstListItem(`code = "${code}"`)
      .catch(() => null);

    if (!scoreboardRecord) return null;

    const parsedScoreboard = ScoreboardZ.safeParse(scoreboardRecord);
    if (!parsedScoreboard.success) {
      console.error('Scoreboard validation failed', parsedScoreboard.error);
      return null;
    }

    return parsedScoreboard.data;
  } catch (error) {
    console.error('Failed to fetch scoreboard', error);
    return null;
  }
}

export async function getPicksByMatchupCode(
  code: string
): Promise<PickType[]> {
  const pb = await initPocketBase();

  try {
    const matchup = await getMatchupByCode(code);
    if (!matchup) return [];

    const picksRecords = await pb
      .collection('picks')
      .getFullList({
        filter: `matchup = "${matchup.id}"`,
        expand: 'user,matchup',
      })
      .catch(() => []);

    const picks: PickType[] = [];
    for (const pickRecord of picksRecords) {
      const parsedPick = PickZ.safeParse(pickRecord);
      if (parsedPick.success) {
        picks.push(parsedPick.data);
      }
    }

    return expandAvatarUrls(picks);
  } catch (error) {
    console.error('Failed to fetch picks', error);
    return [];
  }
}

export interface MatchupPageData {
  matchup: MatchupType;
  scoreboard: ScoreboardType | null;
  picks: PickType[];
}

export async function getMatchupPageData(
  code: string
): Promise<MatchupPageData | null> {
  const matchup = await getMatchupByCode(code);
  if (!matchup) return null;

  const [scoreboard, picks] = await Promise.all([
    getScoreboardByCode(code),
    getPicksByMatchupCode(code),
  ]);

  return {
    matchup,
    scoreboard,
    picks,
  };
}

export async function getCurrentWeekMatchups(): Promise<MatchupType[]> {
  const pb = await initPocketBase();
  const codePrefixes = getCurrentWeekCodePrefixes();
  
  try {
    const allMatchups: MatchupType[] = [];
    
    for (const codePrefix of codePrefixes) {
      const matchups = await pb
        .collection('matchups')
        .getFullList({
          filter: `code ?~ "${codePrefix}"`,
          sort: '+time_utc',
        })
        .catch(() => []);
      
      for (const matchupRecord of matchups) {
        const parsedMatchup = MatchupZ.safeParse(matchupRecord);
        if (parsedMatchup.success) {
          allMatchups.push(parsedMatchup.data);
        }
      }
    }
    
    return allMatchups;
  } catch (error) {
    console.error('Failed to fetch current week matchups', error);
    return [];
  }
}

