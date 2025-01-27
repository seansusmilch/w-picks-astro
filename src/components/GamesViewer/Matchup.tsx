import type { MatchupType, ScoreboardType } from '@/lib/definitions';
import clsx from 'clsx';
import { Logo } from '../NBA/Logo';
import { TimeTooltip } from '../ui/TimeTooltip';
import { TeamMap } from '../NBA/teamMap';
import { DateTime } from 'luxon';

export function Matchup({
  matchup,
  scoreboard,
}: {
  matchup: MatchupType;
  scoreboard?: ScoreboardType;
}) {
  const gameStatus = scoreboard?.status || 0;
  return (
    <div
      className={clsx(
        'p-3 flex flex-row justify-between max-w-md h-36',
        'border rounded-xl shadow-md'
      )}
    >
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
        <div className='w-full flex-grow flex flex-row items-center justify-between'>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {away_score}
          </p>
          <p className={clsx('text-2xl sm:text-4xl font-extrabold')}>
            {home_score}
          </p>
        </div>
        <p className='flex-grow-0 text-sm sm:text-md text-white font-bold rounded-xl px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500'>
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
        <Logo tricode={away_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{awayTeamShort}</p>
      </div>
      <div className='basis-2/12 flex flex-col items-center justify-center text-center'>
        <TimeTooltip time={gameTime} />
      </div>
      <div className='basis-5/12 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{homeTeamShort}</p>
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
        <Logo tricode={away_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{awayTeamShort}</p>
      </div>
      <div className='basis-1/3 flex flex-col items-center justify-between text-center'>
        <div className='w-full flex-grow flex flex-row items-center justify-between'>
          <p
            className={clsx(
              'text-2xl sm:text-4xl font-extrabold',
              away_score > home_score ? 'text-green-500' : 'text-destructive'
            )}
          >
            {away_score}
          </p>
          <p
            className={clsx(
              'text-2xl sm:text-4xl font-extrabold',
              home_score > away_score ? 'text-green-500' : 'text-destructive'
            )}
          >
            {home_score}
          </p>
        </div>
        <p className='flex-grow-0 text-sm sm:text-md text-white font-bold rounded-xl px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-500'>
          {status_text}
        </p>
      </div>
      <div className='basis-1/3 flex flex-col items-center text-center'>
        <Logo tricode={home_code} className='h-20 sm:h-24' />
        <p className='sm:text-xl font-bold'>{homeTeamShort}</p>
      </div>
    </>
  );
}
