'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUserSettings, useUpdateUserSettings, useTasks, useGoals, usePlans, useConnectCalendar } from '@/hooks/use-graphql';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { UpgradeButton } from '@/components/upgrade-button';
import {
  exportTasksToCSV,
  exportGoalsToCSV,
  exportPlansToCSV,
  exportTasksToJSON,
  exportGoalsToJSON,
  exportPlansToJSON,
  exportAllDataToJSON,
} from '@/lib/export';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('profile');

  React.useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // Fetch user settings from GraphQL
  const { settings, loading: settingsLoading } = useUserSettings();
  const { updateSettings } = useUpdateUserSettings();
  const { connectCalendar } = useConnectCalendar();

  // Fetch data for export
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { plans } = usePlans();

  // Local state for settings (synced with GraphQL)
  const [profileSettings, setProfileSettings] = React.useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    chronotype: settings?.chronotype || 'lion',
    timezone: settings?.timezone || 'America/New_York',
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: settings?.notifications?.email ?? true,
    pushNotifications: settings?.notifications?.push ?? true,
    weeklyPlanReminder: settings?.notifications?.weeklyPlan ?? true,
    dailyTaskReminder: settings?.notifications?.dailyTask ?? true,
    goalMilestones: settings?.notifications?.goalMilestones ?? true,
  });

  const [appearanceSettings, setAppearanceSettings] = React.useState({
    theme: settings?.appearance?.theme || 'system',
    compactMode: settings?.appearance?.compactMode ?? false,
  });

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setProfileSettings({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        chronotype: settings.chronotype || 'lion',
        timezone: settings.timezone || 'America/New_York',
      });
      setNotificationSettings({
        emailNotifications: settings.notifications?.email ?? true,
        pushNotifications: settings.notifications?.push ?? true,
        weeklyPlanReminder: settings.notifications?.weeklyPlan ?? true,
        dailyTaskReminder: settings.notifications?.dailyTask ?? true,
        goalMilestones: settings.notifications?.goalMilestones ?? true,
      });
      setAppearanceSettings({
        theme: settings.appearance?.theme || 'system',
        compactMode: settings.appearance?.compactMode ?? false,
      });
    }
  }, [settings, user]);

  const userTier = (user?.publicMetadata?.tier as string) || 'FREE';

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      await updateSettings({
        variables: {
          input: {
            chronotype: profileSettings.chronotype,
            timezone: profileSettings.timezone,
          },
        },
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [key]: value });

    try {
      await updateSettings({
        variables: {
          input: {
            notifications: {
              ...notificationSettings,
              [key]: value,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      // Revert on error
      setNotificationSettings({ ...notificationSettings, [key]: !value });
    }
  };

  const handleAppearanceChange = async (key: keyof typeof appearanceSettings, value: any) => {
    setAppearanceSettings({ ...appearanceSettings, [key]: value });

    try {
      await updateSettings({
        variables: {
          input: {
            appearance: {
              ...appearanceSettings,
              [key]: value,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to update appearance:', error);
      // Revert on error
      setAppearanceSettings({ ...appearanceSettings, [key]: value });
    }
  };

  const handleExportData = async (format: 'csv' | 'json', dataType: 'all' | 'tasks' | 'goals' | 'plans') => {
    try {
      toast.info('Preparing your data export...', {
        description: 'Your download will begin shortly',
      });

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

  const handleConnectCalendar = async (provider: string) => {
    try {
      await connectCalendar({
        variables: {
          provider,
        },
      });
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.info('Deleting your account...', {
        description: 'This may take a few moments',
      });

      // Delete account using Clerk
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
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
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
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your tasks and goals
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your devices
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-plan">Weekly Plan Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind me to generate my weekly plan every Sunday
                  </p>
                </div>
                <Switch
                  id="weekly-plan"
                  checked={notificationSettings.weeklyPlanReminder}
                  onCheckedChange={(checked) => handleNotificationChange('weeklyPlanReminder', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-task">Daily Task Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary of upcoming tasks at 8am
                  </p>
                </div>
                <Switch
                  id="daily-task"
                  checked={notificationSettings.dailyTaskReminder}
                  onCheckedChange={(checked) => handleNotificationChange('dailyTaskReminder', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-milestones">Goal Milestones</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate when you reach goal milestones
                  </p>
                </div>
                <Switch
                  id="goal-milestones"
                  checked={notificationSettings.goalMilestones}
                  onCheckedChange={(checked) => handleNotificationChange('goalMilestones', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integrations</CardTitle>
              <CardDescription>
                Connect your calendars to sync tasks and events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    G
                  </div>
                  <div>
                    <div className="font-medium">Google Calendar</div>
                    <div className="text-sm text-muted-foreground">
                      Sync your MicroPlanner tasks with Google Calendar
                    </div>
                  </div>
                </div>
                {userTier === 'FREE' ? (
                  <Badge variant="secondary">PRO Feature</Badge>
                ) : (
                  <Button onClick={() => handleConnectCalendar('Google Calendar')}>Connect</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    O
                  </div>
                  <div>
                    <div className="font-medium">Outlook Calendar</div>
                    <div className="text-sm text-muted-foreground">
                      Sync your MicroPlanner tasks with Outlook
                    </div>
                  </div>
                </div>
                {userTier === 'FREE' ? (
                  <Badge variant="secondary">PRO Feature</Badge>
                ) : (
                  <Button onClick={() => handleConnectCalendar('Outlook Calendar')}>Connect</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                    iC
                  </div>
                  <div>
                    <div className="font-medium">Apple Calendar (iCal)</div>
                    <div className="text-sm text-muted-foreground">
                      Export tasks to Apple Calendar via iCal feed
                    </div>
                  </div>
                </div>
                {userTier === 'FREE' ? (
                  <Badge variant="secondary">PRO Feature</Badge>
                ) : (
                  <Button variant="outline">Get iCal URL</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
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
                    onClick={() => handleAppearanceChange('theme', 'light')}
                  >
                    <Sun className="h-5 w-5 mb-1" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={appearanceSettings.theme === 'dark' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => handleAppearanceChange('theme', 'dark')}
                  >
                    <Moon className="h-5 w-5 mb-1" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={appearanceSettings.theme === 'system' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => handleAppearanceChange('theme', 'system')}
                  >
                    <Laptop className="h-5 w-5 mb-1" />
                    <span>System</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use denser spacing throughout the app
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={appearanceSettings.compactMode}
                  onCheckedChange={(checked) => handleAppearanceChange('compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card>
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
                    <div className="text-2xl font-bold">{userTier}</div>
                  </div>
                  <Badge variant={userTier === 'FREE' ? 'secondary' : 'default'}>
                    {userTier}
                  </Badge>
                </div>

                {userTier === 'FREE' && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">Upgrade to PRO</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlock unlimited goals, calendar sync, AI-powered insights, and more!
                    </p>
                    <UpgradeButton targetTier="STARTER">View Plans</UpgradeButton>
                  </div>
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
        <TabsContent value="privacy" className="mt-6">
          <Card>
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
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium">Complete Backup</h5>
                        <p className="text-sm text-muted-foreground">
                          Export all your tasks, goals, and plans
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                    </div>
                  </div>

                  {/* Export Individual Data Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border rounded-lg p-3">
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

                    <div className="border rounded-lg p-3">
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

                    <div className="border rounded-lg p-3">
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
