import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const user = await getAuthenticatedUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between gap-8 py-16 px-4 sm:px-16">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight sm:text-4xl">
            Welcome to Baller Picks
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Your ultimate companion for NBA predictions and pick 'ems.
            {user ? (
              <>
                {' '}You are logged in as <strong>{user.record.email}</strong>.
              </>
            ) : (
              <> Please log in to access protected pages.</>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
