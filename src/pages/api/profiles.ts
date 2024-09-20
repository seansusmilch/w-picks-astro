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

  const data = {
    username: formData.get('username'),
    bio: formData.get('bio'),
    avatar: formData.get('avatar'),
  };

  // Remove null values to avoid updating with empty values
  Object.keys(data).forEach((key) => {
    if (data[key] === null) delete data[key];
  });

  const updatedUser = pb.collection('users').update(user.record.id, data);
  return new Response(JSON.stringify({ success: true, user: updatedUser }));
};
