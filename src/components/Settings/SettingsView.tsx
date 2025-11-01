'use client';

import { type UserSettingsType } from '@/lib/definitions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { updateSettings } from '@/actions/users';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';

export function SettingsView({ settings }: { settings: UserSettingsType }) {
  const $queryClient = useStore(queryClient);

  const updateSettingsMutation = useMutation(
    {
      mutationFn: async (data: Partial<UserSettingsType>) => {
        return updateSettings(data);
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
            updateSettingsMutation.mutate({ hideFromLatestPicks: checked });
          }}
        />
      </div>

      <div className='flex flex-row items-center justify-between gap-2'>
        <Label className='text-lg' htmlFor='colorfulPicks'>
          Enable colorful picks
        </Label>
        <Switch
          id='colorfulPicks'
          name='colorfulPicks'
          className='setting-switch'
          defaultChecked={settings.colorfulPicks}
          onCheckedChange={(checked) => {
            updateSettingsMutation.mutate({ colorfulPicks: checked });
          }}
        />
      </div>
    </div>
  );
}
