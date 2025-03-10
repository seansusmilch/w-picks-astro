import type { MatchupType, PickType, ScoreboardType } from '@/lib/definitions';
import clsx from 'clsx';
import { Logo } from '@/components/NBA/Logo';
import { TimeTooltip } from '@/components/ui/TimeTooltip';
import { TeamMap } from '@/components/NBA/teamMap';
import { DateTime } from 'luxon';
import { PicksSummary } from '@/components/Picks/PicksSummary';

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
      {picks !== undefined && (
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
    <div className='w-full flex items-center justify-between px-2 py-3'>
      {/* Away Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={away_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{awayTeamShort}</p>
        </div>
      </div>

      {/* Score and Status */}
      <div className='grow flex items-center justify-center'>
        {status > 1 && (
          <span className='text-2xl font-bold w-12 text-right tabular-nums'>
            {away_score}
          </span>
        )}
        <div className='flex flex-col items-center mx-1 sm:mx-2'>
          <span
            className={clsx(
              'text-white font-bold rounded-lg py-0.5 px-1 bg-linear-to-r from-red-500 to-orange-500',
              status === 1 && 'text-xl',
              status === 2 && 'text-xs sm:text-sm'
            )}
          >
            {statusText}
          </span>
        </div>
        {status > 1 && (
          <span className='text-2xl font-bold w-12 text-left tabular-nums'>
            {home_score}
          </span>
        )}
      </div>

      {/* Home Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={home_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{homeTeamShort}</p>
        </div>
      </div>
    </div>
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
    <div className='w-full flex items-center justify-between px-2 py-3'>
      {/* Away Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={away_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{awayTeamShort}</p>
        </div>
      </div>

      {/* Game Time */}
      <div className='flex flex-col items-center justify-center flex-1 mx-4'>
        <TimeTooltip time={gameTime} />
      </div>

      {/* Home Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={home_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{homeTeamShort}</p>
        </div>
      </div>
    </div>
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
    <div className='w-full flex items-center justify-between px-2 py-3'>
      {/* Away Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={away_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{awayTeamShort}</p>
        </div>
      </div>

      {/* Score */}
      <div className='flex flex-col items-center'>
        <div className='flex items-center justify-center'>
          <span className='text-2xl font-bold w-12 text-right tabular-nums'>
            {away_score}
          </span>
          <div className='flex flex-col items-center w-14 sm:w-16 mx-1 sm:mx-2'>
            <span className='text-xs font-semibold uppercase'>
              {status_text}
            </span>
          </div>
          <span className='text-2xl font-bold w-12 text-left tabular-nums'>
            {home_score}
          </span>
        </div>
      </div>

      {/* Home Team */}
      <div className='flex flex-col items-center'>
        <Logo tricode={home_code} className='h-10 w-10' />
        <div className='mt-1 text-center w-24 sm:w-20'>
          <p className='font-bold text-sm truncate'>{homeTeamShort}</p>
        </div>
      </div>
    </div>
  );
}
