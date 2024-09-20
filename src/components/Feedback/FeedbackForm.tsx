import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getPB } from '@/lib/data_client';

export function FeedbackForm({ onSubmit }: { onSubmit?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get('name'),
      feedback: formData.get('feedback'),
      page: window.location.href,
    };
    const pb = getPB();

    pb.collection('feedback')
      .create(data)
      .then(() => {
        setLoading(false);
        onSubmit?.();
      });
  };

  return (
    <form
      id='feedback-form'
      method='POST'
      onSubmit={handleSubmit}
      autoComplete='off'
    >
      <div className='flex flex-col gap-4 text-lg'>
        <div>
          <label htmlFor='name'>Your name</label>
          <Input disabled={loading} id='name' name='name' required />
        </div>

        <div>
          <label htmlFor='feedback'>Your feedback</label>
          <Textarea disabled={loading} id='feedback' name='feedback' required />
        </div>
      </div>
    </form>
  );
}
