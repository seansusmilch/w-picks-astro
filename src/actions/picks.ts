'use server';

import { upsertPick } from '@/lib/picks';
import { deletePick } from '@/lib/picks';
import { z } from 'zod';
import { getLogger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

const logger = getLogger('actions:picks');

const submitPickSchema = z.object({
  id: z.string().length(15).optional(),
  win_prediction: z.string().length(3),
  comment: z.string().optional(),
  matchup: z.string().length(15),
});

export async function submitPick(pick: z.infer<typeof submitPickSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    throw new Error('Unauthorized');
  }

  logger.info({ pick }, 'submitPick');
  return await upsertPick(pick);
}

const deletePickSchema = z.object({
  id: z.string({ message: 'You dont have a pick for this matchup' }).length(15),
  matchup: z.string().length(15),
});

export async function deletePickAction(data: z.infer<typeof deletePickSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    throw new Error('Unauthorized');
  }

  logger.info({ id: data.id, matchup: data.matchup }, 'deletePick');
  return await deletePick(data.id, data.matchup);
}