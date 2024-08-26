import { TeamPicker } from './TeamPicker';
import { HelpDialog } from './HelpDialog';
import { Textarea } from '@/components/ui/textarea';
import { type MatchupType, type PickType, PickZ } from '@/lib/definitions';
import { useState } from 'react';
import clsx from 'clsx';

export function PickForm({
  matchup,
  pick,
}: {
  matchup: MatchupType;
  pick?: PickType;
}) {
  const { home_code, away_code } = matchup;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    win_prediction: pick?.win_prediction || 'indeterminate',
    comment: pick?.comment || '',
    pickId: pick?.id || '',
    matchup: matchup.id,
  });

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    if (formData.get('win_prediction') === 'indeterminate') {
      fetch('/api/picks', {
        method: 'DELETE',
        body: formData,
      })
        .then((res) => res.json())
        .then(({ success, error }) => {
          console.log('delete', success, error);

          if (success) {
            setFormState({
              ...formState,
              win_prediction: 'indeterminate',
              comment: '',
              pickId: '',
            });
          } else {
            console.error('Failed to delete pick:', error);
            setError(error);
          }
          setLoading(false);
        });

      return;
    }

    fetch('/api/picks', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then(({ success, error, data }) => {
        console.log('post', success, error, data);

        if (success) {
          const pickData = PickZ.safeParse(data);
          if (!pickData.success) {
            console.error('Invalid pick data:', pickData.error);
            return;
          }

          const { win_prediction, comment, id, matchup } = pickData.data;
          setFormState({ win_prediction, comment, pickId: id, matchup });
        } else {
          console.error('Failed to save pick:', error);
          setError(error);
        }

        setLoading(false);
      });
  };

  return (
    <form method='POST' onSubmit={handleSubmit}>
      <div className='p-4 text-center max-w-md rounded-xl shadow-md border bg-card'>
        <h1 className='text-2xl font-bold'>Your Pick</h1>
        <input type='hidden' name='pick_id' value={formState.pickId} />
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
            <label
              htmlFor='comment'
              className='text-left text-lg font-semibold'
            >
              Comment
            </label>

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
                'p-2 grow rounded-lg text-white font-bold bg-gradient-to-r from-cyan-500 to-purple-500',
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
