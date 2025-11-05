import type { Game } from './types/nba-scoreboards';
import type { ScoreboardType } from './definitions';

/**
 * Transforms an NBA API Game object to ScoreboardType format
 * Handles edge cases like missing data or invalid formats
 */
export function transformNBAGameToScoreboard(game: Game): ScoreboardType | null {
  try {
    // Validate required fields
    if (!game.gameCode || typeof game.gameStatus !== 'number') {
      return null;
    }

    // Extract scores with fallback to 0
    const homeScore = game.homeTeam?.score ?? 0;
    const awayScore = game.awayTeam?.score ?? 0;

    // Ensure scores are non-negative
    const home_score = Math.max(0, homeScore);
    const away_score = Math.max(0, awayScore);

    // Ensure status is within valid range (0-3)
    const status = Math.max(0, Math.min(3, game.gameStatus));

    // Get status text, fallback to empty string
    const status_text = game.gameStatusText?.trim() || '';

    // Note: We're creating a temporary ScoreboardType without id/created/updated
    // These will be added by the API endpoint or caller
    // The code field matches the gameCode from NBA API
    return {
      id: '', // Will be set by caller or not needed for API responses
      created: new Date().toISOString(), // Placeholder
      updated: new Date().toISOString(), // Placeholder
      code: game.gameCode,
      status,
      status_text,
      home_score,
      away_score,
    };
  } catch (error) {
    console.error('Error transforming NBA game to scoreboard:', error);
    return null;
  }
}

/**
 * Transforms multiple NBA API Game objects to ScoreboardType array
 * Filters out any invalid transformations
 */
export function transformNBAGamesToScoreboards(
  games: Game[]
): ScoreboardType[] {
  return games
    .map(transformNBAGameToScoreboard)
    .filter((scoreboard): scoreboard is ScoreboardType => scoreboard !== null);
}

/**
 * Finds a scoreboard by game code from an array of scoreboards
 */
export function findScoreboardByCode(
  scoreboards: ScoreboardType[],
  code: string
): ScoreboardType | null {
  return scoreboards.find((sb) => sb.code === code) || null;
}

