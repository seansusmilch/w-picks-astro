import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/profile/user-avatar';
import { ReactNode } from 'react';

interface ProfileHeaderProps {
  avatarUrl: string | null;
  username: string;
  bio?: string | null;
  actionButton?: ReactNode;
}

export function ProfileHeader({
  avatarUrl,
  username,
  bio,
  actionButton,
}: ProfileHeaderProps) {
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <UserAvatar
            avatarUrl={avatarUrl}
            username={username}
            className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  @{username}
                </h1>
                {bio && (
                  <p className="text-sm sm:text-base text-muted-foreground break-words">
                    {bio}
                  </p>
                )}
              </div>
              {actionButton && (
                <div className="hidden sm:block">{actionButton}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

