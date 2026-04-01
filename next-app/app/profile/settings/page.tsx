import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { UserSettingsZ } from '@/lib/definitions';
import { SettingsView } from '@/components/profile/settings-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ThemeSelector } from '@/components/theme-selector';
import { logoutAction } from '@/app/actions/auth';

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const settings = UserSettingsZ.parse(user.record.settings || {});

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Email</p>
            <p className="text-sm text-muted-foreground">{user.record.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Username</p>
            <p className="text-sm text-muted-foreground">
              @{user.record.username}
            </p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">Theme</p>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsView settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form action={logoutAction}>
            <Button type="submit" variant="destructive" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
