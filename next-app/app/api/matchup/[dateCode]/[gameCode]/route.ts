import { NextResponse } from 'next/server';
import { getMatchupPageData } from '@/app/actions/matchups';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dateCode: string; gameCode: string }> }
) {
  const { dateCode, gameCode } = await params;
  const code = `${dateCode}/${gameCode}`;
  const data = await getMatchupPageData(code);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}


