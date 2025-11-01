import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Trophy,
  MessageSquare,
  Users,
  BarChart,
  Download,
  ArrowRight,
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';
import Image from 'next/image';

export const metadata: Metadata = {
  title: `${APP_NAME} - NBA Picks App`,
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  const isAuthed = pbAuth ? !!(await getUser(pbAuth.value)) : false;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-radial from-background via-primary/10 to-transparent -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10"></div>

        <Image
          src="/assets/icons/maskable-icon-512x512.png"
          alt={`${APP_NAME} Logo`}
          className="w-28 h-28 rounded-xl mb-6 shadow-lg transition-transform hover:scale-105 duration-300"
          width={112}
          height={112}
          priority
        />
        <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {APP_NAME}
        </h1>
        <p className="text-xl text-muted-foreground p-4 max-w-md">
          Your ultimate companion for NBA predictions and pick 'ems
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Link href={isAuthed ? '/stats/weekly' : '/login'} className="w-full group">
            <Button
              size="lg"
              className="w-full group-hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 px-8 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Join the community and start predicting NBA games today</span>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 text-center">What You Can Do</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Everything you need to enjoy the NBA season with friends and fellow fans
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-14 w-14 mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View NBA Matchups</h3>
              <p className="text-muted-foreground">
                Stay updated with all NBA games and with data from NBA.com
              </p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-14 w-14 mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Your Picks</h3>
              <p className="text-muted-foreground">
                Predict winners for each game and build your prediction record
              </p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-14 w-14 mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Thoughts</h3>
              <p className="text-muted-foreground">
                Add comments explaining your picks...or say something funny
              </p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-14 w-14 mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">See Community Picks</h3>
              <p className="text-muted-foreground">
                View what others are predicting and their reasoning
              </p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-14 w-14 mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Stats</h3>
              <p className="text-muted-foreground">
                Monitor your weekly performance and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto">
        <hr className="border-t my-8 opacity-30" />
      </div>

      {/* Install Instructions */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 text-center">Install the App</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Get the best experience by installing {APP_NAME} on your device
          </p>

          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-4 mb-6 bg-gradient-to-br from-card to-card/50">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="h-16 w-16 text-primary bg-primary/10 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Download className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">
                  Install {APP_NAME} on Your Phone
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Get the full app experience with offline capabilities, faster loading
                  times, and a native feel.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card/50 p-4 rounded-lg border">
                    <h4 className="font-medium text-lg mb-3">On iPhone (Safari):</h4>
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>
                        Tap the <span className="font-semibold text-foreground">Share</span>{' '}
                        button
                      </li>
                      <li>
                        Scroll down and select{' '}
                        <span className="font-semibold text-foreground">
                          Add to Home Screen
                        </span>
                      </li>
                      <li>
                        Tap <span className="font-semibold text-foreground">Add</span> in the
                        top-right corner
                      </li>
                    </ol>
                  </div>

                  <div className="bg-card/50 p-4 rounded-lg border">
                    <h4 className="font-medium text-lg mb-3">On Android (Chrome):</h4>
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>
                        Tap the <span className="font-semibold text-foreground">⋮</span> menu
                        button
                      </li>
                      <li>
                        Select{' '}
                        <span className="font-semibold text-foreground">Install app</span> or{' '}
                        <span className="font-semibold text-foreground">
                          Add to Home Screen
                        </span>
                      </li>
                      <li>Follow the on-screen instructions</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border bg-primary text-primary-foreground shadow-lg p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 -z-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to Make Your Picks?</h2>
              <p className="mb-8 text-primary-foreground/90 max-w-lg">
                Join the community and start predicting NBA games today. Track your success
                and compete with friends!
              </p>
              <Link href={isAuthed ? '/stats/weekly' : '/login'}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-medium px-8 hover:shadow-lg transition-all duration-300"
                >
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-muted-foreground border-t">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for NBA fans</p>
          <div className="container mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground/70">
              {APP_NAME} is not affiliated with, endorsed by, or sponsored by the National
              Basketball Association (NBA). All NBA team names, logos, and brands are property
              of their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}