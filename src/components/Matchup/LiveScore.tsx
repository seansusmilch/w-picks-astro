import clsx from 'clsx';
import { TeamMap } from '@/components/NBA/teamMap';
import { Logo } from '@/components/NBA/Logo';
import { useEffect, useState } from 'react';
import { getPB } from '@/lib/data_client';
import { ScoreboardZ } from '@/lib/definitions';

export function LiveScore({
  id,
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
  status,
}: {
  id: string;
  away_code: string;
  away_score: number;
  home_code: string;
  home_score: number;
  status_text: string;
  status: number;
}) {
  const [liveScore, setLiveScore] = useState({
    away_score: away_score,
    home_score: home_score,
    status_text: status_text,
    status: status,
  });

  const awayTeamShort = TeamMap[away_code].name_short;
  const homeTeamShort = TeamMap[home_code].name_short;

  useEffect(() => {
    const pb = getPB();
    pb.collection('scoreboards')
      .subscribe(id, (data) => {
        const scoreboardResult = ScoreboardZ.safeParse(data.record);
        if (!scoreboardResult.success) {
          console.error('Failed to parse scoreboard', scoreboardResult.error);
          return;
        }
        const board = scoreboardResult.data;
        setLiveScore({
          away_score: board.away_score,
          home_score: board.home_score,
          status_text: board.status_text,
          status: board.status,
        });
      })
      .catch((err) => console.log('Error subscribing to scoreboard', err));

    return () => {
      pb.collection('scoreboards').unsubscribe(id);
    };
  });

  return (
    <>
      <div className='basis-1/3 flex flex-col text-center'>
        <Logo tricode={away_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{awayTeamShort}</p>
      </div>
      <div className='basis-1/3 flex flex-col items-center justify-between text-center'>
        <div className='w-full flex-grow flex flex-row items-center justify-between'>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {liveScore.away_score}
          </p>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {liveScore.home_score}
          </p>
        </div>
        <p className='flex-grow-0 text-sm sm:text-md text-white font-bold rounded-xl px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500'>
          {liveScore.status_text}
        </p>
      </div>
      <div className='basis-1/3 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{homeTeamShort}</p>
      </div>
    </>
  );
}
