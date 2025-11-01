'use client';

import { DateTime } from 'luxon';
import { Logo } from '@/components/nba/logo';
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
}

function PreGame({
  away_code,
  home_code,
  time_utc,
  away_meta,
  home_meta,
}: PreGameProps) {
  const gameTime = DateTime.fromSQL(time_utc).toJSDate();
  const gameDate = DateTime.fromSQL(time_utc);
  const formattedTime = DateTime.fromJSDate(gameTime).toLocaleString({
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).replace(' AM', 'a').replace(' PM', 'p');
  const formattedDate = gameDate.toFormat('ccc, MMM d');

  return (
    <div className="w-full flex items-center gap-2 sm:gap-4">
      {/* Away Team Logo */}
      <Logo tricode={away_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />

      {/* Game Info */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
          {formattedDate}
        </div>
        <div className="text-lg sm:text-xl font-bold">
          {formattedTime}
        </div>
      </div>

      {/* Home Team Logo */}
      <Logo tricode={home_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />
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
    <div className="w-full flex items-center gap-2 sm:gap-4">
      {/* Away Team Logo */}
      <Logo tricode={away_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />

      {/* Away Score */}
      <span className="text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0">
        {away_score}
      </span>

      {/* Game Info */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        {gameDate && (
          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-0.5">
            {gameDate}
          </div>
        )}
        <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
          {statusText}
        </div>
      </div>

      {/* Home Score */}
      <span className="text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0">
        {home_score}
      </span>

      {/* Home Team Logo */}
      <Logo tricode={home_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />
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
}

function PostGame({
  away_code,
  away_score,
  home_code,
  home_score,
  status_text,
  home_meta,
  away_meta,
}: PostGameProps) {
  return (
    <div className="w-full flex items-center gap-2 sm:gap-4">
      {/* Away Team Logo */}
      <Logo tricode={away_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />

      {/* Away Score */}
      <span className="text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0">
        {away_score}
      </span>

      {/* Game Info */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <div className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
          {status_text}
        </div>
      </div>

      {/* Home Score */}
      <span className="text-xl sm:text-2xl font-bold tabular-nums flex-shrink-0">
        {home_score}
      </span>

      {/* Home Team Logo */}
      <Logo tricode={home_code} className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0" />
    </div>
  );
}

interface MatchupDisplayProps {
  matchup: MatchupType;
  scoreboard?: ScoreboardType;
}

export function MatchupDisplay({ matchup, scoreboard }: MatchupDisplayProps) {
  const gameStatus = scoreboard?.status || 0;

  return (
    <div className="w-full">
      {gameStatus === 0 && (
        <PreGame
          away_code={matchup.away_code}
          home_code={matchup.home_code}
          time_utc={matchup.time_utc}
          away_meta={matchup.away_meta || undefined}
          home_meta={matchup.home_meta || undefined}
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
        />
      )}
    </div>
  );
}

