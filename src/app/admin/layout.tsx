"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const { user } = await response.json();
        
        // Check if user is admin
        if (user.role !== 'ADMIN') {
          // Redirect to appropriate dashboard
          if (user.role === 'CLIENT') {
            router.push('/dashboard/client');
          } else if (user.role === 'TBB_STAFF') {
            router.push('/dashboard/staff');
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
