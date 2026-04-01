import { redirect } from 'next/navigation';

interface MatchupPageProps {
  params: Promise<{
    dateCode: string;
    gameCode: string;
  }>;
}

export default async function MatchupPage({ params }: MatchupPageProps) {
  const { dateCode, gameCode } = await params;
  redirect(`/matchup?date=${dateCode}&game=${gameCode}`);
}
