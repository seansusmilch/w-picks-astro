import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getGamesByCodePrefix, getMatchupPageData } from '@/app/actions/matchups';
import { getTodayCodePrefix } from '@/lib/date-utils';
import type { MatchupType } from '@/lib/definitions';
import { MatchupPageClient } from '@/components/matchup/matchup-page-client';

interface MatchupIndexPageProps {
  searchParams: Promise<{ date?: string; game?: string }>
}

export default async function MatchupIndexPage({ searchParams }: MatchupIndexPageProps) {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const { date, game } = await searchParams;
  const dateCode = date || getTodayCodePrefix();

  const games = await getGamesByCodePrefix(dateCode);
  const firstGameCode = games[0]?.matchup.code.split('/')[1] || '';
  const gameCode = game || firstGameCode;

  if (!gameCode) {
    // No games today; render minimal shell
    return (
      <MatchupPageClient
        initialGames={games}
        initialData={{ matchup: {} as MatchupType, scoreboard: null, picks: [] }}
        initialDateCode={dateCode}
        initialGameCode={''}
        userId={user.record.id}
      />
    );
  }

  const code = `${dateCode}/${gameCode}`;
  const initialData = (await getMatchupPageData(code))!;

  return (
    <MatchupPageClient
      initialGames={games}
      initialData={initialData}
      initialDateCode={dateCode}
      initialGameCode={gameCode}
      userPick={initialData.picks.find((p) => p.user === user.record.id)}
      scoreboardStatus={initialData.scoreboard?.status || 0}
      userId={user.record.id}
    />
  );
}
