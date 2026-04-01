'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateSettingsAction } from '@/app/actions/settings';
import type { UserSettingsType } from '@/lib/definitions';

interface SettingsViewProps {
  settings: UserSettingsType;
}

export function SettingsView({ settings }: SettingsViewProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, undefined);
  const [colorfulPicks, setColorfulPicks] = useState(settings.colorfulPicks);
  const [hideFromLatestPicks, setHideFromLatestPicks] = useState(settings.hideFromLatestPicks);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      // Values already updated via state
    }
  }, [state?.success]);

  const handleToggle = (field: 'colorfulPicks' | 'hideFromLatestPicks', value: boolean) => {
    if (field === 'colorfulPicks') {
      setColorfulPicks(value);
    } else {
      setHideFromLatestPicks(value);
    }
    requestAnimationFrame(() => {
      formRef.current?.requestSubmit();
    });
  };

  return (
    <div className="space-y-6">
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-primary">{state.message}</p>
      )}
      <form ref={formRef} action={formAction} className="space-y-6">
        <input type="hidden" name="colorfulPicks" value={colorfulPicks ? 'on' : 'off'} />
        <input type="hidden" name="hideFromLatestPicks" value={hideFromLatestPicks ? 'on' : 'off'} />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Hide me from latest picks</Label>
            <p className="text-sm text-muted-foreground">
              Don&apos;t show your picks on the public latest picks feed
            </p>
          </div>
          <Switch
            checked={hideFromLatestPicks}
            onCheckedChange={(checked) => handleToggle('hideFromLatestPicks', checked)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable colorful picks</Label>
            <p className="text-sm text-muted-foreground">
              Show colorful styling on your pick selections
            </p>
          </div>
          <Switch
            checked={colorfulPicks}
            onCheckedChange={(checked) => handleToggle('colorfulPicks', checked)}
            disabled={isPending}
          />
        </div>
      </form>
    </div>
  );
}
