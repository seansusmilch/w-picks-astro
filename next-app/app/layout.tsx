import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Navigation } from '@/components/navigation/navigation';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Baller Picks',
  description: 'NBA picks and predictions app',
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Baller Picks',
  },
  icons: {
    icon: [
      { url: '/assets/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#d8d8d8' },
    { media: '(prefers-color-scheme: dark)', color: '#383838' },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#d8d8d8' },
    { media: '(prefers-color-scheme: dark)', color: '#383838' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src='https://rybbit.umuumi.ipv64.de/api/script.js'
          data-site-id='b8121a37e67d'
          strategy='afterInteractive'
        />
        <ThemeProvider>
          <QueryProvider>
            <Navigation />
            <main className='min-h-screen pb-16 md:pb-0'>{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
