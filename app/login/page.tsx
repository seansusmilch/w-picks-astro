import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginSignupForm } from '@/components/LoginSignupForm';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (pbAuth) {
    const user = await getUser(pbAuth.value);
    if (user) {
      redirect('/');
    }
  }

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="flex justify-center w-full">
        <LoginSignupForm />
      </div>
    </div>
  );
}