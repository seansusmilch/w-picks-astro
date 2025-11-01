import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getStatsByUserId, getUserAvatarUrl } from '@/lib/stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Trophy, TrendingUp, Target, BarChart3, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const stats = await getStatsByUserId(user.record.id);
  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);

  const winPicks = stats?.win_picks || 0;
  const totalPicks = stats?.total_picks || 0;
  const progressValue = totalPicks > 0 ? (winPicks / totalPicks) * 100 : 0;

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      {/* Profile Header Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <UserAvatar
              avatarUrl={avatarUrl}
              username={user.record.username}
              className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    @{user.record.username}
                  </h1>
                  {user.record.bio && (
                    <p className="text-sm sm:text-base text-muted-foreground break-words">
                      {user.record.bio}
                    </p>
                  )}
                </div>
                <form action={logoutAction} className="hidden sm:block">
                  <Button type="submit" variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">All-Time Stats</CardTitle>
          </div>
          <CardDescription>Your complete pick performance history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <span className="text-2xl sm:text-3xl font-bold">{stats?.win_picks || 0}</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Wins</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-red-500" />
                <span className="text-2xl sm:text-3xl font-bold">{stats?.lose_picks || 0}</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Losses</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-2xl sm:text-3xl font-bold">
                  {stats?.win_loss_ratio?.toFixed(2) || '0.00'}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">W/L Ratio</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="text-2xl sm:text-3xl font-bold">
                  {stats?.win_pick_rate?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Win Rate</span>
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
              <p className="text-sm">No picks yet. Start making picks to see your stats!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Email</p>
            <p className="text-sm text-muted-foreground">{user.record.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Username</p>
            <p className="text-sm text-muted-foreground">@{user.record.username}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <form action={logoutAction} className="sm:hidden">
              <Button type="submit" variant="destructive" className="w-full gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
            <form action={logoutAction} className="hidden sm:block">
              <Button type="submit" variant="destructive" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

