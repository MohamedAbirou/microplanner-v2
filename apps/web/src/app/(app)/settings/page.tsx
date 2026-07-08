'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUserSettings, useUpdateUserSettings, useUpdateUserProfile, useTasks } from '@/hooks/use-graphql';
import { useTheme } from 'next-themes';
import {
  User,
  Bell,
  Calendar as CalendarIcon,
  Palette,
  CreditCard,
  Shield,
  Moon,
  Sun,
  Laptop,
  Key,
} from 'lucide-react';
import { TierGate } from '@/components/tier-gate';
import { ApiKeysManager } from '@/components/settings/api-keys-manager';
import { PushNotificationsToggle } from '@/components/settings/push-notifications-toggle';
import { AiMemoryManager } from '@/components/settings/ai-memory-manager';
import { ReferralPanel } from '@/components/settings/referral-panel';
import { useMutation, useApolloClient } from '@apollo/client';
import { DELETE_MY_ACCOUNT, EXPORT_MY_DATA } from '@/graphql/operations-extended';
import * as operations from '@/graphql/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/page-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { CalendarSyncCard } from '@/components/calendar/calendar-sync-card';
import { AutopilotSettings } from '@/components/autopilot/autopilot-settings';
import { UpgradeButton } from '@/components/upgrade-button';
import { useTier } from '@/contexts/tier-context';
import {
  useCreateBillingPortalSession,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-graphql-extended';
import { formatTierLabel, getNextTier, getTierPrice, getUpgradePitch } from '@/lib/upgrade';
import Link from 'next/link';
import {
  exportTasksToCSV,
  exportGoalsToCSV,
  exportPlansToCSV,
  exportTasksToJSON,
  exportGoalsToJSON,
  exportPlansToJSON,
  exportAllDataToJSON,
} from '@/lib/export';

// The UI offers 4 chronotypes but the backend stores a 3-value EnergyPattern.
// Map both directions (dolphin folds into BALANCED on the way in).
const CHRONOTYPE_TO_ENERGY: Record<string, string> = {
  lion: 'MORNING_PERSON',
  bear: 'BALANCED',
  wolf: 'NIGHT_OWL',
  dolphin: 'BALANCED',
};

const ENERGY_TO_CHRONOTYPE: Record<string, string> = {
  MORNING_PERSON: 'lion',
  BALANCED: 'bear',
  NIGHT_OWL: 'wolf',
};

// UI theme values are lowercase; the schema Theme enum is uppercase.
const THEME_TO_ENUM: Record<string, string> = {
  light: 'LIGHT',
  dark: 'DARK',
  system: 'SYSTEM',
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('profile');
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [gdprExporting, setGdprExporting] = React.useState(false);
  const apolloClient = useApolloClient();
  const [deleteMyAccount] = useMutation(DELETE_MY_ACCOUNT);

  React.useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // Fetch user settings from GraphQL
  const { user: dbUser, settings, loading: settingsLoading } = useUserSettings();
  const { updateSettings } = useUpdateUserSettings();
  const { updateProfile } = useUpdateUserProfile();
  const { preferences: notificationPreferences } = useNotificationPreferences();
  const { updatePreferences } = useUpdateNotificationPreferences();
  const { setTheme } = useTheme();

  // Tasks are fetched on-demand during export to avoid loading full history on mount.
  const { refetch: refetchTasks } = useTasks(undefined, undefined, { skipQuery: true });

  // Local state for settings (synced with GraphQL)
  const [profileSettings, setProfileSettings] = React.useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    chronotype: 'bear',
    timezone: 'America/New_York',
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    enableTaskReminders: true,
    enableWeeklyPlan: true,
    enableOverbookedAlerts: true,
    enableBreakReminders: true,
    enableFocusTimeAlerts: true,
    enableUpcomingMeetings: true,
  });

  const [appearanceSettings, setAppearanceSettings] = React.useState({
    theme: 'system',
  });

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings || dbUser) {
      const energy = settings?.energyPattern || dbUser?.energyPattern;
      setProfileSettings({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        chronotype: (energy && ENERGY_TO_CHRONOTYPE[energy]) || 'bear',
        timezone: dbUser?.timezone || 'America/New_York',
      });
      setAppearanceSettings({
        theme: settings?.theme ? settings.theme.toLowerCase() : 'system',
      });
    }
  }, [settings, dbUser, user]);

  // Notification toggles are backed by productivity notification preferences,
  // not user settings (which only persists theme/energyPattern).
  React.useEffect(() => {
    if (notificationPreferences) {
      setNotificationSettings({
        enableTaskReminders: notificationPreferences.enableTaskReminders ?? true,
        enableWeeklyPlan: notificationPreferences.enableWeeklyPlan ?? true,
        enableOverbookedAlerts: notificationPreferences.enableOverbookedAlerts ?? true,
        enableBreakReminders: notificationPreferences.enableBreakReminders ?? true,
        enableFocusTimeAlerts: notificationPreferences.enableFocusTimeAlerts ?? true,
        enableUpcomingMeetings: notificationPreferences.enableUpcomingMeetings ?? true,
      });
    }
  }, [notificationPreferences]);

  const { tier: userTier } = useTier();
  const nextTier = getNextTier(userTier);
  const upgradePitch = getUpgradePitch(userTier);
  const { createPortalSession, loading: portalLoading } = useCreateBillingPortalSession();

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      // Name + timezone live on the user profile; chronotype maps to the
      // settings-level EnergyPattern. Persist both.
      await Promise.all([
        updateProfile({
          variables: {
            input: {
              name: profileSettings.name,
              timezone: profileSettings.timezone,
            },
          },
        }),
        updateSettings({
          variables: {
            input: {
              energyPattern: CHRONOTYPE_TO_ENERGY[profileSettings.chronotype] ?? 'BALANCED',
            },
          },
        }),
      ]);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notificationSettings, value: boolean) => {
    const next = { ...notificationSettings, [key]: value };
    setNotificationSettings(next);

    try {
      await updatePreferences({
        variables: {
          input: {
            [key]: value,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      // Revert on error
      setNotificationSettings({ ...notificationSettings, [key]: !value });
    }
  };

  const handleThemeChange = async (value: string) => {
    const previous = appearanceSettings.theme;
    setAppearanceSettings({ theme: value });
    // Apply immediately in the UI via next-themes.
    setTheme(value);

    try {
      await updateSettings({
        variables: {
          input: {
            theme: THEME_TO_ENUM[value] ?? 'SYSTEM',
          },
        },
      });
    } catch (error) {
      console.error('Failed to update appearance:', error);
      // Revert on error
      setAppearanceSettings({ theme: previous });
      setTheme(previous);
    }
  };

  const handleExportData = async (format: 'csv' | 'json', dataType: 'all' | 'tasks' | 'goals' | 'plans') => {
    try {
      toast.info('Preparing your data export...', {
        description: 'Your download will begin shortly',
      });

      let tasks: any[] = [];
      let goals: any[] = [];
      let plans: any[] = [];

      if (dataType === 'tasks' || dataType === 'all') {
        const { data } = await refetchTasks({
          filter: {
            dateRange: {
              start: new Date('2024-01-01T00:00:00.000Z'),
              end: new Date(),
            },
          },
          take: 500,
        });
        tasks = data?.tasks ?? [];
      }

      if (dataType === 'goals' || dataType === 'all') {
        const { data } = await apolloClient.query({
          query: operations.GET_GOALS,
          fetchPolicy: 'network-only',
        });
        goals = data?.goals ?? [];
      }

      if (dataType === 'plans' || dataType === 'all') {
        const { data } = await apolloClient.query({
          query: operations.GET_PLANS_SUMMARY,
          fetchPolicy: 'network-only',
        });
        plans = data?.plans ?? [];
      }

      if (format === 'csv') {
        if (dataType === 'tasks') {
          exportTasksToCSV(tasks);
        } else if (dataType === 'goals') {
          exportGoalsToCSV(goals);
        } else if (dataType === 'plans') {
          exportPlansToCSV(plans);
        } else {
          // Export all as separate CSV files
          exportTasksToCSV(tasks);
          exportGoalsToCSV(goals);
          exportPlansToCSV(plans);
        }
      } else {
        if (dataType === 'tasks') {
          exportTasksToJSON(tasks);
        } else if (dataType === 'goals') {
          exportGoalsToJSON(goals);
        } else if (dataType === 'plans') {
          exportPlansToJSON(plans);
        } else {
          exportAllDataToJSON({
            tasks,
            goals,
            plans,
            user: {
              id: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              name: user?.fullName,
            },
          });
        }
      }

      toast.success('Data exported successfully!', {
        description: `Your ${dataType} data has been downloaded`,
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data', {
        description: 'Please try again or contact support if the problem persists',
      });
    }
  };

  const handleGdprExport = async () => {
    setGdprExporting(true);
    try {
      toast.info('Preparing your full data export…');
      const { data } = await apolloClient.query({
        query: EXPORT_MY_DATA,
        fetchPolicy: 'network-only',
      });
      const payload = data?.exportMyData ?? {};
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `microplanner-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Full export downloaded');
    } catch (error: any) {
      console.error('GDPR export failed:', error);
      toast.error('Failed to export your data', { description: error?.message });
    } finally {
      setGdprExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      toast.info('Deleting your account...', {
        description: 'This may take a few moments',
      });

      // GDPR: delete all backend data FIRST (cascades goals/plans/tasks/etc.),
      // then remove the Clerk identity. If the backend delete fails we stop and
      // keep the Clerk account so the user can retry, avoiding an orphaned login.
      await deleteMyAccount();

      // Remove the Clerk identity
      await user?.delete();

      toast.success('Account deleted successfully', {
        description: 'We\'re sorry to see you go. You can create a new account anytime.',
      });

      // Redirect to landing page
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account', {
        description: 'Please try again or contact support if the problem persists',
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (settingsLoading && !settings && !dbUser) {
    return <PageLoader label="settings" variant="page" className="max-w-5xl mx-auto" />;
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto mp-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and chronotype preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Manage your email in Clerk settings.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronotype">Chronotype</Label>
                <Select
                  value={profileSettings.chronotype}
                  onValueChange={(value) => setProfileSettings({ ...profileSettings, chronotype: value })}
                >
                  <SelectTrigger id="chronotype">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lion">
                      Lion (Early Bird - Best: 6am-12pm)
                    </SelectItem>
                    <SelectItem value="bear">
                      Bear (Standard - Best: 10am-2pm)
                    </SelectItem>
                    <SelectItem value="wolf">
                      Wolf (Night Owl - Best: 5pm-12am)
                    </SelectItem>
                    <SelectItem value="dolphin">
                      Dolphin (Light Sleeper - Best: 3pm-9pm)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your chronotype helps optimize task scheduling for peak productivity
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={profileSettings.timezone}
                  onValueChange={(value) => setProfileSettings({ ...profileSettings, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Web push opt-in (device-level) */}
              <PushNotificationsToggle />

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind me before scheduled tasks are due
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={notificationSettings.enableTaskReminders}
                  onCheckedChange={(checked) => handleNotificationChange('enableTaskReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="break-reminders">Break Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Nudge me to take breaks between long focus sessions
                  </p>
                </div>
                <Switch
                  id="break-reminders"
                  checked={notificationSettings.enableBreakReminders}
                  onCheckedChange={(checked) => handleNotificationChange('enableBreakReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-plan">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Email me a recap of my week every Sunday evening
                  </p>
                </div>
                <Switch
                  id="weekly-plan"
                  checked={notificationSettings.enableWeeklyPlan}
                  onCheckedChange={(checked) => handleNotificationChange('enableWeeklyPlan', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="upcoming-meetings">Upcoming Meetings</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me before meetings on my connected calendar
                  </p>
                </div>
                <Switch
                  id="upcoming-meetings"
                  checked={notificationSettings.enableUpcomingMeetings}
                  onCheckedChange={(checked) => handleNotificationChange('enableUpcomingMeetings', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="overbooked-alerts">Overcommit Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Warn me when a day is scheduled beyond my capacity
                  </p>
                </div>
                <Switch
                  id="overbooked-alerts"
                  checked={notificationSettings.enableOverbookedAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('enableOverbookedAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-alerts">Focus Time Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me when a focus block is starting
                  </p>
                </div>
                <Switch
                  id="focus-alerts"
                  checked={notificationSettings.enableFocusTimeAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('enableFocusTimeAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-4">
          <CalendarSyncCard />
          <AutopilotSettings />
          <p className="text-sm text-muted-foreground">
            Manage all your integrations from the{' '}
            <a href="/integrations" className="underline">Integrations</a> page.
          </p>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how MicroPlanner looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={appearanceSettings.theme === 'light' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun className="h-5 w-5 mb-1" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={appearanceSettings.theme === 'dark' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon className="h-5 w-5 mb-1" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={appearanceSettings.theme === 'system' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => handleThemeChange('system')}
                  >
                    <Laptop className="h-5 w-5 mb-1" />
                    <span>System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Plan</div>
                    <div className="text-2xl font-bold">{formatTierLabel(userTier)}</div>
                    <div className="text-sm text-muted-foreground">{getTierPrice(userTier)}</div>
                  </div>
                  <Badge variant={userTier === 'FREE' ? 'secondary' : 'default'}>
                    {userTier}
                  </Badge>
                </div>

                {nextTier && upgradePitch && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">
                      Upgrade to {formatTierLabel(nextTier)} — {getTierPrice(nextTier)}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">{upgradePitch}</p>
                    <div className="flex flex-wrap gap-2">
                      <UpgradeButton targetTier={nextTier}>
                        Upgrade now
                      </UpgradeButton>
                      <Button variant="outline" asChild>
                        <Link href="/billing">View billing details</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {userTier !== 'FREE' && (
                  <Button
                    variant="outline"
                    className="mb-4"
                    disabled={portalLoading}
                    onClick={() => createPortalSession()}
                  >
                    {portalLoading ? 'Opening portal…' : 'Manage subscription in Stripe'}
                  </Button>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Goals</span>
                    <span className="font-medium">
                      {userTier === 'FREE' ? '5 / 5' : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calendar Sync</span>
                    <span className="font-medium">
                      {userTier === 'FREE' ? 'Not Available' : 'Enabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Model</span>
                    <span className="font-medium">
                      {userTier === 'FREE' ? 'GPT-4o Mini' : 'Claude Sonnet 3.5'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          {/* Referral program */}
          <ReferralPanel />

          {/* AI scheduling memory / overrides */}
          <AiMemoryManager />

          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Data Export</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a copy of your data in CSV or JSON format
                </p>

                <div className="space-y-4">
                  {/* Export All Data */}
                  <div className="border border-border rounded-[10px] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium">Complete Backup</h5>
                        <p className="text-sm text-muted-foreground">
                          Export all your tasks, goals, and plans
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportData('csv', 'all')}
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportData('json', 'all')}
                      >
                        Export as JSON
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleGdprExport}
                        disabled={gdprExporting}
                      >
                        {gdprExporting ? 'Exporting…' : 'Full export (GDPR)'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Full export includes your complete account record, goals, plans, tasks, and
                      linked data straight from our servers.
                    </p>
                  </div>

                  {/* Export Individual Data Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-border rounded-[10px] p-3">
                      <h6 className="font-medium text-sm mb-2">Tasks</h6>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('csv', 'tasks')}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('json', 'tasks')}
                        >
                          JSON
                        </Button>
                      </div>
                    </div>

                    <div className="border border-border rounded-[10px] p-3">
                      <h6 className="font-medium text-sm mb-2">Goals</h6>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('csv', 'goals')}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('json', 'goals')}
                        >
                          JSON
                        </Button>
                      </div>
                    </div>

                    <div className="border border-border rounded-[10px] p-3">
                      <h6 className="font-medium text-sm mb-2">Plans</h6>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('csv', 'plans')}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleExportData('json', 'plans')}
                        >
                          JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="mt-6">
          <TierGate requiredTier="PREMIUM" feature="API access">
            <ApiKeysManager />
          </TierGate>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemName="your account"
        itemType="account"
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
