import { UserAvatar } from '@/components/Profile/UserAvatar';
import { UserPicksTable } from '@/components/Profile/UserPicksTable';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { PickType, UserType, StatType } from '@/lib/definitions';
import { SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

interface ProfileViewProps {
  user: UserType;
  picks: PickType[];
  stats?: StatType;
}

export default async function ProfileView({
  user,
  picks,
  stats,
}: ProfileViewProps) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  const currentUser = pbAuth ? await getUser(pbAuth.value) : null;
  const isOwnProfile = currentUser?.record.id === user.id;

  const winPicks = stats?.win_picks || 0;
  const progressValue = stats?.total_picks
    ? (winPicks / stats.total_picks) * 100
    : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col w-full max-w-md lg:max-w-xl border rounded-lg p-4 gap-4">
        <div className="flex flex-row gap-6">
          <UserAvatar
            className="h-20 w-20 lg:h-36 lg:w-36"
            avatar_url={user.avatar_url || ''}
          />
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex flex-row justify-between w-full">
              <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-500 to-purple-500 inline-block text-transparent bg-clip-text">
                @{user.username}
              </h1>
              {isOwnProfile && (
                <Link className="hidden lg:block" href="/profile/edit">
                  <Button>Edit Profile</Button>
                </Link>
              )}
            </div>
            <pre className="text-xs lg:text-md text-foreground/80 break-words max-w-60 lg:max-w-96 overflow-clip">
              {user.bio}
            </pre>
          </div>
        </div>
        {isOwnProfile && (
          <div className="flex flex-row gap-2">
            <Link className="w-full lg:hidden" href="/logout">
              <Button className="w-full border-red-500" variant="outline">
                Logout
              </Button>
            </Link>
            <Link className="w-full lg:hidden" href="/profile/edit">
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </Link>
            <Link className="lg:hidden" href="/profile/settings">
              <Button className="w-full" variant="outline">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full max-w-md lg:max-w-xl border rounded-lg p-4 gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">User Stats (All Time)</h2>
        </div>

        <div className="flex flex-row justify-around">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{stats?.win_picks || 0}</span>
            <span className="text-sm">W Picks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{stats?.lose_picks || 0}</span>
            <span className="text-sm">L Picks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">
              {stats?.win_loss_ratio || 0}
            </span>
            <span className="text-sm">W/L Ratio</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{stats?.win_pick_rate || 0}%</span>
            <span className="text-sm">W %</span>
          </div>
        </div>
        <div>
          <Progress value={progressValue} />
        </div>
      </div>

      <div className="flex flex-col w-full max-w-md lg:max-w-xl border rounded-lg p-4 gap-4">
        <h2 className="text-xl font-bold">Pick History</h2>
        <UserPicksTable picks={picks} defaultTab="live" />
      </div>
    </div>
  );
}
