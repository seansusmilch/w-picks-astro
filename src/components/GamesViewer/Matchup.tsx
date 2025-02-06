import type { MatchupType, PickType, ScoreboardType } from '@/lib/definitions';
import clsx from 'clsx';
import { Logo } from '../NBA/Logo';
import { TimeTooltip } from '../ui/TimeTooltip';
import { TeamMap } from '../NBA/teamMap';
import { DateTime } from 'luxon';
import { Separator } from '@/components/ui/separator';
import { PicksSummary } from '../Picks/PicksSummary';

export function Matchup({
  matchup,
  scoreboard,
  picks,
}: {
  matchup: MatchupType;
  scoreboard?: ScoreboardType;
  picks?: PickType[];
}) {
  const gameStatus = scoreboard?.status || 0;
  return (
    <div className='p-0.5 sm:p-2 flex flex-col border rounded-xl shadow-md'>
      <div className={clsx('flex flex-row justify-between')}>
        {gameStatus === 0 && (
          <PreGame
            away_code={matchup.away_code}
            home_code={matchup.home_code}
            time_utc={matchup.time_utc}
          />
        )}
        {[1, 2].includes(gameStatus) && (
          <LiveScore
            away_code={matchup.away_code}
            away_score={scoreboard.away_score}
            home_code={matchup.home_code}
            home_score={scoreboard.home_score}
            status_text={scoreboard.status_text}
            status={gameStatus}
          />
        )}
        {gameStatus === 3 && (
          <PostGame
            away_code={matchup.away_code}
            away_score={scoreboard?.away_score}
            home_code={matchup.home_code}
            home_score={scoreboard?.home_score}
            status_text={scoreboard?.status_text}
          />
        )}
      </div>
      {picks?.length > 0 && (
        <>
          {/* <Separator className='w-full my-1' /> */}
          <div className='h-px bg-border self-stretch my-1' />

          <PicksSummary matchup={matchup} picks={picks} />
        </>
      )}
    </div>
  );
}

export function LiveScore({
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
  status,
}: {
  away_code: string;
  away_score: number;
  home_code: string;
  home_score: number;
  status_text: string;
  status: number;
}) {
  const awayTeamShort = TeamMap[away_code]?.name_short || away_code;
  const homeTeamShort = TeamMap[home_code]?.name_short || home_code;

  let statusText = status_text;
  if (status === 1) {
    const etTime = DateTime.fromFormat(statusText, "h:mm a 'ET'", {
      zone: 'America/New_York',
    });
    if (etTime.isValid) {
      const localTime = etTime.toLocal();
      statusText = localTime.toFormat('h:mma');
    }
  }
  return (
    <>
      <div className='basis-1/3 flex flex-col text-center'>
        <Logo tricode={away_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {awayTeamShort}
        </p>
      </div>
      <div className='basis-1/3 flex flex-col items-center justify-between text-center'>
        <div className='w-full flex-grow flex flex-row items-center justify-between'>
          <p className='text-xl sm:text-2xl md:text-3xl font-extrabold'>
            {away_score}
          </p>
          <p className='text-xl sm:text-2xl md:text-3xl font-extrabold'>
            {home_score}
          </p>
        </div>
        <span className='flex-grow-0 text-xs sm:text-sm text-white font-bold rounded-lg py-0.5 px-1 bg-gradient-to-r from-red-500 to-orange-500'>
          {statusText}
        </span>
      </div>

      <div className='basis-1/3 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {homeTeamShort}
        </p>
      </div>
    </>
  );
}

function PreGame({
  away_code,
  home_code,
  time_utc,
}: {
  away_code: string;
  home_code: string;
  time_utc: string;
}) {
  const gameTime = new Date(Date.parse(time_utc.replace(' ', 'T')));
  const homeTeamShort = TeamMap[home_code]?.name_short || home_code;
  const awayTeamShort = TeamMap[away_code]?.name_short || away_code;
  return (
    <>
      <div className='basis-5/12 flex flex-col text-center'>
        <Logo tricode={away_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {awayTeamShort}
        </p>
      </div>
      <div className='basis-2/12 flex flex-col items-center justify-center text-center'>
        <TimeTooltip time={gameTime} />
      </div>
      <div className='basis-5/12 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {homeTeamShort}
        </p>
      </div>
    </>
  );
}

function PostGame({
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
}: {
  away_code: string;
  away_score: number;
  home_code: string;
  home_score: number;
  status_text: string;
}) {
  const awayTeamShort = TeamMap[away_code]?.name_short || away_code;
  const homeTeamShort = TeamMap[home_code]?.name_short || home_code;
  return (
    <>
      <div className='basis-1/3 grow flex flex-col text-center'>
        <Logo tricode={away_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {awayTeamShort}
        </p>
      </div>
      <div className='basis-1/3 flex flex-col items-center justify-between text-center'>
        <div className='w-full flex-grow flex flex-row items-center justify-between'>
          <p
            className={clsx(
              'text-md sm:text-2xl md:text-3xl font-extrabold',
              away_score > home_score ? 'text-green-500' : 'text-destructive'
            )}
          >
            {away_score}
          </p>
          <p
            className={clsx(
              'text-md sm:text-2xl md:text-3xl font-extrabold',
              home_score > away_score ? 'text-green-500' : 'text-destructive'
            )}
          >
            {home_score}
          </p>
        </div>
        <span className='flex-grow-0 text-xs sm:text-sm text-white font-bold rounded-lg px-1 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500'>
          {status_text}
        </span>
      </div>

      <div className='basis-1/3 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-14 sm:h-16 md:h-20' />
        <p className='hidden sm:block text-sm sm:text-base md:text-lg font-bold'>
          {homeTeamShort}
        </p>
      </div>
    </>
  );
}
