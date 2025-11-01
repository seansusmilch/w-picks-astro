import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getCurrentWeekMatchups } from '@/app/actions/matchups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const matchups = await getCurrentWeekMatchups();

  return (
    <div className='container mx-auto p-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <p className='text-muted-foreground'>Welcome back, {user.record.username}!</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div>
              <p className='text-sm font-medium'>Email</p>
              <p className='text-sm text-muted-foreground'>{user.record.email}</p>
            </div>
            <div>
              <p className='text-sm font-medium'>Username</p>
              <p className='text-sm text-muted-foreground'>{user.record.username}</p>
            </div>
            {user.record.bio && (
              <div>
                <p className='text-sm font-medium'>Bio</p>
                <p className='text-sm text-muted-foreground'>{user.record.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='mt-8'>
        <h2 className='text-2xl font-bold mb-4'>This Week's Matchups</h2>
        <ul>
          {matchups.map((matchup) => {
            const [dateCode, gameCode] = matchup.code.split('/');
            return (
              <li key={matchup.id}>
                <Link href={`/matchup/${dateCode}/${gameCode}`}>
                  {matchup.code}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

