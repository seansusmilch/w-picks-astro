'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/actions/users';
import { useRouter } from 'next/navigation';

export function UsernameBioSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await updateProfile({
        username: formData.get('username') as string,
        bio: formData.get('bio') as string,
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete='off'>
      <div className='flex flex-col gap-4 text-lg'>
        <div>
          <label htmlFor='username'>Username</label>
          <Input
            defaultValue={user.record.username}
            disabled={loading}
            name='username'
            required
          />
        </div>

        <div>
          <label htmlFor='bio'>Bio</label>
          <Textarea
            defaultValue={user.record.bio}
            disabled={loading}
            name='bio'
            required
            className='min-h-[100px] resize-none'
            rows={user.record.bio?.split('\n').length || 4}
          />
        </div>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <div className='flex justify-end'>
          <Button className='w-full lg:w-auto' disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}
