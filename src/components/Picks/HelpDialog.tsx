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
          <DialogTitle>Picks FAQs</DialogTitle>
          <DialogDescription>
            <h2 className='text-lg font-bold'>Can I delete my pick?</h2>
            <p>
              Yes, you can delete your pick by selecting the middle option in
              between the two team logos. You can delete your pick at any time
              before the game starts. Once the game starts, you cannot change
              your pick.
            </p>
            <h2 className='text-lg font-bold'>How do I pick a team?</h2>
            <p>
              Click on the team you think will win the game. You can change your
              pick at any time before the game starts.
            </p>
            <h2 className='text-lg font-bold'>Can I change my pick?</h2>
            <p>
              Yes, you can change your pick at any time before the game starts.
              Once the game starts, you cannot change your pick.
            </p>
            <h2 className='text-lg font-bold'>
              What happens if I don't pick a team?
            </h2>
            <p>
              If you don't pick a team, you will not receive a W or L. There is
              no penalty for not picking for a game.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
