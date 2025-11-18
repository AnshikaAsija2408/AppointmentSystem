"use client";

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { updateUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onPasswordChanged: () => void;
}

export default function PasswordChangeModal({ isOpen, onPasswordChanged }: PasswordChangeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Update the user state in Redux to reflect that password change is no longer needed
        dispatch(updateUser({ needsPasswordChange: false }));
        
        onPasswordChanged();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Your Password
          </DialogTitle>
          <DialogDescription>
            This is your first login. Please change your temporary password to secure your account.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Security Notice:</strong> You must change your password before continuing.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password (Temporary)</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your temporary password"
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <Button 
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full"
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 