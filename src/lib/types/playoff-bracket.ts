export interface PlayoffBracketSeries {
    // seriesId: string;
    roundNumber: number;
    // seriesNumber: number;
    seriesConference: string;
    seriesText: string | null;
    // seriesStatus: number;
    // seriesWinner: number;
    // highSeedId: number;
    highSeedCity: string | null;
    highSeedName: string | null;
    highSeedTricode: string | null;
    highSeedRank: number;
    highSeedSeriesWins: number;
    // highSeedRegSeasonWins?: number;
    // highSeedRegSeasonLosses?: number;
    // lowSeedId: number;
    lowSeedCity: string | null;
    lowSeedName: string | null;
    lowSeedTricode: string | null;
    lowSeedRank: number;
    lowSeedSeriesWins: number;
    // lowSeedRegSeasonWins?: number;
    // lowSeedRegSeasonLosses?: number;
    displayOrderNumber: number;
    // displayTopTeam: number;
    // displayBottomTeam: number;
    poRoundDesc: string | null;
}

export interface PlayoffBracketResponse {
    // meta: {
    //     version: number;
    //     request: string;
    //     time: string;
    // };
    bracket: {
        // leagueId: string;
        // seasonYear: string;
        // bracketType: string;
        playoffBracketSeries: PlayoffBracketSeries[];
        currentRound: number;
    };
}

export interface RoundSeries {
    [round: number]: PlayoffBracketSeries[];
}

export interface BracketData {
    East: RoundSeries;
    West: RoundSeries;
    Finals: PlayoffBracketSeries | null; // Only one finals series
}
