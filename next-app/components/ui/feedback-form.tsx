'use client';

import { useActionState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  submitFeedbackAction,
  type FeedbackFormState,
} from '@/app/actions/feedback';

interface FeedbackFormProps {
  onSubmit?: () => void;
}

const initialState: FeedbackFormState = {};

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [state, formAction] = useActionState(submitFeedbackAction, initialState);

  useEffect(() => {
    if (state.success) {
      onSubmit?.();
    }
  }, [state.success, onSubmit]);

  return (
    <form id="feedback-form" action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="feedback-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="feedback-name"
          name="name"
          placeholder="Your name"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="feedback-text" className="text-sm font-medium">
          Feedback
        </label>
        <Textarea
          id="feedback-text"
          name="feedback"
          placeholder="What can be improved?"
          required
        />
      </div>
      <input
        type="hidden"
        name="page"
        defaultValue={
          typeof window !== 'undefined' ? window.location.href : ''
        }
      />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-primary">{state.message}</p>
      )}
    </form>
  );
}
