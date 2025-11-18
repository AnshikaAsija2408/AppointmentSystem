'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { selectAuth, logoutUser, updateUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Mail, Calendar, Shield, LogOut, ArrowLeft, Edit, Calendar as CalendarIcon, Link as LinkIcon, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [freshUserData, setFreshUserData] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUpcomingMeetings();
      fetchFreshUserData();
    }
  }, [user?.role]);

  const fetchFreshUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setFreshUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
    }
  };

  const fetchUpcomingMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const meetings = await response.json();
        // Filter for upcoming meetings (next 7 days)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const upcoming = meetings.filter((meeting: any) => {
          const meetingDate = new Date(meeting.startTime);
          return meetingDate >= now && meetingDate <= nextWeek;
        });
        
        setUpcomingMeetings(upcoming);
      }
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
    }
  };

  // Show success/error messages from OAuth flow
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'google_connected') {
      toast.success('Google Calendar connected successfully!');
      // Refresh user data to show updated connection status
      fetchFreshUserData();
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        oauth_failed: 'Google OAuth failed. Please try again.',
        missing_params: 'Missing OAuth parameters. Please try again.',
        token_exchange_failed: 'Failed to exchange OAuth tokens. Please try again.',
        callback_failed: 'OAuth callback failed. Please try again.',
      };
      toast.error(errorMessages[error] || 'An error occurred during Google OAuth.');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const handleBack = () => {
    // Navigate back based on user role
    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (user?.role === 'TBB_STAFF') {
      router.push('/staff/dashboard');
    } else {
      router.push('/client/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // TODO: Implement profile update API call
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
    }
    setIsEditing(false);
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
        setIsPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Update the user state in Redux to reflect that password change is no longer needed
        dispatch(updateUser({ needsPasswordChange: false }));
        
        // Also update fresh user data if it exists
        if (freshUserData) {
          setFreshUserData({ ...freshUserData, needsPasswordChange: false });
        }
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500 hover:bg-red-600';
      case 'TBB_STAFF': return 'bg-blue-500 hover:bg-blue-600';
      case 'CLIENT': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper to check if Google is connected (use fresh data if available)
  const isGoogleConnected = Boolean(freshUserData?.googleCalendarId || user?.googleCalendarId);

  // Check if user needs to change password (first time login)
  const needsPasswordChange = user?.needsPasswordChange || freshUserData?.needsPasswordChange;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Password Change Alert */}
        {needsPasswordChange && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>First-time login detected!</strong> Please change your password to secure your account.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    <UserCircle className="h-16 w-16 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {formatRole(user.role)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.projects && user.projects.length > 0 && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <span>Active Projects: {user.projects.length}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Change Password Button */}
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
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
                          placeholder="Enter new password"
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
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-2 bg-muted rounded-md">
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {user.role === 'ADMIN' && (
                  <>
                    <Separator />
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 space-y-4">
                      <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Google Calendar Integration
                      </h4>
                      {isGoogleConnected ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">Connected</span>
                          <span className="text-xs text-muted-foreground">(Calendar ID: {freshUserData?.googleCalendarId || user?.googleCalendarId})</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => window.location.href = '/api/auth/google'}
                        >
                          <LinkIcon className="h-4 w-4" />
                          Connect Google Calendar
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Connect your Google Calendar to enable meeting scheduling, free/busy checks, and automatic event creation.
                      </p>
                    </div>
                    <Separator />
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 mt-4">
                      <h4 className="font-medium text-secondary mb-2 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Upcoming Meetings
                      </h4>
                      <div className="space-y-2">
                        {upcomingMeetings.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No upcoming meetings found.</p>
                        ) : (
                          upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="p-3 bg-white border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{meeting.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(meeting.startTime).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </p>
                                </div>
                                {meeting.googleMeetLink && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(meeting.googleMeetLink, '_blank')}
                                  >
                                    Join
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}