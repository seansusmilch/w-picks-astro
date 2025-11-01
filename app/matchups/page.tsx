import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCodePrefixFromDate } from '@/lib/data_common';
import { DateTime } from 'luxon';
import { GamesPage } from '@/components/GamesViewer/GamesPage';
import { getCodePrefixes } from '@/lib/matchups';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Matchups',
};

export default async function MatchupsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/matchups';
  const params = await searchParams;

  const codePrefixes = await getCodePrefixes();
  const pages = codePrefixes.map((c) => ({
    date_code: c.date_code,
    title: DateTime.fromISO(c.date_code as string).toFormat('ccc, M/d'),
    href: `${pathname}?page=${c.date_code}`,
  }));

  const codePrefix = params.page || getCodePrefixFromDate(new Date());

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <GamesPage
        codePrefix={codePrefix}
        userId={user.record.id}
        pages={pages}
      />
    </div>
  );
}