import { TeamPicker } from './TeamPicker';
import { HelpDialog } from './HelpDialog';
import { Textarea } from '@/components/ui/textarea';
import { type MatchupType, type PickType } from '@/lib/definitions';

export function PickForm({
  matchup,
  pick,
}: {
  matchup: MatchupType;
  pick?: PickType;
}) {
  const { home_code, away_code, id } = matchup;

  return (
    <form method='POST'>
      <div className='p-4 text-center max-w-md rounded-xl shadow-md border bg-card'>
        <h1 className='text-2xl font-bold'>Your Pick</h1>
        <input type='hidden' name='matchup' value={id} />
        <TeamPicker
          name='win_prediction'
          className='grow-0'
          home_code={home_code}
          away_code={away_code}
          logoClass='h-24'
          defaultValue={pick?.win_prediction}
        />

        <div className='flex flex-col pt-4'>
          <label htmlFor='comment' className='text-left text-lg font-semibold'>
            Comment
          </label>

          <Textarea
            name='comment'
            placeholder='I think they will win because...'
            defaultValue={pick?.comment}
          />

          <div className='flex flex-row gap-4 pt-4'>
            <HelpDialog />
            <button
              type='submit'
              className='p-2 grow rounded-lg text-white font-bold bg-gradient-to-r from-cyan-500 to-purple-500'
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
