import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AvatarSection } from '@/components/Profile/Edit/AvatarSection';
import { getUserAvatarUrl } from '@/lib/data_common';
import { UsernameBioSection } from '@/components/Profile/Edit/UsernameBioSection';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Edit Profile',
};

export default async function EditProfilePage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  user.record.avatar_url = getUserAvatarUrl(user.record.id, user.record.avatar);

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Link href="/profile">
          <Button>
            <ArrowLeftIcon className="h-5 w-5" />
            Back to profile
          </Button>
        </Link>
        <div className="flex flex-col w-full max-w-md lg:max-w-xl border rounded-lg p-4 gap-4">
          <AvatarSection user={user} />
        </div>

        <div className="flex flex-col w-full max-w-md lg:max-w-xl border rounded-lg p-4 gap-4">
          <UsernameBioSection user={user} />
        </div>
      </div>
    </div>
  );
}
