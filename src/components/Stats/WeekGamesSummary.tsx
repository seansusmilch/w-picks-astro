import type { GameType } from '@/lib/definitions';
import { Matchup } from '@/components/GamesViewer/Matchup';

export function WeekGamesSummary({ games }: { games: GameType[] }) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 gap-1'>
      {games.map((game) => {
        const [pageParam, gameParam] = game.matchup.code.split('/');
        return (
          <a
            href={`/matchups?page=${pageParam}&game=${gameParam}`}
            key={game.matchup.id}
          >
            <Matchup
              matchup={game.matchup}
              scoreboard={game.scoreboard}
              picks={game.picks}
            />
          </a>
        );
      })}
    </div>
  );
}
