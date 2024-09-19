import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { FeedbackForm } from './FeedbackForm';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export function FeedbackDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant='outline' size='icon' className='hover:text-pink-400'>
          <ChatBubbleOvalLeftIcon className='h-[1.2rem] w-[1.2rem]' />
          <span className='sr-only'>Open feedback dialog</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Feedback</DialogTitle>
          <DialogDescription>
            Let me know what can be improved!
          </DialogDescription>
        </DialogHeader>
        <main>
          <FeedbackForm />
        </main>
        <DialogFooter>
          <Button
            form='feedback-form'
            className='text-white font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500'
            type='submit'
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
