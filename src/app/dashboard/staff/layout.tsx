"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Staff Layout - Checking auth...");
        console.log("🔍 Staff Layout - Current URL:", window.location.href);
        console.log("🔍 Staff Layout - Current pathname:", window.location.pathname);
        
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.log("❌ Staff Layout - Auth failed, redirecting to login");
          router.push('/login');
          return;
        }

        const { user } = await response.json();
        console.log("🔍 Staff Layout - User from API:", user);
        console.log("🔍 Staff Layout - User role:", user.role);
        
        // Check if user is staff (handle both TBB_STAFF and STAFF)
        if (user.role !== 'TBB_STAFF' && user.role !== 'STAFF') {
          console.log("❌ Staff Layout - User is not staff, role:", user.role);
          // Redirect to appropriate dashboard
          if (user.role === 'ADMIN') {
            console.log("🚀 Staff Layout - Redirecting to admin");
            router.push('/admin');
          } else if (user.role === 'CLIENT') {
            console.log("🚀 Staff Layout - Redirecting to client dashboard");
            router.push('/dashboard/client');
          } else {
            console.log("🚀 Staff Layout - Redirecting to login");
            router.push('/login');
          }
        } else {
          console.log("✅ Staff Layout - User is authorized for staff dashboard");
          console.log("✅ Staff Layout - Confirmed on staff dashboard URL:", window.location.pathname);
        }
      } catch (error) {
        console.error('❌ Staff Layout - Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
