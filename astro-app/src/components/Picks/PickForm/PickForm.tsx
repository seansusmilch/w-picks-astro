import { TeamPicker } from './TeamPicker';
import { HelpDialog } from './HelpDialog';
import { Textarea } from '@/components/ui/textarea';
import { type MatchupType, type PickType, PickZ } from '@/lib/definitions';
import { useState } from 'react';
import clsx from 'clsx';
import { actions, isInputError } from 'astro:actions';
import { queryClient } from '@/stores/query';
import { useStore } from '@nanostores/react';

export function PickForm({
  matchup,
  pick,
}: {
  matchup: MatchupType;
  pick?: PickType;
}) {
  const client = useStore(queryClient);
  const { home_code, away_code } = matchup;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    win_prediction: pick?.win_prediction || 'indeterminate',
    comment: pick?.comment || '',
    pickId: pick?.id || '',
    matchup: matchup.id,
  });

  const handleSubmit = async (e) => {
    setError('');
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    console.log('formData', Object.fromEntries(formData.entries()));

    if (formData.get('win_prediction') === 'indeterminate') {
      const { data, error } = await actions.picks.deletePick(formData);

      if (data) {
        setFormState({
          ...formState,
          win_prediction: 'indeterminate',
          comment: '',
          pickId: '',
        });
        client.invalidateQueries({ queryKey: ['games'] });
      } else {
        if (isInputError(error)) {
          const errorMessage = Object.values(error.fields).flat().join(', ');
          setError(errorMessage);
        } else {
          console.error('Failed to delete pick:', error);
          setError(error.message);
        }
      }
    } else {
      const { data, error } = await actions.picks.submitPick(formData);

      if (data) {
        const pickData = PickZ.safeParse(data);
        if (!pickData.success) {
          console.error('Invalid pick data:', pickData.error);
          return;
        }

        const { win_prediction, comment, id, matchup } = pickData.data;
        setFormState({ win_prediction, comment, pickId: id, matchup });
        client.invalidateQueries({ queryKey: ['games'] });
      } else {
        if (isInputError(error)) {
          const errorMessage = Object.values(error.fields).flat().join(', ');
          setError(errorMessage);
        } else {
          console.error('Failed to save pick:', error);
          setError(error.message);
        }
      }
    }

    setLoading(false);
  };

  return (
    <form method='POST' onSubmit={handleSubmit}>
      <div className='p-4 text-center max-w-md rounded-xl border bg-card'>
        <h1 className='text-xl font-bold'>Your Pick</h1>
        <input type='hidden' name='id' value={formState.pickId} />
        <input type='hidden' name='matchup' value={formState.matchup} />
        <TeamPicker
          name='win_prediction'
          className='grow-0'
          home_code={home_code}
          away_code={away_code}
          logoClass='h-24'
          defaultValue={formState.win_prediction}
          disabled={loading}
        />

        <div className='flex flex-col pt-4 gap-4'>
          <div className='flex flex-col'>
            <div className='flex flex-row justify-between'>
              <label
                htmlFor='comment'
                className='text-left text-lg font-semibold'
              >
                Comment
              </label>
              {formState.comment.length > 200 && (
                <p className='text-sm'>{formState.comment.length}/250</p>
              )}
            </div>

            <Textarea
              name='comment'
              placeholder='I think they will win because...'
              disabled={loading}
              onChange={(e) =>
                setFormState({ ...formState, comment: e.target.value })
              }
              value={formState.comment}
            />
          </div>

          {error && (
            <div className='text-left text-destructive-foreground bg-destructive p-2 rounded-md'>
              <p className='font-semibold'>Error:</p>
              <p className=''>{error}</p>
            </div>
          )}
          <div className='flex flex-row gap-4 pt-4'>
            <HelpDialog />
            <button
              type='submit'
              disabled={loading}
              className={clsx(
                'p-2 grow rounded-lg text-white font-bold bg-linear-to-r from-cyan-500 to-purple-500',
                { 'opacity-70': loading }
              )}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
