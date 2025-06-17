import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      loading: false, // Start with false
      initialized: false,
      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      
      initialize: async () => {
        const state = get();
        if (state.initialized) {
          console.log('🔧 Auth: Already initialized, skipping');
          return;
        }
        
        console.log('🔧 Auth: Initializing...');
        set({ loading: true });
        
        try {
          await state.refreshSession();
        } catch (error) {
          console.error('❌ Auth: Initialization error:', error);
          set({ user: null, loading: false });
        } finally {
          set({ initialized: true, loading: false });
        }
      },
      
      refreshSession: async () => {
        try {
          console.log('🔄 Auth: Refreshing session...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Auth: Session error:', error);
            set({ user: null, loading: false });
            return;
          }

          if (session?.user) {
            console.log('✅ Auth: Active session found');
            
            // Fetch user profile with better error handling
            try {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profileError && profileError.code !== 'PGRST116') {
                console.error('❌ Auth: Profile fetch error:', profileError);
              }

              // If no profile exists, create one
              if (!profile) {
                console.log('ℹ️ Auth: Creating user profile...');
                const { error: createError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    first_name: session.user.user_metadata?.first_name,
                    last_name: session.user.user_metadata?.last_name,
                  });
                
                if (createError) {
                  console.error('❌ Auth: Profile creation error:', createError);
                }
              }

              set({ 
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  first_name: profile?.first_name || session.user.user_metadata?.first_name,
                  last_name: profile?.last_name || session.user.user_metadata?.last_name,
                },
                loading: false
              });
            } catch (profileErr) {
              console.error('❌ Auth: Profile handling error:', profileErr);
              // Still set user even if profile operations fail
              set({ 
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  first_name: session.user.user_metadata?.first_name,
                  last_name: session.user.user_metadata?.last_name,
                },
                loading: false
              });
            }
          } else {
            console.log('ℹ️ Auth: No active session');
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('❌ Auth: Session refresh error:', error);
          set({ user: null, loading: false });
        }
      },

      signUp: async (email: string, password: string, userData?: Partial<User>) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
            },
          });

          if (error) throw error;

          // Create user profile but DON'T set user state (don't auto-login)
          if (data.user) {
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  first_name: userData?.first_name,
                  last_name: userData?.last_name,
                });

              if (profileError) {
                console.error('❌ Auth: Profile creation error:', profileError);
                // Don't throw here, signup was successful
              }
            } catch (profileErr) {
              console.error('❌ Auth: Profile creation failed:', profileErr);
              // Continue anyway, user can be created later
            }
          }

          set({ loading: false });
          return data;
        } catch (error) {
          console.error('❌ Auth: Signup error:', error);
          set({ loading: false });
          throw error;
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ loading: false });
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password');
            }
            throw error;
          }

          // Don't manually set user here - let the auth state change handler do it
          console.log('✅ Auth: Sign in successful, waiting for auth state change');
          
          return data;
        } catch (error) {
          console.error('❌ Auth: Login error:', error);
          set({ loading: false });
          throw error;
        }
      },
      
      signInWithProvider: async (provider: 'google' | 'facebook') => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ loading: false });
            throw error;
          }
          
          return data;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          console.log('🚪 Auth: Logging out...');
          
          // Clear state first
          set({ user: null, loading: false });
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('❌ Auth: Supabase logout error:', error);
          }
          
          console.log('✅ Auth: Logout successful');
        } catch (error) {
          console.error('❌ Auth: Logout error:', error);
          // Force clear state even if there's an error
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      version: 4,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from older versions
        if (version < 4) {
          return { user: persistedState?.user || null };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.initialized = false;
        }
      }
    }
  )
);

// Single auth listener setup
let authListenerInitialized = false;

export const initializeAuth = () => {
  if (authListenerInitialized) {
    console.log('🔧 Auth: Listener already initialized');
    return;
  }
  
  authListenerInitialized = true;
  console.log('🔧 Auth: Setting up auth listener');
  
  // Initialize auth state
  useAuth.getState().initialize();
  
  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth: State change:', event, session?.user?.id);
    
    const state = useAuth.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Auth: Profile fetch error:', profileError);
        }

        // If no profile exists, create one
        if (!profile) {
          console.log('ℹ️ Auth: Creating user profile...');
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name,
              last_name: session.user.user_metadata?.last_name,
            });
          
          if (createError) {
            console.error('❌ Auth: Profile creation error:', createError);
          }
        }

        state.setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: profile?.first_name || session.user.user_metadata?.first_name,
          last_name: profile?.last_name || session.user.user_metadata?.last_name,
        });
      } catch (error) {
        console.error('❌ Auth: Error handling SIGNED_IN:', error);
        // Still set basic user info
        state.setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
        });
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 Auth: User signed out');
      state.setUser(null);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      console.log('🔄 Auth: Token refreshed');
      // Only refresh if we don't already have user data
      if (!state.user) {
        await state.refreshSession();
      }
    }
    
    state.setLoading(false);
  });
};