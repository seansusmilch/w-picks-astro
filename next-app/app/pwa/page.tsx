import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';

export default async function PWAPage() {
  const user = await getAuthenticatedUser();
  const isAuthenticated = !!user;

  // Redirect to home if authenticated, otherwise to login
  if (isAuthenticated) {
    redirect('/home');
  } else {
    redirect('/');
  }
}

