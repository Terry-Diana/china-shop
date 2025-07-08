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
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  initialize: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,
      error: null,

      setUser: (user) => {
        console.log('🔧 Auth: Setting user:', user?.email || 'null');
        set({ user, loading: false, error: null });
      },

      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      setError: (error) => set({ error }),

      clearAuth: () => {
        console.log('🧹 Auth: Clearing auth state');
        set({ user: null, loading: false, error: null, initialized: true });
      },
      
      initialize: async () => {
        const state = get();
        if (state.initialized) {
          console.log('🔧 Auth: Already initialized, skipping');
          return;
        }
        
        console.log('🔧 Auth: Initializing...');
        set({ loading: true, error: null });
        
        try {
          // Add timeout to prevent infinite initialization
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth initialization timeout')), 30000)
          );
          
          // Only wait for refreshSession if we have a user in state
          if (state.user) {
            await Promise.race([
              state.refreshSession(),
              timeoutPromise
            ]);
          } else {
            set({ initialized: true, loading: false });
          }
        } catch (error) {
          console.error('❌ Auth: Initialization error:', error);
          set({ user: null, loading: false, error: error instanceof Error ? error.message : 'Auth initialization failed' });
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
            throw error;
          }

          if (session?.user) {
            console.log('✅ Auth: Active session found');
            
            // Create minimal user object first
            const basicUser = {
              id: session.user.id,
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name,
              last_name: session.user.user_metadata?.last_name,
            };
            
            // Set user immediately to prevent loading state
            set({ user: basicUser, loading: false, error: null });
            
            // Then try to fetch/create profile asynchronously
            try {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profileError && profileError.code !== 'PGRST116') {
                console.warn('⚠️ Auth: Profile fetch warning:', profileError);
                // Don't throw, just use basic user data
                return;
              }

              // If no profile exists, try to create one
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
                  console.warn('⚠️ Auth: Profile creation warning:', createError);
                  // Don't throw, profile creation is not critical
                }
              } else {
                // Update with profile data
                set({ 
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    first_name: profile.first_name || session.user.user_metadata?.first_name,
                    last_name: profile.last_name || session.user.user_metadata?.last_name,
                  },
                  loading: false,
                  error: null
                });
              }
            } catch (profileErr) {
              console.warn('⚠️ Auth: Profile handling warning:', profileErr);
              // Don't throw, we already have basic user data set
            }
          } else {
            console.log('ℹ️ Auth: No active session');
            set({ user: null, loading: false, error: null });
          }
        } catch (error) {
          console.error('❌ Auth: Session refresh error:', error);
          // Clear invalid session
          await supabase.auth.signOut();
          set({ 
            user: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Session refresh failed' 
          });
        }
      },

      signUp: async (email: string, password: string, userData?: Partial<User>) => {
        try {
          set({ loading: true, error: null });
          
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

              if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
                console.warn('⚠️ Auth: Profile creation warning:', profileError);
              }
            } catch (profileErr) {
              console.warn('⚠️ Auth: Profile creation failed:', profileErr);
            }
          }

          set({ loading: false, error: null });
          return data;
        } catch (error) {
          console.error('❌ Auth: Signup error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            const errorMessage = error.message.includes('Invalid login credentials') 
              ? 'Invalid email or password' 
              : error.message;
            set({ loading: false, error: errorMessage });
            throw new Error(errorMessage);
          }

          // Don't manually set user here - let the auth state change handler do it
          console.log('✅ Auth: Sign in successful, waiting for auth state change');
          
          return data;
        } catch (error) {
          console.error('❌ Auth: Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },
      
      signInWithProvider: async (provider: 'google' | 'facebook') => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ loading: false, error: error.message });
            throw error;
          }
          
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'OAuth login failed';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          console.log('🚪 Auth: Logging out...');
          
          // Clear state immediately
          set({ user: null, loading: false, error: null });
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.warn('⚠️ Auth: Supabase logout warning:', error);
            // Don't throw, local state is already cleared
          }
          
          console.log('✅ Auth: Logout successful');
        } catch (error) {
          console.error('❌ Auth: Logout error:', error);
          // Force clear state even if there's an error
          set({ user: null, loading: false, error: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        // Don't persist loading, initialized, or error states
      }),
      version: 6, // Incremented version
      migrate: (persistedState: any, version: number) => {
        // Clear old state on version mismatch to prevent issues
        if (version < 6) {
          console.log('🔄 Auth: Migrating auth state, clearing old data');
          return { user: null };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset runtime state after rehydration
          state.loading = false;
          state.initialized = false;
          state.error = null;
          console.log('🔄 Auth: State rehydrated:', state.user?.email || 'no user');
        }
      }
    }
  )
);

// Single auth listener setup with better error handling
let authListenerInitialized = false;
let authStateChangeSubscription: any = null;

export const initializeAuth = () => {
  if (authListenerInitialized) {
    console.log('🔧 Auth: Listener already initialized');
    return;
  }
  
  authListenerInitialized = true;
  console.log('🔧 Auth: Setting up auth listener');
  
  // Initialize auth state
  useAuth.getState().initialize();
  
  // Clean up any existing subscription
  if (authStateChangeSubscription) {
    authStateChangeSubscription.subscription?.unsubscribe();
  }
  
  // Set up auth state change listener
  authStateChangeSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth: State change:', event, session?.user?.id);
    
    const state = useAuth.getState();
    
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        // Create basic user object immediately
        const basicUser = {
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
        };
        
        state.setUser(basicUser);
        
        // Fetch profile asynchronously without blocking
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              console.warn('⚠️ Auth: Profile fetch warning:', profileError);
              return;
            }

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
              
              if (createError && createError.code !== '23505') {
                console.warn('⚠️ Auth: Profile creation warning:', createError);
              }
            } else {
              // Update with full profile data
              state.setUser({
                id: session.user.id,
                email: session.user.email!,
                first_name: profile.first_name || session.user.user_metadata?.first_name,
                last_name: profile.last_name || session.user.user_metadata?.last_name,
              });
            }
          } catch (error) {
            console.warn('⚠️ Auth: Profile handling warning:', error);
          }
        }, 100);
        
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Auth: User signed out');
        state.clearAuth();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Auth: Token refreshed');
        // Only refresh if we don't already have user data
        if (!state.user || state.user.id !== session.user.id) {
          await state.refreshSession();
        }
      }
    } catch (error) {
      console.error('❌ Auth: Error in auth state change handler:', error);
      state.setError(error instanceof Error ? error.message : 'Auth state change error');
    }
    
    state.setLoading(false);
  });
};

// Cleanup function
export const cleanupAuth = () => {
  if (authStateChangeSubscription) {
    authStateChangeSubscription.subscription?.unsubscribe();
    authStateChangeSubscription = null;
  }
  authListenerInitialized = false;
};