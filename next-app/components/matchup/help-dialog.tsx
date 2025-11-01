'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-9 w-9 p-0 font-extrabold'
          type='button'
        >
          ?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Picks FAQs</DialogTitle>
          <DialogTitle>Can I delete my pick?</DialogTitle>
          <DialogDescription>
            Yes, you can delete your pick by selecting the middle option in
            between the two team logos. You can delete your pick at any time
            before the game starts. Once the game starts, you cannot change your
            pick.
          </DialogDescription>
          <DialogTitle>How do I pick a team?</DialogTitle>
          <DialogDescription>
            Click on the team you think will win the game. You can change your
            pick at any time before the game starts.
          </DialogDescription>
          <DialogTitle>Can I change my pick?</DialogTitle>
          <DialogDescription>
            Yes, you can change your pick at any time before the game starts.
            Once the game starts, you cannot change your pick.
          </DialogDescription>
          <DialogTitle>What happens if I don't pick a team?</DialogTitle>
          <DialogDescription>
            If you don't pick a team, you will not receive a W or L. There is no
            penalty for not picking for a game.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

