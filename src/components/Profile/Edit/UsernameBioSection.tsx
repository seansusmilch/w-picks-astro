import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function UsernameBioSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

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
  };

  return (
    <form method='POST' onSubmit={handleSubmit} autoComplete='off'>
      <div className='flex flex-col gap-4 text-lg'>
        <div>
          <label htmlFor='username'>Username</label>
          <Input
            ref={usernameRef}
            defaultValue={user.record.username}
            disabled={loading}
            name='username'
            required
          />
        </div>

        <div>
          <label htmlFor='bio'>Bio</label>
          <Textarea
            ref={bioRef}
            defaultValue={user.record.bio}
            disabled={loading}
            name='bio'
            required
          />
        </div>
        <div className='flex justify-end'>
          <Button className='w-full lg:w-auto'>Save</Button>
        </div>
      </div>
    </form>
  );
}
