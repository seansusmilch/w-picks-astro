'use client';

import { MatchupRibbon } from './matchup-ribbon';
import { MatchupDisplay } from './matchup-display';
import { PicksSummary } from './picks-summary';
import { PickForm } from './pick-form';
import { PicksView } from './picks-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameType, MatchupType, ScoreboardType, PickType } from '@/lib/definitions';

interface MatchupPageClientProps {
  games: GameType[];
  currentMatchup: MatchupType;
  currentScoreboard: ScoreboardType | null;
  currentPicks: PickType[];
  currentGameCode: string;
  dateCode: string;
  userPick: PickType | undefined;
  scoreboardStatus: number;
}

export function MatchupPageClient({
  games,
  currentMatchup,
  currentScoreboard,
  currentPicks,
  currentGameCode,
  dateCode,
  userPick,
  scoreboardStatus,
}: MatchupPageClientProps) {
  return (
    <>
      {/* Matchup Ribbon */}
      <MatchupRibbon
        games={games}
        currentGameCode={currentGameCode}
        dateCode={dateCode}
      />

      <div className="container mx-auto p-4 py-6 sm:py-8 max-w-2xl">
        {/* Matchup Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <MatchupDisplay
              matchup={currentMatchup}
              scoreboard={currentScoreboard || undefined}
            />
            {/* Picks Summary */}
            {currentPicks.length > 0 && (
              <>
                <div className="h-px bg-border self-stretch my-3 sm:my-4" />
                <PicksSummary picks={currentPicks} matchup={currentMatchup} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Pick Form */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <PickForm
              matchup={currentMatchup}
              pick={userPick}
              scoreboardStatus={scoreboardStatus}
            />
          </CardContent>
        </Card>

        {/* Picks View (Stack/Table) */}
        {currentPicks.length > 0 && (
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">All Picks</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PicksView picks={currentPicks} />
            </CardContent>
          </Card>
        )}

        {/* Empty State for Picks */}
        {currentPicks.length === 0 && (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                No picks yet for this matchup
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

