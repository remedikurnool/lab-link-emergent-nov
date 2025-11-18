'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

/**
 * Component to protect admin routes
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAdmin, loading, adminUser, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isGuest && (!user || !isAdmin)) {
      router.push('/login');
    } else if (!loading && (isAdmin || isGuest) && requiredRole) {
      // Check role if required
      if (requiredRole === 'super_admin' && adminUser?.role !== 'super_admin') {
        router.push('/?error=insufficient_permissions');
      }
    }
  }, [loading, user, isAdmin, adminUser, requiredRole, router, isGuest]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isGuest && (!user || !isAdmin)) {
    return null; // Will redirect
  }

  if (requiredRole && adminUser?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

