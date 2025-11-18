'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
}

const ADMIN_GUEST_KEY = 'lablink_admin_guest';

const isGuestModeEnabled = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(ADMIN_GUEST_KEY) === 'true';

const createGuestAdminProfile = (): AdminUser => ({
  id: 'guest-admin',
  email: 'guest@lablink.dev',
  role: 'admin',
  created_at: new Date().toISOString(),
});

/**
 * Hook for admin authentication
 */
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    adminUser: null,
    loading: true,
    isAdmin: false,
    isGuest: false,
  });

  useEffect(() => {
    // Check current session
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkAdminStatus(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ADMIN_GUEST_KEY);
        }
        if (isGuestModeEnabled()) {
          setAuthState({
            user: null,
            adminUser: createGuestAdminProfile(),
            loading: false,
            isAdmin: true,
            isGuest: true,
          });
        } else {
          setAuthState({
            user: null,
            adminUser: null,
            loading: false,
            isAdmin: false,
            isGuest: false,
          });
          router.push('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const checkSession = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ADMIN_GUEST_KEY);
        }
        await checkAdminStatus(user);
      } else if (isGuestModeEnabled()) {
        setAuthState({
          user: null,
          adminUser: createGuestAdminProfile(),
          loading: false,
          isAdmin: true,
          isGuest: true,
        });
      } else {
        setAuthState({
          user: null,
          adminUser: null,
          loading: false,
          isAdmin: false,
          isGuest: false,
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState({
        user: null,
        adminUser: null,
        loading: false,
        isAdmin: false,
        isGuest: false,
      });
    }
  };

  const checkAdminStatus = async (user: User, retryCount = 0) => {
    try {
      // Ensure session is established - wait a bit if this is the first check after sign-in
      if (retryCount === 0) {
        // Wait for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No valid session:', sessionError);
        if (retryCount < 2) {
          // Retry after a short delay
          await new Promise(resolve => setTimeout(resolve, 500));
          return checkAdminStatus(user, retryCount + 1);
        }
      }

      // Check if user is an admin
      // Option 1: Check user metadata
      const userRole = user.user_metadata?.role;
      
      // Option 2: Check admin_users table
      // Use .maybeSingle() to handle not found gracefully
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Log for debugging
      console.log('Admin check result:', {
        user_id: user.id,
        email: user.email,
        adminData,
        adminError,
        userRole,
        retryCount,
      });

      // If we got an RLS error and have retries left, try again
      if (adminError && adminError.code === '42501' && retryCount < 2) {
        console.log('RLS error, retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return checkAdminStatus(user, retryCount + 1);
      }

      // Check if user is admin via table OR metadata (including raw_user_meta_data)
      const rawMetadata = (user as any).raw_user_meta_data || {};
      const hasAdminMetadata = rawMetadata.role === 'admin' || rawMetadata.role === 'super_admin' || rawMetadata.admin === true;
      
      const isAdmin = 
        adminData !== null ||
        userRole === 'admin' || 
        userRole === 'super_admin' ||
        hasAdminMetadata;

      if (isAdmin) {
        // Use adminData if available, otherwise create from metadata
        const adminUser: AdminUser = adminData || {
          id: user.id,
          email: user.email || '',
          role: (userRole as 'admin' | 'super_admin') || 'admin',
          created_at: user.created_at,
        };

        console.log('User is admin:', adminUser);

        setAuthState({
          user,
          adminUser,
          loading: false,
          isAdmin: true,
          isGuest: false,
        });
      } else {
        // User is not an admin
        console.warn('User is not an admin:', {
          email: user.email,
          adminData,
          adminError,
          userRole,
        });
        setAuthState({
          user,
          adminUser: null,
          loading: false,
          isAdmin: false,
          isGuest: false,
        });
        // Sign out non-admin users
        await supabase.auth.signOut();
        router.push('/login?error=unauthorized');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      
      // Retry on error if we haven't exhausted retries
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return checkAdminStatus(user, retryCount + 1);
      }

      setAuthState({
        user,
        adminUser: null,
        loading: false,
        isAdmin: false,
        isGuest: false,
      });
      // Don't sign out on error - might be a temporary issue
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return {
          success: false,
          error: error.message || 'Invalid email or password',
        };
      }

      if (!data.user) {
        console.error('No user data received');
        return { success: false, error: 'Login failed - no user data received' };
      }

      console.log('Sign in successful, checking admin status...', {
        user_id: data.user.id,
        email: data.user.email,
        session: data.session?.access_token ? 'Session exists' : 'No session',
      });

      // Ensure session is set in the client
      if (data.session) {
        // The session should already be set by signInWithPassword, but verify
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession && data.session) {
          // Manually set the session if needed
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }
      }

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check admin status with retry logic
      await checkAdminStatus(data.user);

      // Give state a moment to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Double-check admin status directly with retries
      let adminCheck = null;
      let adminCheckError = null;
      let retries = 0;
      const maxRetries = 3;
      const userId = data.user.id; // Store user ID to avoid variable conflict

      while (retries < maxRetries && !adminCheck) {
        const { data: adminData, error: adminErr } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        adminCheck = adminData;
        adminCheckError = adminErr;

        if (adminData) {
          break; // Found the admin record
        }

        if (adminErr && adminErr.code !== 'PGRST116') {
          // PGRST116 is "not found" which is fine, but other errors might be RLS
          console.log(`Admin check attempt ${retries + 1} failed:`, adminErr);
          if (retries < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          break; // Not found or no error
        }

        retries++;
      }

      console.log('Direct admin check:', {
        adminCheck,
        adminCheckError,
        user_id: userId,
        retries,
      });

      // Check user metadata as fallback
      const userRole = data.user.user_metadata?.role;
      
      // Final admin check: table OR metadata (including raw_user_meta_data)
      const rawMetadata = (data.user as any).raw_user_meta_data || {};
      const hasAdminMetadata = rawMetadata.role === 'admin' || rawMetadata.role === 'super_admin' || rawMetadata.admin === true;
      
      const isActuallyAdmin = 
        adminCheck !== null || 
        userRole === 'admin' || 
        userRole === 'super_admin' ||
        hasAdminMetadata;

      if (!isActuallyAdmin) {
        console.warn('User is not an admin:', {
          email: data.user.email,
          user_id: data.user.id,
          adminCheck,
          adminCheckError,
          userRole,
        });
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'You do not have admin access. Please contact your administrator.',
        };
      }

      console.log('Admin access confirmed, login successful');
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in. Please try again.',
      };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ADMIN_GUEST_KEY);
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setAuthState({
        user: null,
        adminUser: null,
        loading: false,
        isAdmin: false,
        isGuest: false,
      });
      
      router.push('/login');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  };

  const signInAsGuest = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_GUEST_KEY, 'true');
    }
    setAuthState({
      user: null,
      adminUser: createGuestAdminProfile(),
      loading: false,
      isAdmin: true,
      isGuest: true,
    });
    router.push('/');
  };

  return {
    ...authState,
    signIn,
    signInAsGuest,
    signOut,
    refresh: checkSession,
  };
}

