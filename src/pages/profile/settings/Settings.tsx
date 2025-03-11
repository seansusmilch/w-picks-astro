import { type UserSettingsType } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { actions } from 'astro:actions';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import type { FormEvent } from 'react';

export function Settings({ settings }: { settings: UserSettingsType }) {
  const $queryClient = useStore(queryClient);

  const updateSettings = useMutation(
    {
      mutationFn: async (data: Partial<UserSettingsType>) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        return actions.users.updateSettings(formData);
      },
      onSuccess: () => {
        $queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      },
      onError: (error) => {
        console.error(error);
      },
    },
    $queryClient
  );

  return (
    <div className='flex flex-col gap-4 p-4 text-lg w-full'>
      <div className='flex flex-row items-center justify-between gap-2'>
        <Label className='text-lg' htmlFor='hideFromLatestPicks'>
          Hide me from latest picks
        </Label>
        <Switch
          id='hideFromLatestPicks'
          name='hideFromLatestPicks'
          className='setting-switch'
          defaultChecked={settings.hideFromLatestPicks}
          onCheckedChange={(checked) => {
            updateSettings.mutate({ hideFromLatestPicks: checked });
          }}
        />
      </div>
    </div>
  );
}
