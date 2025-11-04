'use client';

import { useActionState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  updateProfileAction,
  type UpdateProfileFormState,
} from '@/app/actions/users';

interface ProfileEditFormProps {
  username: string;
  bio?: string | null;
  onSuccess?: () => void;
}

const initialState: UpdateProfileFormState = {};

export function ProfileEditForm({
  username,
  bio,
  onSuccess,
}: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  // Handle successful update
  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={formAction} autoComplete="off">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={bio || ''}
            disabled={isPending}
            className="min-h-[100px]"
            rows={bio?.split('\n').length || 4}
            placeholder="Tell us about yourself..."
          />
        </div>
        {state?.error && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        )}
        {state?.success && state?.message && (
          <div className="rounded-md bg-primary/10 p-3">
            <p className="text-sm text-primary">{state.message}</p>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}

