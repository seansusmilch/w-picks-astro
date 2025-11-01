'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { submitFeedback } from '@/actions';

export function FeedbackForm({ onSubmit }: { onSubmit?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const feedback = formData.get('feedback') as string;
    const page = typeof window !== 'undefined' ? window.location.href : '';

    try {
      await submitFeedback({
        name,
        feedback,
        page,
      });
      setErrorMessage(null);
      onSubmit?.();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMessage('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {errorMessage && (
          <div className='bg-red-500 text-white p-2 rounded-md'>
            {errorMessage}
          </div>
        )}
      </div>
    </form>
  );
}
