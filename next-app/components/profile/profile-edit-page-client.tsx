'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AvatarEditSection } from '@/components/profile/avatar-edit-section';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { User, UserCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileEditPageClientProps {
  avatarUrl: string | null;
  username: string;
  bio?: string | null;
}

export function ProfileEditPageClient({
  avatarUrl,
  username,
  bio,
}: ProfileEditPageClientProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/profile');
    router.refresh();
  };

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Profile</h1>
      </div>

      <div className="space-y-6">
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
    </div>
  );
}

