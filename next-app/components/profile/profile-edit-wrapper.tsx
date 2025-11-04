import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Pencil } from 'lucide-react';

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
  return (
    <ProfileHeader
      avatarUrl={avatarUrl}
      username={username}
      bio={bio}
      actionButton={
        <Link href="/profile/edit">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        </Link>
      }
    />
  );
}

