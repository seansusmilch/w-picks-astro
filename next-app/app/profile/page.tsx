import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getStatsByUserId } from '@/lib/stats';
import { getUserAvatarUrl } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileEditWrapper } from '@/components/profile/profile-edit-wrapper';
import { AllTimeStatsCard } from '@/components/profile/all-time-stats-card';
import { UserPicksTable } from '@/components/profile/user-picks-table';
import { LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { getPicksByUser } from '@/app/actions/users';
import { ThemeSelector } from '@/components/theme-selector';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const stats = await getStatsByUserId(user.record.id);
  const picks = await getPicksByUser(user.record.id);
  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);

  const hasLive = picks.some((p) => p.status === 'live');
  const hasUpcoming = picks.some((p) => p.status === 'upcoming');
  const defaultTab = hasLive ? 'live' : hasUpcoming ? 'upcoming' : 'past';

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <ProfileEditWrapper
        avatarUrl={avatarUrl}
        username={user.record.username}
        bio={user.record.bio}
      />

      <AllTimeStatsCard stats={stats} />

      <UserPicksTable picks={picks} defaultTab={defaultTab} />

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm font-medium mb-1'>Email</p>
            <p className='text-sm text-muted-foreground'>{user.record.email}</p>
          </div>
          <div>
            <p className='text-sm font-medium mb-1'>Username</p>
            <p className='text-sm text-muted-foreground'>
              @{user.record.username}
            </p>
          </div>
          <div className='pt-4 border-t border-border'>
            <p className='text-sm font-medium mb-2'>Theme</p>
            <ThemeSelector />
          </div>
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm font-medium">Settings</p>
            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
          <div className='pt-4 border-t border-border'>
            <form action={logoutAction} className='sm:hidden'>
              <Button
                type='submit'
                variant='destructive'
                className='w-full gap-2'
              >
                <LogOut className='h-4 w-4' />
                Logout
              </Button>
            </form>
            <form action={logoutAction} className='hidden sm:block'>
              <Button type='submit' variant='destructive' className='gap-2'>
                <LogOut className='h-4 w-4' />
                Logout
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
