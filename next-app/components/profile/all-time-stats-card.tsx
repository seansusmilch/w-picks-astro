import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, BarChart3 } from 'lucide-react';
import type { StatType } from '@/lib/definitions';

interface AllTimeStatsCardProps {
  stats: StatType | null;
  description?: string;
}

export function AllTimeStatsCard({
  stats,
  description = 'Your complete pick performance history',
}: AllTimeStatsCardProps) {
  const winPicks = stats?.win_picks || 0;
  const totalPicks = stats?.total_picks || 0;
  const progressValue = totalPicks > 0 ? (winPicks / totalPicks) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">All-Time Stats</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold">
                {stats?.win_picks || 0}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Wins
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold">
                {stats?.lose_picks || 0}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Losses
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold">
                {stats?.win_loss_ratio?.toFixed(2) || '0.00'}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              W/L Ratio
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold">
                {stats?.win_pick_rate?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Win Rate
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {totalPicks > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Win Rate Progress</span>
              <span className="font-medium">{progressValue.toFixed(1)}%</span>
            </div>
            <Progress value={progressValue} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{winPicks} wins</span>
              <span>{totalPicks} total picks</span>
            </div>
          </div>
        )}

        {totalPicks === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No picks yet. Start making picks to see your stats!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

