/**
 * Types for NBA Schedule API
 * Based on https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json
 */

export interface NBAScheduleResponse {
  meta: {
    version: number;
    request: string;
    time: string;
  };
  leagueSchedule: LeagueSchedule;
}

export interface LeagueSchedule {
  seasonYear: string;
  leagueId: string;
  gameDates: GameDate[];
  weeks: Week[];
  broadcasterList: Broadcaster[];
}

export interface GameDate {
  gameDate: string;
  games: Game[];
}

export interface Game {
  gameId: string;
  gameCode: string;
  gameStatus: number;
  gameStatusText: string;
  gameSequence: number;
  gameDateEst: string;
  gameTimeEst: string;
  gameDateTimeEst: string;
  gameDateUTC: string;
  gameTimeUTC: string;
  gameDateTimeUTC: string;
  awayTeamTime: string;
  homeTeamTime: string;
  day: string;
  monthNum: number;
  weekNumber: number;
  weekName: string;
  ifNecessary: boolean;
  seriesGameNumber: string;
  gameLabel: string;
  gameSubLabel: string;
  seriesText: string;
  arenaName: string;
  arenaState: string;
  arenaCity: string;
  postponedStatus: string;
  branchLink: string;
  gameSubtype: string;
  isNeutral: boolean;
  broadcasters: Broadcasters;
  homeTeam: Team;
  awayTeam: Team;
  pointsLeaders: PointsLeader[];
}

export interface Broadcasters {
  nationalTvBroadcasters: Broadcaster[];
  nationalRadioBroadcasters: Broadcaster[];
  nationalOttBroadcasters: Broadcaster[];
  homeTvBroadcasters: Broadcaster[];
  homeRadioBroadcasters: Broadcaster[];
  homeOttBroadcasters: Broadcaster[];
  awayTvBroadcasters: Broadcaster[];
  awayRadioBroadcasters: Broadcaster[];
  awayOttBroadcasters: Broadcaster[];
  intlRadioBroadcasters: Broadcaster[];
  intlTvBroadcasters: Broadcaster[];
  intlOttBroadcasters: Broadcaster[];
}

export interface Broadcaster {
  broadcasterId: number;
  broadcasterDisplay: string;
  broadcasterAbbreviation: string;
  broadcasterDescription: string;
  broadcasterScope?: string;
  broadcasterMedia?: string;
  tapeDelayComments?: string;
  broadcasterVideoLink?: string;
  regionId?: number;
  broadcasterTeamId?: number;
  broadcasterRanking?: number;
}

export interface Team {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  teamSlug: string;
  wins: number;
  losses: number;
  score: number;
  seed: number;
}

export interface PointsLeader {
  personId: number;
  firstName: string;
  lastName: string;
  teamId: number;
  teamCity: string;
  teamName: string;
  teamTricode: string;
  points: number;
}

export interface Week {
  weekNumber: number;
  weekName: string;
  startDate: string;
  endDate: string;
}
