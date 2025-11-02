'use client';

import { DateTime } from 'luxon';
import { Logo } from '@/components/nba/logo';
import { Badge } from '@/components/ui/badge';
import type { MatchupType, ScoreboardType } from '@/lib/definitions';

interface TeamMeta {
  wins?: number;
  losses?: number;
}

interface PreGameProps {
  away_code: string;
  home_code: string;
  time_utc: string;
  away_meta?: TeamMeta;
  home_meta?: TeamMeta;
  showStatusBadge?: boolean;
}

function PreGame({
  away_code,
  home_code,
  time_utc,
  away_meta,
  home_meta,
  showStatusBadge = false,
}: PreGameProps) {
  const gameTime = DateTime.fromSQL(time_utc).toJSDate();
  const gameDate = DateTime.fromSQL(time_utc);
  const formattedTime = DateTime.fromJSDate(gameTime)
    .toLocaleString({
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    .replace(' AM', 'a')
    .replace(' PM', 'p');
  const formattedDate = gameDate.toFormat('ccc, MMM d');

  return (
    <div className='w-full flex items-center gap-2 sm:gap-4'>
      {/* Away Team Logo */}
      <Logo
        tricode={away_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />

      {/* Game Info */}
      <div className='flex-1 flex flex-col items-center justify-center min-w-0 gap-1'>
        {showStatusBadge && (
          <Badge variant='outline' className='text-xs'>
            Upcoming
          </Badge>
        )}
        <div className='text-xs sm:text-sm font-semibold text-muted-foreground'>
          {formattedDate}
        </div>
        <div className='text-lg sm:text-xl font-bold'>{formattedTime}</div>
      </div>

      {/* Home Team Logo */}
      <Logo
        tricode={home_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />
    </div>
  );
}

interface LiveScoreProps {
  away_code: string;
  away_score: number;
  home_code: string;
  home_score: number;
  status_text: string;
  status: number;
  time_utc?: string;
  home_meta?: TeamMeta;
  away_meta?: TeamMeta;
  showStatusBadge?: boolean;
}

function LiveScore({
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
  status,
  time_utc,
  home_meta,
  away_meta,
  showStatusBadge = false,
}: LiveScoreProps) {
  let statusText = status_text;
  let gameDate: string | null = null;

  if (status === 1 && time_utc) {
    const etTime = DateTime.fromFormat(statusText, "h:mm a 'ET'", {
      zone: 'America/New_York',
    });
    if (etTime.isValid) {
      const localTime = etTime.toLocal();
      statusText = localTime.toFormat('h:mma');
    }
    const date = DateTime.fromSQL(time_utc);
    gameDate = date.toFormat('ccc, MMM d');
  }

  return (
    <div className='w-full relative flex items-center gap-2 sm:gap-4'>
      {/* Away Team Logo */}
      <Logo
        tricode={away_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />

      {/* Away Score */}
      <span className='text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0'>
        {away_score}
      </span>

      {/* Spacer to push scores apart */}
      <div className='flex-1' />

      {/* Game Info - Absolutely positioned in center */}
      <div className='absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center gap-1'>
        {showStatusBadge && (
          <Badge className='bg-destructive text-destructive-foreground text-xs'>
            Live
          </Badge>
        )}
        {gameDate && (
          <div className='text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap'>
            {gameDate}
          </div>
        )}
        <div className='text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap'>
          {statusText}
        </div>
      </div>

      {/* Home Score */}
      <span className='text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0'>
        {home_score}
      </span>

      {/* Home Team Logo */}
      <Logo
        tricode={home_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />
    </div>
  );
}

interface PostGameProps {
  away_code: string;
  away_score: number;
  home_code: string;
  home_score: number;
  status_text: string;
  home_meta?: TeamMeta;
  away_meta?: TeamMeta;
  showStatusBadge?: boolean;
}

function PostGame({
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
  home_meta,
  away_meta,
  showStatusBadge = false,
}: PostGameProps) {
  return (
    <div className='w-full relative flex items-center gap-2 sm:gap-4'>
      {/* Away Team Logo */}
      <Logo
        tricode={away_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />

      {/* Away Score */}
      <span className='text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0'>
        {away_score}
      </span>

      {/* Spacer to push scores apart */}
      <div className='flex-1' />

      {/* Game Status - Absolutely positioned in center */}
      <div className='absolute left-1/2 -translate-x-1/2 pointer-events-none'>
        <div className='text-xs sm:text-sm font-semibold uppercase text-muted-foreground whitespace-nowrap'>
          {status_text}
        </div>
      </div>

      {/* Home Score */}
      <span className='text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0'>
        {home_score}
      </span>

      {/* Home Team Logo */}
      <Logo
        tricode={home_code}
        className='h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0'
      />
    </div>
  );
}

interface MatchupDisplayProps {
  matchup: MatchupType;
  scoreboard?: ScoreboardType;
  showStatusBadge?: boolean;
}

export function MatchupDisplay({
  matchup,
  scoreboard,
  showStatusBadge = false,
}: MatchupDisplayProps) {
  const gameStatus = scoreboard?.status || 0;

  return (
    <div className='w-full'>
      {gameStatus === 0 && (
        <PreGame
          away_code={matchup.away_code}
          home_code={matchup.home_code}
          time_utc={matchup.time_utc}
          away_meta={matchup.away_meta || undefined}
          home_meta={matchup.home_meta || undefined}
          showStatusBadge={showStatusBadge}
        />
      )}
      {[1, 2].includes(gameStatus) && scoreboard && (
        <LiveScore
          away_code={matchup.away_code}
          away_score={scoreboard.away_score}
          home_code={matchup.home_code}
          home_score={scoreboard.home_score}
          status_text={scoreboard.status_text}
          status={gameStatus}
          time_utc={matchup.time_utc}
          home_meta={matchup.home_meta || undefined}
          away_meta={matchup.away_meta || undefined}
          showStatusBadge={showStatusBadge}
        />
      )}
      {gameStatus === 3 && scoreboard && (
        <PostGame
          away_code={matchup.away_code}
          away_score={scoreboard.away_score}
          home_code={matchup.home_code}
          home_score={scoreboard.home_score}
          status_text={scoreboard.status_text}
          home_meta={matchup.home_meta || undefined}
          away_meta={matchup.away_meta || undefined}
          showStatusBadge={showStatusBadge}
        />
      )}
    </div>
  );
}
