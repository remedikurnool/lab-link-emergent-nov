'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const GUEST_SESSION_KEY = 'lablink_guest_user';

const isGuestFlagEnabled = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(GUEST_SESSION_KEY) === 'true';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(GUEST_SESSION_KEY);
        }
      } else if (isGuestFlagEnabled()) {
        setUser(null);
        setIsGuest(true);
      } else {
        setUser(null);
        setIsGuest(false);
      }

      setLoading(false);
    };

    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(GUEST_SESSION_KEY);
        }
      } else if (isGuestFlagEnabled()) {
        setUser(null);
        setIsGuest(true);
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInAsGuest = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUEST_SESSION_KEY, 'true');
    }
    setUser(null);
    setIsGuest(true);
    setLoading(false);
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(GUEST_SESSION_KEY);
    }
    setIsGuest(false);
    setUser(null);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    signInAsGuest,
    isGuest,
    isAuthenticated: !!user || isGuest,
  };
}
