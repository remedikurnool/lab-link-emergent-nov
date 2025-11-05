'use client';

import { useTests } from '@/hooks/use-supabase-queries';
import { testsWithCentres as mockTests } from '@/lib/data/mockDataWithCentres';

export function useTestsData() {
  const { data, isLoading, error } = useTests();
  
  // If Supabase tables don't exist yet, use mock data
  if (error) {
    console.log('Using mock data - Supabase tables not set up yet');
    return { data: mockTests, isLoading: false, error: null, isUsingMockData: true };
  }
  
  // If no data from Supabase, use mock data as fallback
  if (!isLoading && (!data || data.length === 0)) {
    console.log('No Supabase data found, using mock data');
    return { data: mockTests, isLoading: false, error: null, isUsingMockData: true };
  }
  
  return { data: data || [], isLoading, error, isUsingMockData: false };
}
