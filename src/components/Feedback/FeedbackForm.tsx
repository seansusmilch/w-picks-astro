import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { actions } from 'astro:actions';

export function FeedbackForm({ onSubmit }: { onSubmit?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.set('page', window.location.href);

    try {
      const { error } = await actions.submitFeedback(formData);
      if (error) {
        console.error('Error submitting feedback:', error);
        setErrorMessage('Failed to submit feedback. Please try again.');
        return;
      }

      setErrorMessage(null);
      onSubmit?.();
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
