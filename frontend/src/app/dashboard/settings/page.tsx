'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/dashboard/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-white/60 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Section */}
        <Card variant="glass" className="card-hover">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                type="text"
                value={user?.full_name || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Account Created</label>
              <Input
                type="text"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card variant="glass" className="card-hover">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter your new password (min 8 characters)"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                />
              </div>

              {passwordError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                  {passwordSuccess}
                </div>
              )}

              <Button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full gradient-pink"
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card variant="glass" className="card-hover">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
