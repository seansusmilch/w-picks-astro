/**
 * Types for NBA Scoreboard API
 * Based on https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json
 */

export interface NBAScoreboardsResponse {
  meta: {
    version: number;
    request: string;
    time: string;
    code: number;
  };
  scoreboard: Scoreboard;
}

export interface Scoreboard {
  gameDate: string;
  leagueId: string;
  leagueName: string;
  games: Game[];
}

export interface Game {
  gameId: string;
  gameCode: string;
  gameStatus: number;
  gameStatusText: string;
  period: number;
  gameClock: string;
  gameTimeUTC: string;
  gameEt: string;
  regulationPeriods: number;
  ifNecessary: boolean;
  seriesGameNumber: string;
  gameLabel: string;
  gameSubLabel: string;
  seriesText: string;
  seriesConference: string;
  poRoundDesc: string;
  gameSubtype: string;
  isNeutral: boolean;
  homeTeam: Team;
  awayTeam: Team;
  gameLeaders: GameLeaders;
  pbOdds: {
    team: string | null;
    odds: number;
    suspended: number;
  };
}

export interface Team {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  wins: number;
  losses: number;
  score: number;
  seed: number | null;
  inBonus: string | null;
  timeoutsRemaining: number;
  periods: Period[];
}

export interface Period {
  period: number;
  periodType: string;
  score: number;
}

export interface GameLeaders {
  homeLeaders: PlayerStats;
  awayLeaders: PlayerStats;
}

export interface PlayerStats {
  personId: number;
  name: string;
  jerseyNum: string;
  position: string;
  teamTricode: string;
  playerSlug: string | null;
  points: number;
  rebounds: number;
  assists: number;
}

