import type { GameType } from '@/lib/definitions';
import { Matchup } from '@/components/GamesViewer/Matchup';

function groupGamesByDay(games: GameType[]) {
  const grouped = games.reduce((acc, game) => {
    const date = new Date(game.matchup.time_utc);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(game);
    return acc;
  }, {} as Record<string, GameType[]>);
  return grouped;
}

export function WeekGamesSummary({ games }: { games: GameType[] }) {
  const gamesByDay = groupGamesByDay(games);
  const daysOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  console.log('gamesByDay', gamesByDay);
  return daysOrder.map((day) => {
    return (
      <div key={day}>
        <h2 className='font-bold text-lg'>{day}</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
          {gamesByDay[day]?.map((game) => {
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
      </div>
    );
  });
}
