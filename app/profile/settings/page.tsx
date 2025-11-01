import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserSettingsZ } from '@/lib/definitions';
import { SettingsView } from '@/components/Settings/SettingsView';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  const settings = UserSettingsZ.parse(user.record.settings || {});

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/profile">
          <Button>
            <ArrowLeftIcon className="h-5 w-5" />
            Back to profile
          </Button>
        </Link>
        <SettingsView settings={settings} />
      </div>
    </div>
  );
}
