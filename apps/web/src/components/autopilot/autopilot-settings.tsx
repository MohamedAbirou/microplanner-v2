'use client';

import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAutopilotStatus,
  useUpdateAutopilotSettings,
  useRunAutopilot,
} from '@/hooks/use-graphql-extended';

/**
 * Autopilot settings — enable full-day rescheduling and choose whether changes
 * apply automatically (AUTO, Motion-style) or wait for approval (SUGGEST).
 */
export function AutopilotSettings() {
  const { status, loading } = useAutopilotStatus();
  const { updateSettings, loading: saving } = useUpdateAutopilotSettings();
  const { runAutopilot, loading: running } = useRunAutopilot();

  const enabled = Boolean(status?.enabled);
  const mode = status?.mode || 'SUGGEST';

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <Wand2 className="h-5 w-5" />
          Day autopilot
        </CardTitle>
        <CardDescription className="text-[13px]">
          Automatically re-pack your day around meetings, focus time, and priorities when your
          calendar changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Enable autopilot</Label>
            <p className="text-[13px] text-muted-foreground">
              Watches your connected calendars and reschedules within ~5 minutes of a change.
            </p>
          </div>
          <Switch
            checked={enabled}
            disabled={loading || saving}
            onCheckedChange={(checked) => updateSettings({ variables: { enabled: checked } })}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Mode</Label>
            <p className="text-[13px] text-muted-foreground">
              {mode === 'AUTO'
                ? 'Changes are applied automatically.'
                : 'Changes are proposed for you to approve.'}
            </p>
          </div>
          <Select
            value={mode}
            disabled={!enabled || saving}
            onValueChange={(value) => updateSettings({ variables: { mode: value } })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUGGEST">Suggest first</SelectItem>
              <SelectItem value="AUTO">Auto-apply</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={running}
          onClick={() => runAutopilot({ variables: {} })}
        >
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Run autopilot on today
        </Button>
      </CardContent>
    </Card>
  );
}
