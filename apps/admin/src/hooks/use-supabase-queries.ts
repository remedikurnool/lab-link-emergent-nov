'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { handleError } from '@/lib/errors/error-handler';

// Fetch all partners
export function usePartners() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for partners
      const partnersChannel = supabase
        .channel('partners-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'partners',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['partners'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(partnersChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for partners:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch all bookings
export function useBookings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for bookings
      const bookingsChannel = supabase
        .channel('bookings-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingsChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for bookings:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          partners (
            id,
            full_name,
            partner_type
          ),
          patients (
            id,
            full_name,
            age,
            gender
          ),
          booking_items (
            id,
            item_type,
            item_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch dashboard stats
export function useDashboardStats() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscriptions for live dashboard updates
      const bookingsChannel = supabase
        .channel('dashboard-bookings-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe();

      const partnersChannel = supabase
        .channel('dashboard-partners-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'partners',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe();

      const commissionsChannel = supabase
        .channel('dashboard-commissions-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'commissions',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(partnersChannel);
        supabase.removeChannel(commissionsChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for dashboard:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch multiple stats in parallel
      const [bookingsResult, partnersResult, commissionsResult, revenueResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('total_amount, status, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

        supabase
          .from('partners')
          .select('is_active')
          .eq('is_active', true),

        supabase
          .from('commissions')
          .select('amount, status')
          .eq('status', 'pending'),

        supabase
          .from('bookings')
          .select('total_amount')
          .eq('status', 'completed'),
      ]);

      if (bookingsResult.error) {
        handleError(bookingsResult.error, { showToast: false, logError: true });
        throw bookingsResult.error;
      }

      const bookings = bookingsResult.data || [];
      const partners = partnersResult.data || [];
      const pendingCommissions = commissionsResult.data || [];
      const completedBookings = revenueResult.data || [];

      return {
        totalRevenue: completedBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0),
        activePartners: partners.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        pendingCommissions: pendingCommissions.reduce((sum, comm) => sum + parseFloat(comm.amount.toString()), 0),
        totalBookings: bookings.length,
      };
    },
  });
}

// Fetch all tests
export function useTests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for tests
      const testsChannel = supabase
        .channel('tests-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tests',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(testsChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for tests:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch all scans
export function useScans() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for scans
      const scansChannel = supabase
        .channel('scans-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scans',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['scans'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(scansChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for scans:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch all packages
export function usePackages() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for packages
      const packagesChannel = supabase
        .channel('packages-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'packages',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(packagesChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for packages:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch all diagnostic centres
export function useDiagnosticCentres() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for diagnostic centres
      const centresChannel = supabase
        .channel('centres-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'diagnostic_centres',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['diagnostic-centres'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(centresChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for centres:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['diagnostic-centres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_centres')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}

// Fetch all categories
export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for categories
      const categoriesChannel = supabase
        .channel('categories-realtime-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'categories',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(categoriesChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for categories:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }

      return data || [];
    },
  });
}
