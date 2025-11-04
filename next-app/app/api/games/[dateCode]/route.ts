import { NextResponse } from 'next/server';
import { getGamesByCodePrefix } from '@/app/actions/matchups';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dateCode: string }> }
) {
  const { dateCode } = await params;
  const games = await getGamesByCodePrefix(dateCode);
  return NextResponse.json({ games });
}


