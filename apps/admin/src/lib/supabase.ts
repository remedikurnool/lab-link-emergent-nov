import { createClient } from '@supabase/supabase-js';

// Use placeholder values if env vars are missing (for development with mock data)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're using placeholder values
const isUsingPlaceholder = 
  supabaseUrl === 'https://placeholder.supabase.co' || 
  supabaseAnonKey === 'placeholder-key';

if (isUsingPlaceholder) {
  console.warn(
    '⚠️ Supabase environment variables not set. Using placeholder values.\n' +
    'The app will use mock data. To enable Supabase integration:\n' +
    '1. Create apps/admin/.env.local\n' +
    '2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    '3. Get credentials from: https://app.supabase.com → Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-admin-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !isUsingPlaceholder;
