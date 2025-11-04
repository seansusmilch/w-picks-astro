'use server';

import { initPocketBase, getAdminPocketBase } from '@/lib/pocketbase-server';
import type {
  MatchupType,
  ScoreboardType,
  PickType,
  GameType,
} from '@/lib/definitions';
import { MatchupZ, ScoreboardZ, PickZ, UserZ } from '@/lib/definitions';
import { getCurrentWeekCodePrefixes } from '@/lib/date-utils';
import { getLogger } from '@/lib/logger';
import { getUserAvatarUrl } from '@/lib/utils';

const logger = getLogger('matchups');

function expandAvatarUrls(picks: PickType[]): PickType[] {
  return picks.map((pick) => {
    if (pick.expand?.user) {
      return {
        ...pick,
        expand: {
          ...pick.expand,
          user: {
            ...pick.expand.user,
            avatar_url:
              getUserAvatarUrl(pick.expand.user.id, pick.expand.user.avatar) ||
              undefined, // Convert null to undefined for type compatibility
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
  logger.debug({ code }, 'Fetching matchup by code');

  const pb = await initPocketBase();

  try {
    const matchupRecord = await pb
      .collection('matchups')
      .getFirstListItem(`code = "${code}"`)
      .catch((error) => {
        logger.debug(
          {
            code,
            error: error instanceof Error ? error.message : String(error),
          },
          'Matchup not found in PocketBase'
        );
        return null;
      });

    if (!matchupRecord) {
      logger.debug({ code }, 'Matchup record is null');
      return null;
    }

    const parsedMatchup = MatchupZ.safeParse(matchupRecord);
    if (!parsedMatchup.success) {
      logger.error(
        {
          code,
          validationErrors: parsedMatchup.error.issues,
        },
        'Matchup validation failed'
      );
      return null;
    }

    logger.debug(
      { code, matchupId: parsedMatchup.data.id },
      'Matchup fetched and validated'
    );
    return parsedMatchup.data;
  } catch (error) {
    logger.error(
      {
        code,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch matchup'
    );
    return null;
  }
}

export async function getScoreboardByCode(
  code: string
): Promise<ScoreboardType | null> {
  logger.debug({ code }, 'Fetching scoreboard by code');

  const pb = await initPocketBase();

  try {
    const scoreboardRecord = await pb
      .collection('scoreboards')
      .getFirstListItem(`code = "${code}"`)
      .catch((error) => {
        logger.debug(
          {
            code,
            error: error instanceof Error ? error.message : String(error),
          },
          'Scoreboard not found in PocketBase'
        );
        return null;
      });

    if (!scoreboardRecord) {
      logger.debug({ code }, 'Scoreboard record is null');
      return null;
    }

    const parsedScoreboard = ScoreboardZ.safeParse(scoreboardRecord);
    if (!parsedScoreboard.success) {
      logger.error(
        {
          code,
          validationErrors: parsedScoreboard.error.issues,
        },
        'Scoreboard validation failed'
      );
      return null;
    }

    logger.debug(
      { code, scoreboardId: parsedScoreboard.data.id },
      'Scoreboard fetched and validated'
    );
    return parsedScoreboard.data;
  } catch (error) {
    logger.error(
      {
        code,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch scoreboard'
    );
    return null;
  }
}

/**
 * Fetches picks for a specific matchup by its ID.
 * This is optimized to avoid redundant matchup fetching.
 * Uses admin instance for proper permissions (like Astro does).
 */
export async function getPicksByMatchupId(
  matchupId: string
): Promise<PickType[]> {
  const startTime = Date.now();
  logger.debug({ matchupId }, 'Fetching picks by matchup ID');

  // Use admin instance for proper permissions (like Astro does)
  const pb = await getAdminPocketBase();

  try {
    logger.debug({ matchupId }, 'Querying PocketBase for picks');
    const picksRecords = await pb
      .collection('picks')
      .getFullList({
        filter: `matchup = "${matchupId}"`,
        expand: 'user',
        // Only expand user, not matchup since we already have it
        fields:
          '*,expand.user.id,expand.user.avatar,expand.user.username,expand.user.email,expand.user.bio',
      })
      .catch((error) => {
        logger.error(
          {
            matchupId,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to fetch picks from PocketBase'
        );
        return [];
      });

    logger.debug(
      { matchupId, recordsCount: picksRecords.length },
      'Received picks records from PocketBase'
    );

    const picks: PickType[] = [];
    let validPicks = 0;
    let invalidPicks = 0;

    for (const pickRecord of picksRecords) {
      const parsedPick = PickZ.safeParse(pickRecord);
      if (parsedPick.success) {
        picks.push(parsedPick.data);
        validPicks++;
      } else {
        invalidPicks++;
        logger.warn(
          {
            matchupId,
            pickId: pickRecord.id,
            validationErrors: parsedPick.error.issues,
          },
          'Failed to validate pick record'
        );
      }
    }

    logger.debug(
      {
        matchupId,
        totalRecords: picksRecords.length,
        validPicks,
        invalidPicks,
      },
      'Parsed picks records'
    );

    const picksWithAvatars = expandAvatarUrls(picks);
    const duration = Date.now() - startTime;

    logger.info(
      {
        matchupId,
        picksCount: picksWithAvatars.length,
        duration,
      },
      'Successfully fetched picks by matchup ID'
    );

    return picksWithAvatars;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        matchupId,
        error: error instanceof Error ? error.message : String(error),
        duration,
      },
      'Failed to fetch picks by matchup ID'
    );
    return [];
  }
}

/**
 * Fetches picks for a matchup by its code.
 * Note: This fetches the matchup first, then picks separately.
 * For better performance, use getMatchupPageData which fetches everything together.
 */
export async function getPicksByMatchupCode(code: string): Promise<PickType[]> {
  logger.debug({ code }, 'Fetching picks by matchup code');
  const matchup = await getMatchupByCode(code);
  if (!matchup) {
    logger.warn({ code }, 'Matchup not found for code');
    return [];
  }
  logger.debug(
    { code, matchupId: matchup.id },
    'Found matchup, fetching picks'
  );
  return getPicksByMatchupId(matchup.id);
}

export interface MatchupPageData {
  matchup: MatchupType;
  scoreboard: ScoreboardType | null;
  picks: PickType[];
}

/**
 * Fetches matchup data with picks using PocketBase relation expansion.
 * This is more efficient than fetching matchup and picks separately.
 * Similar to Astro's getMatchupsAndPicksByCodePrefix but for a single matchup.
 */
export async function getMatchupPageData(
  code: string
): Promise<MatchupPageData | null> {
  const startTime = Date.now();
  logger.info({ code }, 'Fetching matchup page data with picks');

  // Use admin instance for relation expansion (like Astro does)
  // This ensures we have proper permissions to expand picks_via_matchup
  const pb = await getAdminPocketBase();

  try {
    // Fetch matchup with picks using relation expansion (like Astro does)
    // This is more efficient than separate queries
    logger.debug(
      { code },
      'Querying PocketBase for matchup with expanded picks'
    );
    const matchupRecord = await pb
      .collection('matchups')
      .getFirstListItem(`code = "${code}"`, {
        expand: ['picks_via_matchup', 'picks_via_matchup.user'].join(','),
        // Note: PocketBase will return all fields for expanded relations
        // We filter what we need during parsing
      })
      .catch((error) => {
        logger.error(
          {
            code,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to fetch matchup record from PocketBase'
        );
        return null;
      });

    if (!matchupRecord) {
      logger.warn({ code }, 'Matchup not found');
      return null;
    }

    logger.debug(
      { code, matchupId: matchupRecord.id },
      'Matchup record fetched'
    );

    // Log the expand structure for debugging
    logger.debug(
      {
        code,
        matchupId: matchupRecord.id,
        hasExpand: !!matchupRecord.expand,
        expandKeys: matchupRecord.expand
          ? Object.keys(matchupRecord.expand)
          : [],
      },
      'Expand structure check'
    );

    // Extract picks from the expanded relation BEFORE parsing matchup
    // (parsing strips the expand property)
    // Type assertion needed because PocketBase's expand is typed as any
    const picksRecords = (matchupRecord.expand as any)?.picks_via_matchup || [];
    logger.debug(
      {
        code,
        matchupId: matchupRecord.id,
        picksRecordsCount: picksRecords.length,
        expandType: Array.isArray(picksRecords) ? 'array' : typeof picksRecords,
      },
      'Extracted picks from expanded relation'
    );

    const picks: PickType[] = [];
    let validPicks = 0;
    let invalidPicks = 0;

    for (const pickRecord of picksRecords) {
      // Log the pick record structure for debugging
      logger.debug(
        {
          code,
          matchupId: matchupRecord.id,
          pickId: pickRecord.id,
          hasExpand: !!pickRecord.expand,
          expandKeys: pickRecord.expand ? Object.keys(pickRecord.expand) : [],
          hasUser: !!pickRecord.expand?.user,
          pickFields: Object.keys(pickRecord),
        },
        'Pick record structure before parsing'
      );

      // When picks come from expanded relation, they're already valid PocketBase records
      // We don't need strict validation - just ensure basic structure exists
      // This matches how Astro handles picks from expanded relations
      if (
        pickRecord.id &&
        pickRecord.matchup &&
        pickRecord.user &&
        pickRecord.win_prediction
      ) {
        // Use the pick record as-is, similar to Astro's approach
        // The expand structure is already correct from PocketBase
        const pick: PickType = {
          id: pickRecord.id,
          created: pickRecord.created,
          updated: pickRecord.updated,
          matchup:
            typeof pickRecord.matchup === 'string'
              ? pickRecord.matchup
              : pickRecord.matchup.id || pickRecord.matchup,
          win_prediction: pickRecord.win_prediction,
          comment: pickRecord.comment || '',
          user:
            typeof pickRecord.user === 'string'
              ? pickRecord.user
              : pickRecord.user.id || pickRecord.user,
          status: pickRecord.status || '',
          result: pickRecord.result || '',
          expand: pickRecord.expand
            ? {
                user: pickRecord.expand.user,
                matchup: pickRecord.expand.matchup,
              }
            : undefined,
        } as PickType;

        picks.push(pick);
        validPicks++;
      } else {
        invalidPicks++;
        logger.warn(
          {
            code,
            matchupId: matchupRecord.id,
            pickId: pickRecord.id,
            pickRecordKeys: Object.keys(pickRecord),
            hasMatchup: !!pickRecord.matchup,
            hasUser: !!pickRecord.user,
            hasWinPrediction: !!pickRecord.win_prediction,
          },
          'Pick record missing required fields'
        );
      }
    }

    logger.debug(
      {
        code,
        matchupId: matchupRecord.id,
        totalRecords: picksRecords.length,
        validPicks,
        invalidPicks,
      },
      'Parsed picks from expanded relation'
    );

    // Parse and validate matchup
    const parsedMatchup = MatchupZ.safeParse(matchupRecord);
    if (!parsedMatchup.success) {
      logger.error(
        {
          code,
          matchupId: matchupRecord.id,
          validationErrors: parsedMatchup.error.issues,
        },
        'Matchup validation failed'
      );
      return null;
    }

    const matchup = parsedMatchup.data;
    logger.debug(
      { code, matchupId: matchup.id },
      'Matchup validated successfully'
    );

    // Fetch scoreboard
    logger.debug({ code }, 'Fetching scoreboard');
    const scoreboard = await getScoreboardByCode(code);

    // Expand avatar URLs for picks
    const picksWithAvatars = expandAvatarUrls(picks);
    logger.debug(
      {
        code,
        picksCount: picksWithAvatars.length,
      },
      'Expanded avatar URLs for picks'
    );

    const duration = Date.now() - startTime;
    logger.info(
      {
        code,
        matchupId: matchup.id,
        picksCount: picksWithAvatars.length,
        hasScoreboard: !!scoreboard,
        duration,
      },
      'Successfully fetched matchup page data'
    );

    return {
      matchup,
      scoreboard,
      picks: picksWithAvatars,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        code,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        duration,
      },
      'Failed to fetch matchup page data'
    );
    return null;
  }
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

/**
 * Fetches scoreboards for a given code prefix (date code)
 */
export async function getScoreboardsByCodePrefix(
  codePrefix: string
): Promise<ScoreboardType[]> {
  logger.debug({ codePrefix }, 'Fetching scoreboards by code prefix');

  const pb = await getAdminPocketBase();

  try {
    const scoreboardRecords = await pb
      .collection('scoreboards')
      .getFullList({
        filter: `code ?~ "${codePrefix}"`,
      })
      .catch((error) => {
        logger.error(
          {
            codePrefix,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to fetch scoreboards'
        );
        return [];
      });

    const scoreboards: ScoreboardType[] = [];
    for (const record of scoreboardRecords) {
      const parsed = ScoreboardZ.safeParse(record);
      if (parsed.success) {
        scoreboards.push(parsed.data);
      }
    }

    logger.debug(
      { codePrefix, count: scoreboards.length },
      'Fetched scoreboards by code prefix'
    );
    return scoreboards;
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

/**
 * Fetches matchups with picks for a given code prefix (date code)
 */
export async function getMatchupsAndPicksByCodePrefix(
  codePrefix: string
): Promise<any[]> {
  logger.debug({ codePrefix }, 'Fetching matchups and picks by code prefix');

  const pb = await getAdminPocketBase();

  try {
    const matchupRecords = await pb
      .collection('matchups')
      .getFullList({
        filter: `code ?~ "${codePrefix}"`,
        sort: '+time_utc',
        expand: ['picks_via_matchup', 'picks_via_matchup.user'].join(','),
      })
      .catch((error) => {
        logger.error(
          {
            codePrefix,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to fetch matchups'
        );
        return [];
      });

    logger.debug(
      { codePrefix, count: matchupRecords.length },
      'Fetched matchups and picks by code prefix'
    );
    return matchupRecords;
  } catch (error) {
    logger.error(
      {
        codePrefix,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch matchups and picks by code prefix'
    );
    return [];
  }
}

/**
 * Fetches games (matchups + scoreboards + picks) for a given code prefix
 * Returns GameType[] matching the astro-app structure
 */
export async function getGamesByCodePrefix(
  codePrefix: string
): Promise<GameType[]> {
  logger.debug({ codePrefix }, 'Fetching games by code prefix');

  try {
    const [matchupsAndPicks, scoreboards] = await Promise.all([
      getMatchupsAndPicksByCodePrefix(codePrefix),
      getScoreboardsByCodePrefix(codePrefix),
    ]);

    const games: GameType[] = [];

    for (const matchupRecord of matchupsAndPicks) {
      // Extract picks from expanded relation
      // Type assertion needed because PocketBase's expand is typed as any
      const picksRecords = (matchupRecord.expand as any)?.picks_via_matchup || [];
      const picks: PickType[] = [];
      let validPicks = 0;
      let invalidPicks = 0;

      logger.debug(
        {
          codePrefix,
          matchupId: matchupRecord.id,
          picksRecordsCount: picksRecords.length,
          expandType: Array.isArray(picksRecords) ? 'array' : typeof picksRecords,
        },
        'Extracting picks from expanded relation'
      );

      for (const pickRecord of picksRecords) {
        // When picks come from expanded relation, they're already valid PocketBase records
        // We don't need strict validation - just ensure basic structure exists
        // This matches how getMatchupPageData handles picks from expanded relations
        if (
          pickRecord.id &&
          pickRecord.matchup &&
          pickRecord.user &&
          pickRecord.win_prediction
        ) {
          // Use the pick record as-is, similar to getMatchupPageData's approach
          // The expand structure is already correct from PocketBase
          const pick: PickType = {
            id: pickRecord.id,
            created: pickRecord.created,
            updated: pickRecord.updated,
            matchup:
              typeof pickRecord.matchup === 'string'
                ? pickRecord.matchup
                : pickRecord.matchup.id || pickRecord.matchup,
            win_prediction: pickRecord.win_prediction,
            comment: pickRecord.comment || '',
            user:
              typeof pickRecord.user === 'string'
                ? pickRecord.user
                : pickRecord.user.id || pickRecord.user,
            status: pickRecord.status || '',
            result: pickRecord.result || '',
            expand: pickRecord.expand
              ? {
                  user: pickRecord.expand.user,
                  matchup: pickRecord.expand.matchup,
                }
              : undefined,
          } as PickType;

          picks.push(pick);
          validPicks++;
        } else {
          invalidPicks++;
          logger.warn(
            {
              codePrefix,
              matchupId: matchupRecord.id,
              pickId: pickRecord.id,
              pickRecordKeys: Object.keys(pickRecord),
              hasMatchup: !!pickRecord.matchup,
              hasUser: !!pickRecord.user,
              hasWinPrediction: !!pickRecord.win_prediction,
            },
            'Pick record missing required fields in getGamesByCodePrefix'
          );
        }
      }

      logger.debug(
        {
          codePrefix,
          matchupId: matchupRecord.id,
          totalRecords: picksRecords.length,
          validPicks,
          invalidPicks,
        },
        'Parsed picks from expanded relation'
      );

      // Parse matchup (remove expand property)
      const { expand, ...matchupWithoutExpand } = matchupRecord;
      const parsedMatchup = MatchupZ.safeParse(matchupWithoutExpand);

      if (!parsedMatchup.success) {
        logger.warn(
          {
            codePrefix,
            matchupId: matchupRecord.id,
            validationErrors: parsedMatchup.error.issues,
          },
          'Failed to validate matchup'
        );
        continue;
      }

      const matchup = parsedMatchup.data;

      // Find matching scoreboard
      const scoreboard =
        scoreboards.find((sb) => sb.code === matchup.code) || null;

      // Expand avatar URLs for picks
      const picksWithAvatars = expandAvatarUrls(picks);

      games.push({
        matchup,
        scoreboard: scoreboard || undefined,
        picks: picksWithAvatars,
      });
    }

    logger.debug(
      { codePrefix, gamesCount: games.length },
      'Successfully fetched games by code prefix'
    );

    return games;
  } catch (error) {
    logger.error(
      {
        codePrefix,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch games by code prefix'
    );
    return [];
  }
}