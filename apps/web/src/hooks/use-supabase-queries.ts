'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

// Fetch all tests with centre pricing
export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      // Fetch tests
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true);

      if (testsError) throw testsError;

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

      if (pricingError) throw pricingError;

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
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data: scans, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('is_active', true);

      if (scansError) throw scansError;

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

      if (pricingError) throw pricingError;

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
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true);

      if (packagesError) throw packagesError;

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

      if (pricingError) throw pricingError;

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

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
      return data;
    },
  });
}
