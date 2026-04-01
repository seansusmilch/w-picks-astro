import type { NBAScheduleResponse } from './types/nba-schedule';
import type { NBAScoreboardsResponse } from './types/nba-scoreboards';
import { getLogger } from './logger';

const logger = getLogger('nba-api');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry<T>(
  url: string,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        throw new Error(
          `NBA API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        logger.warn(
          {
            url,
            attempt: attempt + 1,
            maxRetries: retries,
            delayMs: delay,
            error: lastError.message,
          },
          `NBA API fetch failed, retrying in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error(
          {
            url,
            attempts: retries + 1,
            error: lastError.message,
          },
          'NBA API fetch failed after all retries'
        );
      }
    }
  }

  throw lastError || new Error('Unknown error during NBA API fetch');
}

/**
 * Fetches NBA schedule data from the official NBA API
 * @returns Promise resolving to NBA schedule response
 */
export async function fetchNBAScheduleEndpoint(): Promise<NBAScheduleResponse> {
  const NBA_MATCHUPS_URL =
    'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json';

  logger.debug({ url: NBA_MATCHUPS_URL }, 'Fetching NBA schedule');

  try {
    const data = await fetchWithRetry<NBAScheduleResponse>(NBA_MATCHUPS_URL);
    logger.info(
      {
        gameDatesCount: data.leagueSchedule?.gameDates?.length || 0,
      },
      'Successfully fetched NBA schedule'
    );
    return data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch NBA schedule'
    );
    throw error;
  }
}

/**
 * Fetches NBA scoreboards data from the official NBA API
 * @returns Promise resolving to NBA scoreboards response
 */
export async function fetchNBAScoreboardsEndpoint(): Promise<NBAScoreboardsResponse> {
  const NBA_SCOREBOARDS_URL =
    'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';

  logger.debug({ url: NBA_SCOREBOARDS_URL }, 'Fetching NBA scoreboards');

  try {
    const data = await fetchWithRetry<NBAScoreboardsResponse>(
      NBA_SCOREBOARDS_URL
    );
    logger.info(
      {
        gamesCount: data.scoreboard?.games?.length || 0,
      },
      'Successfully fetched NBA scoreboards'
    );
    return data;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch NBA scoreboards'
    );
    throw error;
  }
}

