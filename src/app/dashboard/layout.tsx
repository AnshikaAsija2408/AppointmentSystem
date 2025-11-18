"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';
import PasswordChangeModal from '@/components/PasswordChangeModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector(selectAuth);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user?.needsPasswordChange) {
      setShowPasswordModal(true);
    }
  }, [user?.needsPasswordChange]);

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    // No need to reload the page anymore since we update Redux state directly
  };

  return (
    <div className="min-h-screen bg-background max-w-7xl mx-auto">
      <div className="flex">
        {/* TODO: Sidebar will be added here */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Password Change Modal for First-Time Users */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
}
