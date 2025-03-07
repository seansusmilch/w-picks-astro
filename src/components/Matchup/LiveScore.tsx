import clsx from 'clsx';
import { TeamMap } from '@/components/NBA/teamMap';
import { Logo } from '@/components/NBA/Logo';
import { getPB } from '@/lib/data_client';
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { DateTime } from 'luxon';

const queryClient = new QueryClient();

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
  const initialScore = {
    away_score,
    home_score,
    status_text,
    status,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Scoreboard
        id={id}
        away_code={away_code}
        home_code={home_code}
        initialScore={initialScore}
      />
    </QueryClientProvider>
  );
}

function Scoreboard({
  id,
  away_code,
  home_code,
  initialScore,
}: {
  id: string;
  away_code: string;
  home_code: string;
  initialScore: {
    away_score: number;
    home_score: number;
    status_text: string;
    status: number;
  };
}) {
  const awayTeamShort = TeamMap[away_code]?.name_short || away_code;
  const homeTeamShort = TeamMap[home_code]?.name_short || home_code;

  const { data } = useQuery({
    queryKey: ['scoreboard', id],
    queryFn: async () => {
      const pb = getPB();
      const scoreboard = await pb.collection('scoreboards').getOne(id);
      return scoreboard;
    },
    initialData: initialScore as any,
    refetchInterval: 5000,
    staleTime: 5000,
  });

  let statusText = data.status_text;
  if (data.status === 1) {
    const etTime = DateTime.fromFormat(statusText, "h:mm a 'ET'", {
      zone: 'America/New_York',
    });
    if (etTime.isValid) {
      const localTime = etTime.toLocal();
      statusText = localTime.toFormat('h:mm a');
    }
  }

  return (
    <>
      <div className='basis-1/3 flex flex-col text-center'>
        <Logo tricode={away_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{awayTeamShort}</p>
      </div>
      <div className='basis-1/3 flex flex-col items-center justify-between text-center'>
        <div className='w-full grow flex flex-row items-center justify-between'>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {data.away_score}
          </p>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {data.home_score}
          </p>
        </div>
        <p className='grow-0 text-sm sm:text-md text-white font-bold rounded-xl px-2 py-1 bg-linear-to-r from-red-500 to-orange-500'>
          {statusText}
        </p>
      </div>
      <div className='basis-1/3 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{homeTeamShort}</p>
      </div>
    </>
  );
}
