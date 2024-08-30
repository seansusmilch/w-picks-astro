import { type APIRoute } from 'astro';
import { getUser, getPB, getAPB } from '@/lib/data';

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

  pb.collection('users').update(user.record.id, formData);
  return new Response(JSON.stringify({ success: true }));
};
