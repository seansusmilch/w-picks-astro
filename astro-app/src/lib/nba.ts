import type { NBAScheduleResponse } from '@/lib/types/nba-schedule';
import type { NBAScoreboardsResponse } from '@/lib/types/nba-scoreboards';

export async function fetchNBAScheduleEndpoint(): Promise<NBAScheduleResponse> {
  const NBA_MATCHUPS_URL =
    'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json';

  const response = await fetch(NBA_MATCHUPS_URL);
  const data = await response.json();

  return data;
}

export async function fetchNBAScoreboardsEndpoint(): Promise<NBAScoreboardsResponse> {
  const NBA_SCOREBOARDS_URL =
    'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';

  const response = await fetch(NBA_SCOREBOARDS_URL);
  const data = await response.json();

  return data;
}
