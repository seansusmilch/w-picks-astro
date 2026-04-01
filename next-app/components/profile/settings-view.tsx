'use client';

import { useActionState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateSettingsAction } from '@/app/actions/settings';
import type { UserSettingsType } from '@/lib/definitions';

interface SettingsViewProps {
  settings: UserSettingsType;
}

export function SettingsView({ settings }: SettingsViewProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, undefined);

  return (
    <div className="space-y-6">
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <form action={formAction} className="flex items-center justify-between">
        <input type="hidden" name="colorfulPicks" value={settings.colorfulPicks ? 'on' : 'off'} />
        <div className="space-y-0.5">
          <Label htmlFor="hideFromLatestPicks">Hide me from latest picks</Label>
          <p className="text-sm text-muted-foreground">
            Don&apos;t show your picks on the public latest picks feed
          </p>
        </div>
        <Switch
          id="hideFromLatestPicks"
          name="hideFromLatestPicks"
          defaultChecked={settings.hideFromLatestPicks}
          disabled={isPending}
          onCheckedChange={() => {
            const form = document.getElementById('hide-form') as HTMLFormElement;
            form.requestSubmit();
          }}
        />
      </form>
      <form id="hide-form" action={formAction} className="hidden">
        <input type="hidden" name="hideFromLatestPicks" value={settings.hideFromLatestPicks ? 'on' : 'off'} />
        <input type="hidden" name="colorfulPicks" value={settings.colorfulPicks ? 'on' : 'off'} />
      </form>

      <form action={formAction} className="flex items-center justify-between">
        <input type="hidden" name="hideFromLatestPicks" value={settings.hideFromLatestPicks ? 'on' : 'off'} />
        <div className="space-y-0.5">
          <Label htmlFor="colorfulPicks">Enable colorful picks</Label>
          <p className="text-sm text-muted-foreground">
            Show colorful styling on your pick selections
          </p>
        </div>
        <Switch
          id="colorfulPicks"
          name="colorfulPicks"
          defaultChecked={settings.colorfulPicks}
          disabled={isPending}
          onCheckedChange={() => {
            const form = document.getElementById('colorful-form') as HTMLFormElement;
            form.requestSubmit();
          }}
        />
      </form>
      <form id="colorful-form" action={formAction} className="hidden">
        <input type="hidden" name="hideFromLatestPicks" value={settings.hideFromLatestPicks ? 'on' : 'off'} />
        <input type="hidden" name="colorfulPicks" value={settings.colorfulPicks ? 'on' : 'off'} />
      </form>
    </div>
  );
}
