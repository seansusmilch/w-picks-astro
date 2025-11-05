'use server';

import type { ScoreboardType } from '@/lib/definitions';
import { fetchNBAScoreboardsEndpoint } from '@/lib/nba';
import {
  transformNBAGamesToScoreboards,
  findScoreboardByCode,
} from '@/lib/nba-scoreboard-utils';
import { getLogger } from '@/lib/logger';

const logger = getLogger('scoreboards');

/**
 * Fetches scoreboard data by game code from the NBA API
 * This replaces the database-based getScoreboardByCode() function
 * Uses Next.js caching via fetch options
 */
export async function getScoreboardByCode(
  code: string
): Promise<ScoreboardType | null> {
  logger.debug({ code }, 'Fetching scoreboard by code from NBA API');

  try {
    // Fetch from NBA API (Next.js will cache this based on revalidate)
    const nbaResponse = await fetchNBAScoreboardsEndpoint();
    const games = nbaResponse.scoreboard?.games || [];

    if (games.length === 0) {
      logger.debug({ code }, 'No games found in NBA API response');
      return null;
    }

    // Transform and find the specific scoreboard
    const scoreboards = transformNBAGamesToScoreboards(games);
    const scoreboard = findScoreboardByCode(scoreboards, code);

    if (!scoreboard) {
      logger.debug({ code }, 'Scoreboard not found for code');
      return null;
    }

    logger.debug({ code }, 'Successfully fetched scoreboard from NBA API');
    return scoreboard;
  } catch (error) {
    logger.error(
      {
        code,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch scoreboard from NBA API'
    );
    return null;
  }
}

/**
 * Fetches all scoreboards for today from the NBA API
 */
export async function getTodayScoreboards(): Promise<ScoreboardType[]> {
  logger.debug('Fetching all today scoreboards from NBA API');

  try {
    const nbaResponse = await fetchNBAScoreboardsEndpoint();
    const games = nbaResponse.scoreboard?.games || [];

    if (games.length === 0) {
      logger.debug('No games found in NBA API response');
      return [];
    }

    const scoreboards = transformNBAGamesToScoreboards(games);

    logger.debug(
      { count: scoreboards.length },
      'Successfully fetched scoreboards from NBA API'
    );
    return scoreboards;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch scoreboards from NBA API'
    );
    return [];
  }
}

/**
 * Fetches scoreboards for a given code prefix (date code) from the NBA API
 * Filters scoreboards that match the prefix
 */
export async function getScoreboardsByCodePrefix(
  codePrefix: string
): Promise<ScoreboardType[]> {
  logger.debug(
    { codePrefix },
    'Fetching scoreboards by code prefix from NBA API'
  );

  try {
    const allScoreboards = await getTodayScoreboards();

    // Filter scoreboards that match the code prefix
    const filtered = allScoreboards.filter((sb) =>
      sb.code.startsWith(codePrefix)
    );

    logger.debug(
      { codePrefix, count: filtered.length },
      'Filtered scoreboards by code prefix'
    );

    return filtered;
  } catch (error) {
    logger.error(
      {
        codePrefix,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch scoreboards by code prefix'
    );
    return [];
  }
}
