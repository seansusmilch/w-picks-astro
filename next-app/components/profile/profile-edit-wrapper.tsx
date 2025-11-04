'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileHeader } from '@/components/profile/profile-header';
import { AvatarEditSection } from '@/components/profile/avatar-edit-section';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Pencil, User, UserCircle } from 'lucide-react';

interface ProfileEditWrapperProps {
  avatarUrl: string | null;
  username: string;
  bio?: string | null;
}

export function ProfileEditWrapper({
  avatarUrl,
  username,
  bio,
}: ProfileEditWrapperProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSuccess = () => {
    setIsEditDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <ProfileHeader
        avatarUrl={avatarUrl}
        username={username}
        bio={bio}
        actionButton={
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="gap-2 w-full sm:w-auto"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        }
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Avatar</CardTitle>
                </div>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarEditSection
                  currentAvatarUrl={avatarUrl}
                  username={username}
                  onSuccess={handleSuccess}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>Update your username and bio</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditForm
                  username={username}
                  bio={bio}
                  onSuccess={handleSuccess}
                />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

