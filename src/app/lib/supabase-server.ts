import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../../types/supabse';

// Helper function to create a Supabase client with async cookie handling
export const createClient = () => {
  // Create a lazy promise for cookies that will be awaited when needed
  const cookieStorePromise = cookies();
  
  // Create a wrapper that handles async cookie operations
  const cookieHandler = {
    async getAll() {
      const cookieStore = await cookieStorePromise;
      return cookieStore.getAll();
    },
    async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      try {
        const cookieStore = await cookieStorePromise;
        for (const { name, value, options } of cookiesToSet) {
          await cookieStore.set(name, value, options);
        }
      } catch (error) {
        // Handle error silently
      }
    },
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieHandler,
    }
  );
};

// Alias for backward compatibility
export const getSupabaseClient = createClient;

export const getSession = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUser = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const requireAuth = async () => {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
};

// Helper function for database operations
export const getSupabaseForServer = async () => {
  return createClient();
};