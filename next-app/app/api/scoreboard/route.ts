import { NextRequest, NextResponse } from 'next/server';
import { fetchNBAScoreboardsEndpoint } from '@/lib/nba';
import {
  transformNBAGamesToScoreboards,
  findScoreboardByCode,
} from '@/lib/nba-scoreboard-utils';
import { getLogger } from '@/lib/logger';

const logger = getLogger('scoreboard-api');

// Cache for 30 seconds - balances freshness with API rate limits
export const revalidate = 20;

/**
 * GET /api/scoreboard
 *
 * Fetches scoreboard data from NBA API with caching.
 *
 * Query params:
 * - code: Optional game code (e.g., "20251104/MILTOR") to filter to a single scoreboard
 *
 * Returns:
 * - Single scoreboard object if code param provided
 * - Array of all today's scoreboards if no code param
 * - null if not found or error occurs
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const gameCode = searchParams.get('code');

  logger.debug({ gameCode }, 'Fetching scoreboard data from NBA API');

  try {
    // Fetch from NBA API (this will use Next.js caching based on revalidate)
    const nbaResponse = await fetchNBAScoreboardsEndpoint();
    const games = nbaResponse.scoreboard?.games || [];

    if (games.length === 0) {
      logger.warn('No games found in NBA API response');
      return NextResponse.json(null);
    }

    // Transform NBA games to ScoreboardType format
    const scoreboards = transformNBAGamesToScoreboards(games);

    // If code param provided, return single scoreboard
    if (gameCode) {
      const scoreboard = findScoreboardByCode(scoreboards, gameCode);

      if (!scoreboard) {
        logger.debug({ gameCode }, 'Scoreboard not found for code');
        return NextResponse.json(null);
      }

      const duration = Date.now() - startTime;
      logger.info(
        { gameCode, duration },
        'Successfully fetched scoreboard by code'
      );

      return NextResponse.json(scoreboard);
    }

    // Return all scoreboards
    const duration = Date.now() - startTime;
    logger.info(
      { count: scoreboards.length, duration },
      'Successfully fetched all scoreboards'
    );

    return NextResponse.json(scoreboards);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        gameCode,
        error: error instanceof Error ? error.message : String(error),
        duration,
      },
      'Failed to fetch scoreboard data'
    );

    // Return null on error - components should handle this gracefully
    return NextResponse.json(null, { status: 500 });
  }
}
