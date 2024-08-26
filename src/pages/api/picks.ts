import { type APIRoute } from 'astro';
import { getUser, getPB, getAPB } from '@/lib/data';
import { PickZ } from '@/lib/definitions';
import { z } from 'astro/zod';

const PickFormZ = PickZ.omit({ win_prediction: true, id: true }).extend({
  win_prediction: z.string(),
  id: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const pb = getPB();
  const user = await getUser();

  const pickData = PickFormZ.safeParse({
    id: formData.get('pick_id'),
    user: user.record.id,
    matchup: formData.get('matchup'),
    win_prediction: formData.get('win_prediction'),
    comment: formData.get('comment'),
  });

  let newPick = null;

  try {
    if (!pickData.success) {
      console.error('Invalid pick data:', pickData.error);
      throw new Error(
        `Invalid pick data: ${JSON.stringify(pickData.error.issues)}`
      );
    }

    let exists = false;
    if (pickData.data.id) {
      const pick = await pb
        .collection('picks')
        .getOne(pickData.data.id)
        .catch(() => null);
      console.log('pick:', pick);
      exists = !!pick;
      //   delete pickData.data.id;
    }

    console.log('Exists:', exists);
    console.log('New Pick:', pickData.data);

    if (!exists && pickData.data.win_prediction === 'indeterminate') {
      throw new Error('Cannot create a pick with an indeterminate prediction');
    }

    if (exists) {
      if (pickData.data.win_prediction === 'indeterminate') {
        newPick = await pb.collection('picks').delete(pickData.data.id);
      } else
        newPick = await pb
          .collection('picks')
          .update(pickData.data.id, pickData.data);
    } else {
      newPick = await pb.collection('picks').create(pickData.data);
    }
  } catch (e) {
    console.error('Error saving pick:', e.message);
  } finally {
    return new Response(JSON.stringify({ success: true, data: newPick }));
  }
};
