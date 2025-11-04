'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/profile/user-avatar';
import {
  updateProfileAction,
  type UpdateProfileFormState,
} from '@/app/actions/users';

interface AvatarEditSectionProps {
  currentAvatarUrl: string | null;
  username: string;
  onSuccess?: () => void;
}

const initialState: UpdateProfileFormState = {};

// Maximum file size: 5MB (matches server limit)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function AvatarEditSection({
  currentAvatarUrl,
  username,
  onSuccess,
}: AvatarEditSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatarUrl
  );
  const [fileError, setFileError] = useState<string | null>(null);

  // Update preview when current avatar changes
  useEffect(() => {
    setAvatarPreview(currentAvatarUrl);
  }, [currentAvatarUrl]);

  // Handle successful upload
  useEffect(() => {
    if (state?.success) {
      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      // Clear any file errors
      setFileError(null);
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state?.success, onSuccess]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `File size exceeds 5MB limit. Please choose a smaller image.`
        );
        // Clear the input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFileError('Invalid file type. Please use PNG, JPEG, GIF, or WebP.');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      // Revoke previous preview if it was a blob URL
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      // Create new preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleCancel = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // Revoke blob URL if exists
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    // Reset to current avatar
    setAvatarPreview(currentAvatarUrl);
    // Clear any file errors
    setFileError(null);
  };

  const hasFileSelected = (inputRef.current?.files?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <UserAvatar
            avatarUrl={avatarPreview}
            username={username}
            className="h-24 w-24 sm:h-32 sm:w-32"
          />
        </div>
        <form action={formAction} className="flex-1 min-w-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="avatar" className="text-sm font-medium">
                Choose Image
              </label>
              <Input
                ref={inputRef}
                id="avatar"
                name="avatar"
                type="file"
                className="w-full file:text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
                accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp'].join(
                  ','
                )}
                onChange={handleFileChange}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 5MB. Supported formats: PNG, JPEG, GIF, WebP
              </p>
            </div>
            {(state?.error || fileError) && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  {fileError || state?.error}
                </p>
              </div>
            )}
            {hasFileSelected && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 sm:basis-1/2"
                  variant="outline"
                  type="button"
                  disabled={isPending}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 sm:basis-1/2"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

