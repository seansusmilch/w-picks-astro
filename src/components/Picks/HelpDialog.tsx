import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger className='border rounded-lg hover:bg-muted h-full py-2 px-4 font-extrabold'>
        {/* <LifebuoyIcon className='h-10' /> */}?
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
