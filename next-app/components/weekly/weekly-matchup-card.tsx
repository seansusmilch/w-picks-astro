'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MatchupDisplay } from '@/components/matchup/matchup-display';
import { PicksSummary } from '@/components/matchup/picks-summary';
import type { GameType } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface WeeklyMatchupCardProps {
  game: GameType;
}

export function WeeklyMatchupCard({ game }: WeeklyMatchupCardProps) {
  const { matchup, scoreboard, picks } = game;
  const [dateCode, gameCode] = matchup.code.split('/');

  return (
    <Link href={`/matchup/${dateCode}/${gameCode}`} className="block">
      <Card
        className={cn(
          'transition-all hover:shadow-md hover:border-primary/50',
          'h-full'
        )}
      >
        <CardContent className="p-3 sm:p-4">
          {/* Matchup Display */}
          <MatchupDisplay matchup={matchup} scoreboard={scoreboard} showStatusBadge />

          {/* Picks Summary */}
          {picks.length > 0 && (
            <>
              <div className="h-px bg-border self-stretch my-3" />
              <PicksSummary picks={picks} matchup={matchup} />
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

