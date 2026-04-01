'use server';

import { z } from 'zod';
import { getAuthenticatedUser, getAdminPocketBase } from '@/lib/pocketbase-server';
import { getLogger } from '@/lib/logger';

const logger = getLogger('feedback');

const FeedbackSchema = z.object({
  name: z.string().min(1),
  feedback: z.string().min(1),
  page: z.string().optional(),
});

export interface FeedbackFormState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function submitFeedbackAction(
  prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const user = await getAuthenticatedUser();

  const name = formData.get('name') as string;
  const feedback = formData.get('feedback') as string;
  const page = formData.get('page') as string;

  const parsed = FeedbackSchema.safeParse({ name, feedback, page });
  if (!parsed.success) {
    logger.error({ errors: parsed.error.issues }, 'Feedback validation failed');
    return { error: 'Please fill out all required fields.' };
  }

  try {
    const pb = await getAdminPocketBase();
    await pb.collection('feedback').create({
      name: parsed.data.name,
      feedback: parsed.data.feedback,
      page: parsed.data.page || '',
      user: user?.record.id || '',
    });
    logger.info({ user: user?.record.id }, 'Feedback submitted successfully');
    return { success: true, message: 'Thank you for your feedback!' };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to submit feedback'
    );
    return { error: 'Failed to submit feedback. Please try again.' };
  }
}
