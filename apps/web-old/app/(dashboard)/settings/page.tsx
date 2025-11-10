'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, Download, Trash2, Bell, Globe, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Save settings to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    toast({
      title: 'Export started',
      description: 'Your data export has been initiated. You\'ll receive an email when it\'s ready.',
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      toast({
        title: 'Account deletion',
        description: 'Account deletion will be implemented with backend integration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-dark-text-secondary mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Profile Settings
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="text-dark-text-primary mb-2 block">
                First Name
              </Label>
              <Input
                id="firstName"
                defaultValue={user?.firstName || ''}
                className="input text-white"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-dark-text-primary mb-2 block">
                Last Name
              </Label>
              <Input
                id="lastName"
                defaultValue={user?.lastName || ''}
                className="input text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-dark-text-primary mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
              className="input text-dark-text-tertiary"
            />
            <p className="text-xs text-dark-text-tertiary mt-1">
              Email cannot be changed here. Use Clerk dashboard.
            </p>
          </div>

          <div>
            <Label htmlFor="timezone" className="text-dark-text-primary mb-2 block">
              Timezone
            </Label>
            <select
              id="timezone"
              className="w-full h-10 px-3 py-2 input text-white"
            >
              <option>America/New_York (ET)</option>
              <option>America/Chicago (CT)</option>
              <option>America/Los_Angeles (PT)</option>
              <option>Europe/London (GMT)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-dark-text-secondary">
                Receive updates about your tasks and plans
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded input"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Weekly Summary</p>
              <p className="text-sm text-dark-text-secondary">
                Get a weekly summary of your progress
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded input"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Plan Reminders</p>
              <p className="text-sm text-dark-text-secondary">
                Remind me to generate my weekly plan
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded input"
            />
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6 card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-dark-text-primary mb-3 block">Theme</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-600/10'
                    : 'border-dark-border-primary input'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-white" />
                <p className="text-white font-medium">Light</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-600/10'
                    : 'border-dark-border-primary input'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-white" />
                <p className="text-white font-medium">Dark</p>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-600/10'
                    : 'border-dark-border-primary input'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2 text-white" />
                <p className="text-white font-medium">System</p>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data & Privacy (GDPR) */}
      <Card className="p-6 card">
        <h2 className="text-xl font-semibold text-white mb-6">
          Data & Privacy
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Export Your Data</p>
              <p className="text-sm text-dark-text-secondary">
                Download all your data in JSON format
              </p>
            </div>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-dark-border-primary text-white hover:bg-neutral-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="border-t border-dark-border-primary pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 font-medium">Delete Account</p>
                <p className="text-sm text-dark-text-secondary">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
