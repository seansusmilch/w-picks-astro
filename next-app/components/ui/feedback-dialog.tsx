'use client';

import { useRef } from 'react';
import { MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedbackForm } from '@/components/ui/feedback-form';

export function FeedbackDialog() {
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageCircleIcon className="h-4 w-4" />
          <span className="sr-only">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>
            Let me know what can be improved!
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm
          onSubmit={() => closeRef.current?.click()}
        />
        <DialogFooter>
          <Button type="submit" form="feedback-form">
            Submit
          </Button>
        </DialogFooter>
        <DialogClose ref={closeRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
