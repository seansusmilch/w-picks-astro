'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { updateProfile } from '@/actions/users';
import { useRouter } from 'next/navigation';

export function AvatarSection({ user }: { user: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(user.record.avatar_url);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const avatarFile = formData.get('avatar') as File;
      
      if (avatarFile && avatarFile.size > 0) {
        await updateProfile({
          avatar: avatarFile,
        });
        inputRef.current!.value = '';
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-row gap-4'>
      <UserAvatar className='h-20 w-20 lg:h-36 lg:w-36' avatar_url={avatar} />
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4'>
          <p className='text-lg'>Change Avatar</p>
          <Input
            ref={inputRef}
            name='avatar'
            type='file'
            className='max-w-64 file:text-foreground'
            accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp'].join(
              ','
            )}
            onChange={(e) => setAvatar(URL.createObjectURL(e.target.files![0]))}
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          {inputRef.current?.files?.length > 0 && (
            <div className='flex flex-row w-full gap-2'>
              <Button
                className='basis-1/2'
                variant='outline'
                type='button'
                disabled={loading}
                onClick={() => {
                  inputRef.current!.value = '';
                  setAvatar(user.record.avatar_url);
                }}
              >
                Cancel
              </Button>
              <Button className='basis-1/2' type='submit' disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
