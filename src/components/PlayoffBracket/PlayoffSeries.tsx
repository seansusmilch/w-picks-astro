import type { PlayoffBracketSeries } from '@/lib/types/playoff-bracket';
import { Logo } from '@/components/NBA/Logo';

interface PlayoffSeriesProps {
    series: PlayoffBracketSeries;
}

export function PlayoffSeries({ series }: PlayoffSeriesProps) {
    const highSeedTeam = {
        name: series.highSeedName || 'TBD',
        wins: series.highSeedSeriesWins,
        seed: series.highSeedRank,
        tricode: series.highSeedTricode,
    };

    const lowSeedTeam = {
        name: series.lowSeedName || 'TBD',
        wins: series.lowSeedSeriesWins,
        seed: series.lowSeedRank,
        tricode: series.lowSeedTricode,
    };

    return (
        <div className="border rounded-lg p-3 bg-background shadow-sm min-w-56 w-full">
            <div className="text-xs text-muted-foreground mb-2 text-center">
                {series.poRoundDesc}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-muted-foreground w-4 text-center tabular-nums">
                            {highSeedTeam.seed || '-'}
                        </span>
                        {highSeedTeam.tricode ? (
                            <Logo
                                tricode={highSeedTeam.tricode}
                                className="w-8 h-8 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-7 h-7 bg-muted rounded-full flex-shrink-0"></div>
                        )}
                        <span
                            className="font-medium text-sm truncate"
                            title={
                                series.highSeedCity
                                    ? `${series.highSeedCity} ${series.highSeedName}`
                                    : 'TBD'
                            }
                        >
                            {highSeedTeam.name}
                        </span>
                    </div>
                    <span className="text-base font-bold tabular-nums">{highSeedTeam.wins}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-muted-foreground w-4 text-center tabular-nums">
                            {lowSeedTeam.seed || '-'}
                        </span>
                        {lowSeedTeam.tricode ? (
                            <Logo tricode={lowSeedTeam.tricode} className="w-8 h-8 flex-shrink-0" />
                        ) : (
                            <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
                        )}
                        <span
                            className="font-medium text-sm truncate"
                            title={
                                series.lowSeedCity
                                    ? `${series.lowSeedCity} ${series.lowSeedName}`
                                    : 'TBD'
                            }
                        >
                            {lowSeedTeam.name}
                        </span>
                    </div>
                    <span className="text-base font-bold tabular-nums">{lowSeedTeam.wins}</span>
                </div>
            </div>

            {series.seriesText && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                    {series.seriesText}
                </div>
            )}
        </div>
    );
}
