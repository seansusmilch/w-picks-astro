import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

export function AvatarSection({ user }: { user: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user.record.avatar_url);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch('/api/profiles', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (res.ok) {
        inputRef.current.value = '';
        setLoading(false);
      }
    });
  };

  return (
    <div className='flex flex-row gap-4'>
      <Avatar className='h-52 w-52'>
        <AvatarImage src={avatar} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <form action='POST' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4'>
          <p className='text-lg'>Change Avatar</p>
          <Input
            ref={inputRef}
            name='avatar'
            type='file'
            className='w-64'
            accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp'].join(
              ','
            )}
            onChange={(e) => setAvatar(URL.createObjectURL(e.target.files[0]))}
          />
          {inputRef.current?.files?.length > 0 && (
            <div className='flex flex-row w-full gap-2'>
              <Button
                className='basis-1/2'
                variant='outline'
                type='button'
                disabled={loading}
                onClick={() => {
                  inputRef.current.value = '';
                  setAvatar(user.record.avatar_url);
                }}
              >
                Cancel
              </Button>
              <Button className='basis-1/2' type='submit' disabled={loading}>
                Upload
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
