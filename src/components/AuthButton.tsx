'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { selectAuth, logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/index';

export default function AuthButton() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(selectAuth);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <Button onClick={handleLogin} variant="default" size="sm">
        <User className="mr-2 h-4 w-4" />
        Login
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        Welcome, {user.name}
      </span>
      <Button onClick={handleLogout} variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
