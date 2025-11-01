import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { BottomNav } from './bottom-nav';
import { TopNav } from './top-nav';

export async function Navigation() {
  const user = await getAuthenticatedUser();
  const isAuthenticated = !!user;

  return (
    <>
      <TopNav isAuthenticated={isAuthenticated} username={user?.record.username} />
      <BottomNav isAuthenticated={isAuthenticated} />
    </>
  );
}

