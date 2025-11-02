import { redirect, notFound } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getMatchupPageData, getGamesByCodePrefix } from '@/app/actions/matchups';
import { MatchupPageClient } from '@/components/matchup/matchup-page-client';

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

  // Fetch current matchup data and all games for the day in parallel
  const [matchupData, games] = await Promise.all([
    getMatchupPageData(matchupCode),
    getGamesByCodePrefix(dateCode),
  ]);

  if (!matchupData) {
    notFound();
  }

  const { matchup, scoreboard, picks } = matchupData;

  // Find the current user's pick
  const userPick = picks.find((pick) => pick.user === user.record.id);

  // Get scoreboard status (0 = pre-game, 1-2 = live, 3 = finished)
  const scoreboardStatus = scoreboard?.status || 0;

  return (
    <MatchupPageClient
      games={games}
      currentMatchup={matchup}
      currentScoreboard={scoreboard}
      currentPicks={picks}
      currentGameCode={gameCode}
      dateCode={dateCode}
      userPick={userPick}
      scoreboardStatus={scoreboardStatus}
    />
  );
}

