import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { actions } from 'astro:actions';

export function UsernameBioSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await actions.users.updateProfile(formData);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to update profile');
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
