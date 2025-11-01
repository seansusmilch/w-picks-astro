import { redirect } from 'next/navigation';
import { logout } from '@/actions/users';
import { cookies } from 'next/headers';

export default async function LogoutPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (pbAuth) {
    await logout();
  }
  
  redirect('/');
}