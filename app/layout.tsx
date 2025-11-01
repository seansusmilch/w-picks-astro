import type { Metadata } from 'next';
import '@fontsource/inter';
import '@/globals.css';
import { APP_NAME } from '@/lib/constants';
import { Header } from '@/components/Header/Header';
import { SettingsProvider } from '@/components/Settings/SettingsProvider';
import { PosthogScript } from '@/components/PosthogScript';
import { ThemeScript } from '@/components/ThemeScript';
import { cookies } from 'next/headers';
import { getRequestUser } from '@/lib/data';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Your ultimate companion for NBA predictions and pick \'ems',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/assets/icons/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const posthogCookie = cookieStore.get(`ph_${process.env.POSTHOG_API_TOKEN}_posthog`);
  
  let user = null;
  let distinctId = null;
  let settings = null;

  // Get authenticated user from request cookies
  // This will automatically load and refresh the auth token
  try {
    const userData = await getRequestUser();
    if (userData) {
      user = userData;
      settings = userData.record.settings;
    }
  } catch (error) {
    // User not authenticated
  }

  if (posthogCookie) {
    try {
      const cookieData = JSON.parse(posthogCookie.value);
      distinctId = cookieData.distinct_id;
    } catch (error) {
      // Could not parse cookie
    }
  }

  if (!distinctId) {
    distinctId = crypto.randomUUID();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <SettingsProvider settings={settings} />
        <div className="flex flex-col min-h-[100dvh]">
          <Header />
          <div className="flex grow">
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
        <PosthogScript 
          apiHost={process.env.POSTHOG_API_HOST || ''}
          apiToken={process.env.POSTHOG_API_TOKEN || ''}
          distinctId={distinctId}
        />
      </body>
    </html>
  );
}
