import { redirect, notFound } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getMatchupPageData } from '@/app/actions/matchups';
import { MatchupDisplay } from '@/components/matchup/matchup-display';
import { PicksSummary } from '@/components/matchup/picks-summary';
import { PicksView } from '@/components/matchup/picks-view';
import { PickForm } from '@/components/matchup/pick-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatchupPageProps {
  params: Promise<{
    dateCode: string;
    gameCode: string;
  }>;
}

export default async function MatchupPage({ params }: MatchupPageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const { dateCode, gameCode } = await params;
  const matchupCode = `${dateCode}/${gameCode}`;

  const matchupData = await getMatchupPageData(matchupCode);

  if (!matchupData) {
    notFound();
  }

  const { matchup, scoreboard, picks } = matchupData;

  // Find the current user's pick
  const userPick = picks.find((pick) => pick.user === user.record.id);

  // Get scoreboard status (0 = pre-game, 1-2 = live, 3 = finished)
  const scoreboardStatus = scoreboard?.status || 0;

  return (
    <div className="container mx-auto p-4 py-6 sm:py-8 max-w-2xl">
      {/* Matchup Card */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <MatchupDisplay matchup={matchup} scoreboard={scoreboard || undefined} />
          {/* Picks Summary */}
          {picks.length > 0 && (
            <>
              <div className="h-px bg-border self-stretch my-3 sm:my-4" />
              <PicksSummary picks={picks} matchup={matchup} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Pick Form */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <PickForm
            matchup={matchup}
            pick={userPick}
            scoreboardStatus={scoreboardStatus}
          />
        </CardContent>
      </Card>

      {/* Picks View (Stack/Table) */}
      {picks.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">All Picks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <PicksView picks={picks} />
          </CardContent>
        </Card>
      )}

      {/* Empty State for Picks */}
      {picks.length === 0 && (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              No picks yet for this matchup
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

