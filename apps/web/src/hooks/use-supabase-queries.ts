'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/errors/error-handler';

// Fetch all tests with centre pricing
export function useTests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for tests
      const testsChannel = supabase
        .channel('tests-realtime-frontend')
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

      // Set up real-time subscription for centre_pricing
      const pricingChannel = supabase
        .channel('tests-pricing-realtime-frontend')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'centre_pricing',
            filter: 'item_type=eq.test',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(testsChannel);
        supabase.removeChannel(pricingChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for tests:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      // Fetch tests with categories
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select(`
          *,
          categories (
            id,
            name,
            image_url
          )
        `)
        .eq('is_active', true);

      if (testsError) {
        handleError(testsError, { showToast: false, logError: true });
        throw testsError;
      }

      // Fetch all centre pricing for tests
      const { data: pricing, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(
            id,
            name,
            city,
            rating
          )
        `)
        .eq('item_type', 'test')
        .eq('is_active', true);

      if (pricingError) {
        handleError(pricingError, { showToast: false, logError: true });
        throw pricingError;
      }

      // Combine tests with their centre pricing
      const testsWithCentres = tests?.map((test) => {
        const centres = pricing
          ?.filter((p) => p.item_id === test.id)
          .map((p) => ({
            centreId: p.centre_id,
            centreName: p.diagnostic_centres?.name || '',
            price: parseFloat(p.price),
            originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
            discount: p.discount,
            reportDeliveryTime: p.report_delivery_time,
            homeCollection: p.home_collection,
          })) || [];

        return {
          id: test.id,
          name: test.name,
          description: test.description,
          category: test.category,
          categoryId: test.category_id,
          categoryName: test.categories?.name || test.category,
          categoryImage: test.categories?.image_url,
          sampleType: test.sample_type,
          testsIncluded: test.tests_included,
          parameters: test.parameters,
          preparationInstructions: test.preparation_instructions,
          centres,
        };
      }) || [];

      return testsWithCentres;
    },
  });
}

// Fetch all scans with centre pricing
export function useScans() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for scans
      const scansChannel = supabase
        .channel('scans-realtime-frontend')
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

      // Set up real-time subscription for centre_pricing
      const pricingChannel = supabase
        .channel('scans-pricing-realtime-frontend')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'centre_pricing',
            filter: 'item_type=eq.scan',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['scans'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(scansChannel);
        supabase.removeChannel(pricingChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for scans:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select(`
          *,
          categories (
            id,
            name,
            image_url
          )
        `)
        .eq('is_active', true);

      if (scansError) {
        handleError(scansError, { showToast: false, logError: true });
        throw scansError;
      }

      const { data: pricing, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(
            id,
            name
          )
        `)
        .eq('item_type', 'scan')
        .eq('is_active', true);

      if (pricingError) {
        handleError(pricingError, { showToast: false, logError: true });
        throw pricingError;
      }

      const scansWithCentres = scans?.map((scan) => {
        const centres = pricing
          ?.filter((p) => p.item_id === scan.id)
          .map((p) => ({
            centreId: p.centre_id,
            centreName: p.diagnostic_centres?.name || '',
            price: parseFloat(p.price),
            originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
            discount: p.discount,
            reportDeliveryTime: p.report_delivery_time,
            homeCollection: p.home_collection,
          })) || [];

        return {
          id: scan.id,
          name: scan.name,
          description: scan.description,
          category: scan.category,
          categoryId: scan.category_id,
          categoryName: scan.categories?.name || scan.category,
          categoryImage: scan.categories?.image_url,
          preparationInstructions: scan.preparation_instructions,
          centres,
        };
      }) || [];

      return scansWithCentres;
    },
  });
}

// Fetch all packages with centre pricing
export function usePackages() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up subscriptions if Supabase is configured
    if (!supabase) return;

    try {
      // Set up real-time subscription for packages
      const packagesChannel = supabase
        .channel('packages-realtime-frontend')
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

      // Set up real-time subscription for centre_pricing
      const pricingChannel = supabase
        .channel('packages-pricing-realtime-frontend')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'centre_pricing',
            filter: 'item_type=eq.package',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(packagesChannel);
        supabase.removeChannel(pricingChannel);
      };
    } catch (error) {
      console.warn('Failed to set up real-time subscriptions for packages:', error);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          categories (
            id,
            name,
            image_url
          )
        `)
        .eq('is_active', true);

      if (packagesError) {
        handleError(packagesError, { showToast: false, logError: true });
        throw packagesError;
      }

      const { data: pricing, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(
            id,
            name
          )
        `)
        .eq('item_type', 'package')
        .eq('is_active', true);

      if (pricingError) {
        handleError(pricingError, { showToast: false, logError: true });
        throw pricingError;
      }

      const packagesWithCentres = packages?.map((pkg) => {
        const centres = pricing
          ?.filter((p) => p.item_id === pkg.id)
          .map((p) => ({
            centreId: p.centre_id,
            centreName: p.diagnostic_centres?.name || '',
            price: parseFloat(p.price),
            originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
            discount: p.discount,
            reportDeliveryTime: p.report_delivery_time,
            homeCollection: p.home_collection,
          })) || [];

        return {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          categoryId: pkg.category_id,
          categoryName: pkg.categories?.name,
          categoryImage: pkg.categories?.image_url,
          testsIncluded: pkg.tests_included,
          includedTests: pkg.included_tests,
          popular: pkg.popular,
          centres,
        };
      }) || [];

      return packagesWithCentres;
    },
  });
}

// Fetch diagnostic centres
export function useDiagnosticCentres() {
  return useQuery({
    queryKey: ['diagnostic-centres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_centres')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }
      return data;
    },
  });
}

// Fetch partner profile
export function usePartnerProfile() {
  return useQuery({
    queryKey: ['partner-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }
      return data;
    },
  });
}

// Fetch partner bookings
export function usePartnerBookings() {
  return useQuery({
    queryKey: ['partner-bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      // Get partner ID
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!partner) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }
      return data;
    },
  });
}

// Fetch partner commissions
export function usePartnerCommissions() {
  return useQuery({
    queryKey: ['partner-commissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!partner) return [];

      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, { showToast: false, logError: true });
        throw error;
      }
      return data;
    },
  });
}
