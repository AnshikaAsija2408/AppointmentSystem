"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Client Layout - Checking auth...');
        
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.log('❌ Client Layout - Auth failed, redirecting to login');
          router.push('/login');
          return;
        }

        const { user } = await response.json();
        console.log('🔍 Client Layout - User from API:', user);
        console.log('🔍 Client Layout - User role:', user.role);
        
        // Check if user is a client
        if (user.role !== 'CLIENT') {
          console.log('❌ Client Layout - User is not client, role:', user.role);
          // Redirect to appropriate dashboard
          if (user.role === 'ADMIN') {
            console.log('🚀 Client Layout - Redirecting to admin');
            router.push('/admin/dashboard');
          } else if (user.role === 'TBB_STAFF' || user.role === 'STAFF') {
            console.log('🚀 Client Layout - Redirecting to staff dashboard');
            router.push('/dashboard/staff');
          } else {
            console.log('🚀 Client Layout - Redirecting to login');
            router.push('/login');
          }
        } else {
          console.log('✅ Client Layout - User is authorized for client dashboard');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Client Layout - Auth check failed:', error);
        router.push('/login');
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
