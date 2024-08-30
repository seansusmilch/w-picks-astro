import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getPB, getUser } from '@/lib/data';

export function AvatarSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(
    ''
    // new URL(
    //   `/api/files/users/${user.record.id}/${user.record.avatar}`,
    //   POCKETBASE_URL
    // ).toString()
  );

  useEffect(() => {
    const pb = getPB();
    pb.authStore.loadFromCookie(document.cookie);
    if (!pb.authStore.isValid) return;

    getUser().then((usr) => {
      const url = pb.files.getUrl(usr.record, usr.record.avatar);
      console.log('usr', usr);
      setAvatar(url);
    });
  });

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch('/api/profiles', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (res.ok) {
        setLoading(false);
      }
    });
    console.log(formData.get('avatar'));
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
            name='avatar'
            type='file'
            className='w-64'
            accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp'].join(
              ','
            )}
          />
          <Button disabled={loading}>Upload</Button>
        </div>
      </form>
    </div>
  );
}
