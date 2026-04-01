'use client';

import { useState } from 'react';
import { XIcon, Loader2, Lock } from 'lucide-react';
import { TeamPicker } from './team-picker';
import { HelpDialog } from './help-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Logo } from '@/components/nba/logo';
import { TeamMap } from '@/lib/team-map';
import type { MatchupType, PickType } from '@/lib/definitions';
import { useSubmitPick, useDeletePick } from '@/lib/mutations';
import { cn } from '@/lib/utils';

interface PickFormProps {
  matchup: MatchupType;
  pick?: PickType;
  scoreboardStatus?: number; // 0 = pre-game, 1-2 = live, 3 = finished
  onPickUpdate?: (pick?: PickType) => void | Promise<void>; // Callback to refetch picks after submission, optionally with optimistic pick data
}

export function PickForm({
  matchup,
  pick,
  scoreboardStatus = 0,
  onPickUpdate,
}: PickFormProps) {
  const { home_code, away_code } = matchup;

  // Check if picks are locked (game has started)
  const picksLocked = scoreboardStatus >= 2;

  const [accordionValue, setAccordionValue] = useState<string>(
    pick ? '' : 'pick-form'
  );

  // React Query mutations
  const submitPickMutation = useSubmitPick();
  const deletePickMutation = useDeletePick();

  const [formState, setFormState] = useState({
    win_prediction: pick?.win_prediction || 'indeterminate',
    comment: pick?.comment || '',
    pickId: pick?.id || '',
    matchup: matchup.id,
  });

  const [prevSyncKey, setPrevSyncKey] = useState(() => `${pick?.id ?? ''}:${matchup.id}`);
  const syncKey = `${pick?.id ?? ''}:${matchup.id}`;

  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey);

    if (pick) {
      setFormState({
        win_prediction: pick.win_prediction,
        comment: pick.comment || '',
        pickId: pick.id,
        matchup: matchup.id,
      });
    } else {
      setFormState({
        win_prediction: 'indeterminate',
        comment: '',
        pickId: '',
        matchup: matchup.id,
      });
      setAccordionValue('pick-form');
    }
  }

  const handleDeleteSuccess = () => {
    setFormState({
      win_prediction: 'indeterminate',
      comment: '',
      pickId: '',
      matchup: matchup.id,
    });
    setAccordionValue('pick-form');
    if (onPickUpdate) {
      if (pick) {
        onPickUpdate({ ...pick, win_prediction: 'indeterminate' as const });
      } else {
        onPickUpdate();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const winPrediction = formData.get('win_prediction')?.toString();
    const comment = formData.get('comment')?.toString() || '';

    if (winPrediction === 'indeterminate') {
      if (formState.pickId) {
        deletePickMutation.mutate(
          {
            id: formState.pickId,
            matchup: formState.matchup,
            matchupCode: matchup.code,
            userId: pick?.user,
          },
          { onSuccess: handleDeleteSuccess }
        );
      }
    } else if (winPrediction) {
      const optimisticPick: PickType | undefined = pick?.expand?.user
        ? {
            ...pick,
            win_prediction: winPrediction,
            comment: comment,
            updated: new Date().toISOString(),
          }
        : undefined;

      submitPickMutation.mutate(
        {
          id: formState.pickId || undefined,
          win_prediction: winPrediction,
          comment: comment,
          matchup: formState.matchup,
          matchupCode: matchup.code,
          optimisticPick,
        },
        {
          onSuccess: (data) => {
            const submittedPick = data?.pick;
            if (!submittedPick || submittedPick.matchup !== matchup.id) return;
            setFormState({
              win_prediction: submittedPick.win_prediction,
              comment: submittedPick.comment || '',
              pickId: submittedPick.id,
              matchup: matchup.id,
            });
            setAccordionValue('');
            if (onPickUpdate) {
              const expandedPick = pick?.expand?.user
                ? {
                    ...submittedPick,
                    expand: { ...pick.expand, user: pick.expand.user },
                  }
                : submittedPick;
              onPickUpdate(expandedPick);
            }
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!formState.pickId) return;
    deletePickMutation.mutate(
      {
        id: formState.pickId,
        matchup: formState.matchup,
        matchupCode: matchup.code,
        userId: pick?.user,
      },
      { onSuccess: handleDeleteSuccess }
    );
  };

  const loading = submitPickMutation.isPending || deletePickMutation.isPending;
  const isDeletingState = deletePickMutation.isPending;
  const isSubmittingState = submitPickMutation.isPending;
  const error =
    submitPickMutation.data?.error || deletePickMutation.data?.error;

  const teamCode = pick?.win_prediction;
  const teamInfo = teamCode ? TeamMap[teamCode as keyof typeof TeamMap] : null;
  const teamName = teamInfo?.name_short || teamCode || '';

  // Minimized view content (shown in accordion trigger when collapsed)
  const minimizedContent =
    pick && teamCode ? (
      <div className='flex items-center gap-3 flex-1 min-w-0'>
        <Logo className='h-10 w-10 shrink-0' tricode={teamCode} />
        <div className='flex-1 min-w-0'>
          <p className='font-semibold truncate'>{teamName}</p>
        </div>
      </div>
    ) : (
      <p className='text-sm text-muted-foreground'>No pick submitted</p>
    );

  // When locked, keep accordion collapsed and disable expansion
  const lockedAccordionValue = picksLocked ? '' : accordionValue;

  return (
    <Accordion
      type='single'
      collapsible={!picksLocked}
      value={lockedAccordionValue}
      onValueChange={picksLocked ? undefined : setAccordionValue}
      className='w-full'
    >
      <AccordionItem value='pick-form' className='border-none'>
        <AccordionTrigger
          className={cn('hover:no-underline py-0', {
            'cursor-not-allowed opacity-75': picksLocked,
            'pointer-events-none': picksLocked,
            '[&>svg:last-child]:hidden': picksLocked, // Hide chevron (last SVG) when locked
          })}
          disabled={picksLocked}
        >
          <div
            className={cn('flex items-center gap-3', {
              'w-full': !picksLocked,
              'flex-1': picksLocked,
            })}
          >
            <Badge variant='secondary' className='shrink-0'>
              Your Pick
            </Badge>
            {minimizedContent}
          </div>
          {picksLocked && (
            <Lock className='h-4 w-4 shrink-0 text-muted-foreground' />
          )}
        </AccordionTrigger>
        <AccordionContent className='pt-4'>
          {picksLocked ? (
            <div className='text-center py-4'>
              <p className='text-sm text-muted-foreground'>
                Picks are locked. This game has already started.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type='hidden' name='id' value={formState.pickId} />
              <input type='hidden' name='matchup' value={formState.matchup} />
              <div className='flex flex-col gap-4'>
                <div className='flex justify-center'>
                  <TeamPicker
                    name='win_prediction'
                    className='grow-0'
                    home_code={home_code}
                    away_code={away_code}
                    logoClass='h-24'
                    defaultValue={formState.win_prediction}
                    disabled={loading}
                  />
                </div>

                <div className='flex flex-col'>
                  <div className='flex flex-row justify-between items-center mb-2'>
                    <Label
                      htmlFor='comment'
                      className='text-left text-lg font-semibold'
                    >
                      Comment
                    </Label>
                    {formState.comment.length > 200 && (
                      <p className='text-sm text-muted-foreground'>
                        {formState.comment.length}/250
                      </p>
                    )}
                  </div>

                  <Textarea
                    id='comment'
                    name='comment'
                    placeholder='I think they will win because...'
                    disabled={loading}
                    onChange={(e) =>
                      setFormState({ ...formState, comment: e.target.value })
                    }
                    value={formState.comment}
                    maxLength={250}
                  />
                </div>

                {error && (
                  <div className='text-left text-destructive-foreground bg-destructive p-2 rounded-md animate-in fade-in-0 slide-in-from-top-1 duration-200'>
                    <p className='font-semibold'>Error:</p>
                    <p>{error}</p>
                  </div>
                )}

                <div className='flex flex-row gap-3 pt-2'>
                  <div className='shrink-0'>
                    <HelpDialog />
                  </div>
                  {formState.pickId && (
                    <Button
                      type='button'
                      variant='destructive'
                      onClick={handleDelete}
                      disabled={loading}
                      className='gap-2 shrink-0 h-9'
                    >
                      {isDeletingState ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <XIcon className='h-4 w-4' />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    type='submit'
                    disabled={loading}
                    className={cn('flex-1 rounded-lg font-bold gap-2 h-9', {
                      'opacity-70': loading,
                    })}
                  >
                    {isSubmittingState ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
