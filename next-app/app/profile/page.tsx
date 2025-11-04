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
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const stats = await getStatsByUserId(user.record.id);
  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);

  const logoutButton = (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" className="gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </form>
  );

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <ProfileEditWrapper
        avatarUrl={avatarUrl}
        username={user.record.username}
        bio={user.record.bio}
      />

      <AllTimeStatsCard stats={stats} />

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
