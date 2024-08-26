import { type APIRoute } from 'astro';
import { getUser, getPB, getAPB } from '@/lib/data';
import { PickZ } from '@/lib/definitions';
import { z } from 'astro/zod';

const PickFormZ = PickZ.omit({ win_prediction: true, id: true }).extend({
  win_prediction: z.string(),
  id: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  const pb = getPB();
  if (!pb.authStore.isValid) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  const user = await getUser();
  const formData = await request.formData();

  const pickData = PickFormZ.safeParse({
    id: formData.get('pick_id'),
    user: user.record.id,
    matchup: formData.get('matchup'),
    win_prediction: formData.get('win_prediction'),
    comment: formData.get('comment'),
  });

  if (pickData.data.win_prediction === 'indeterminate') {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          'Bad Request: Cannot create/update a pick with an indeterminate prediction',
      }),
      { status: 400 }
    );
  }

  let pickResponse = null;

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
      exists = !!pick;
    }

    if (exists) {
      pickResponse = await pb
        .collection('picks')
        .update(pickData.data.id, pickData.data);
    } else {
      pickResponse = await pb.collection('picks').create(pickData.data);
    }
  } catch (e) {
    console.error('Error saving pick:', e.message);
  } finally {
    const newPick = PickZ.safeParse(pickResponse);
    if (!newPick.success) {
      console.error('Failed to save pick:', newPick.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save pick' })
      );
    }

    return new Response(JSON.stringify({ success: true, data: newPick.data }));
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const pb = getPB();
  if (!pb.authStore.isValid) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  const user = await getUser();
  const formData = await request.formData();
  const pickIdZ = z.string().length(15);

  const pickId = pickIdZ.safeParse(formData.get('pick_id'));
  if (!pickId.success) {
    console.log('Invalid pick ID:', pickId.error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Bad Request: Couldnt parse pick ID',
      }),
      { status: 400 }
    );
  }

  const pick = await pb.collection('picks').getOne(pickId.data);
  if (!pick) {
    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404 }
    );
  }

  await pb.collection('picks').delete(pickId.data);

  return new Response(JSON.stringify({ success: true }));
};
