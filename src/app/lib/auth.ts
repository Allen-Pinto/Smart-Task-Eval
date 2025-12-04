import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../../types/supabse';

export const createClient = () => {
  // IMPORTANT: cookies() returns a Promise in Next.js 15
  const cookieStorePromise = cookies();
  
  return {
    auth: {
      getUser: async () => {
        const cookieStore = await cookieStorePromise;
        
        const supabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              async getAll() {
                const allCookies = await cookieStore.getAll();
                return allCookies;
              },
              async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                try {
                  for (const { name, value, options } of cookiesToSet) {
                    await cookieStore.set(name, value, options);
                  }
                } catch {
                }
              },
            },
          }
        );
        
        return await supabase.auth.getUser();
      },
      
      getSession: async () => {
        const cookieStore = await cookieStorePromise;
        
        const supabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              async getAll() {
                const allCookies = await cookieStore.getAll();
                return allCookies;
              },
              async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                try {
                  for (const { name, value, options } of cookiesToSet) {
                    await cookieStore.set(name, value, options);
                  }
                } catch {
                }
              },
            },
          }
        );
        
        return await supabase.auth.getSession();
      },
      
      exchangeCodeForSession: async (code: string) => {
        const cookieStore = await cookieStorePromise;
        
        const supabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              async getAll() {
                const allCookies = await cookieStore.getAll();
                return allCookies;
              },
              async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                try {
                  for (const { name, value, options } of cookiesToSet) {
                    await cookieStore.set(name, value, options);
                  }
                } catch {
                  // Server component handling
                }
              },
            },
          }
        );
        
        return await supabase.auth.exchangeCodeForSession(code);
      },
      
      signOut: async () => {
        const cookieStore = await cookieStorePromise;
        
        const supabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              async getAll() {
                const allCookies = await cookieStore.getAll();
                return allCookies;
              },
              async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                try {
                  for (const { name, value, options } of cookiesToSet) {
                    await cookieStore.set(name, value, options);
                  }
                } catch {
                  // Server component handling
                }
              },
            },
          }
        );
        
        return await supabase.auth.signOut();
      }
    },
    
    // Add other Supabase methods as needed
    from: (table: string) => {
      return {
        select: async (columns?: string) => {
          const cookieStore = await cookieStorePromise;
          
          const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                async getAll() {
                  const allCookies = await cookieStore.getAll();
                  return allCookies;
                },
                async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                  try {
                    for (const { name, value, options } of cookiesToSet) {
                      await cookieStore.set(name, value, options);
                    }
                  } catch {
                    // Server component handling
                  }
                },
              },
            }
          );
          
          return supabase.from(table).select(columns);
        },
        
        insert: async (data: any) => {
          const cookieStore = await cookieStorePromise;
          
          const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                async getAll() {
                  const allCookies = await cookieStore.getAll();
                  return allCookies;
                },
                async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                  try {
                    for (const { name, value, options } of cookiesToSet) {
                      await cookieStore.set(name, value, options);
                    }
                  } catch {
                    // Server component handling
                  }
                },
              },
            }
          );
          
          return supabase.from(table).insert(data);
        },
        
        update: async (data: any) => {
          const cookieStore = await cookieStorePromise;
          
          const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                async getAll() {
                  const allCookies = await cookieStore.getAll();
                  return allCookies;
                },
                async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                  try {
                    for (const { name, value, options } of cookiesToSet) {
                      await cookieStore.set(name, value, options);
                    }
                  } catch {
                    // Server component handling
                  }
                },
              },
            }
          );
          
          return supabase.from(table).update(data);
        },
        
        eq: (column: string, value: any) => {
          return {
            single: async () => {
              const cookieStore = await cookieStorePromise;
              
              const supabase = createServerClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                  cookies: {
                    async getAll() {
                      const allCookies = await cookieStore.getAll();
                      return allCookies;
                    },
                    async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                      try {
                        for (const { name, value, options } of cookiesToSet) {
                          await cookieStore.set(name, value, options);
                        }
                      } catch {
                        // Server component handling
                      }
                    },
                  },
                }
              );
              
              return supabase.from(table).select().eq(column, value).single();
            }
          };
        }
      };
    }
  };
};

// Simplified versions for common use cases
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