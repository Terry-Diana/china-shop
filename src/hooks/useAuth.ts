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
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true, // Start with false to prevent infinite loading
      
      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
      
      refreshSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session refresh error:', error);
            set({ user: null, loading: false });
            return;
          }

          if (session?.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({ 
              user: {
                id: session.user.id,
                email: session.user.email!,
                first_name: profile?.first_name || session.user.user_metadata?.first_name,
                last_name: profile?.last_name || session.user.user_metadata?.last_name,
              },
              loading: false
            });
          } else {
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          set({ user: null, loading: false });
        }
      },

      signUp: async (email: string, password: string, userData?: Partial<User>) => {
        try {
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
                console.error('Profile creation error:', profileError);
                // Don't throw here, signup was successful
              }
            } catch (profileErr) {
              console.error('Profile creation failed:', profileErr);
              // Continue anyway, user can be created later
            }
          }

          return data;
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password');
            }
            throw error;
          }

          if (data.user) {
            // Fetch user profile
            let profile = null;
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile fetch error:', profileError);
              } else {
                profile = profileData;
              }
            } catch (profileErr) {
              console.error('Profile fetch failed:', profileErr);
            }

            // If no profile exists, create one
            if (!profile) {
              try {
                const { error: createError } = await supabase
                  .from('users')
                  .insert({
                    id: data.user.id,
                    email: data.user.email!,
                    first_name: data.user.user_metadata?.first_name,
                    last_name: data.user.user_metadata?.last_name,
                  });
                
                if (createError) {
                  console.error('Profile creation error:', createError);
                }
              } catch (createErr) {
                console.error('Profile creation failed:', createErr);
              }
            }

            // Set user state
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                first_name: profile?.first_name || data.user.user_metadata?.first_name,
                last_name: profile?.last_name || data.user.user_metadata?.last_name,
              },
              loading: false
            });
          }

          return data;
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      
      signInWithProvider: async (provider: 'google' | 'facebook') => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        return data;
      },
      
      logout: async () => {
        try {
          // Clear state first
          set({ user: null, loading: false });
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Supabase logout error:', error);
          }
          
        } catch (error) {
          console.error('Logout error:', error);
          // Force clear state even if there's an error
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from older versions
        if (version === 0 || version === 1 || version === 2) {
          return persistedState;
        }
        // For unknown versions, return a clean state
        return { user: null };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      }
    }
  )
);

// Initialize auth state with session refresh
let authInitialized = false;

const initializeAuth = async () => {
  if (authInitialized) return;
  authInitialized = true;
  
  console.log('🔧 Auth: Initializing auth state');
  
  // Set loading to false initially to prevent infinite loading
  useAuth.getState().setLoading(false);
  
  // Refresh session on initialization
  try {
    await useAuth.getState().refreshSession();
  } catch (error) {
    console.error('Error during auth initialization:', error);
    useAuth.getState().setLoading(false);
  }
};

// Initialize auth and set up auth listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session?.user?.id);
  
  if (session?.user && event === 'SIGNED_IN') {
    try {
      // Fetch user profile
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        } else {
          profile = profileData;
        }
      } catch (profileErr) {
        console.error('Profile fetch failed:', profileErr);
      }

      // If no profile exists, create one
      if (!profile) {
        try {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name,
              last_name: session.user.user_metadata?.last_name,
            });
          
          if (createError) {
            console.error('Profile creation error:', createError);
          }
        } catch (createErr) {
          console.error('Profile creation failed:', createErr);
        }
      }

      useAuth.getState().setUser({
        id: session.user.id,
        email: session.user.email!,
        first_name: profile?.first_name || session.user.user_metadata?.first_name,
        last_name: profile?.last_name || session.user.user_metadata?.last_name,
      });
    } catch (error) {
      console.error('Error handling auth state change:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    useAuth.getState().setUser(null);
  } else if (event === 'TOKEN_REFRESHED') {
    // Refresh user data when token is refreshed
    await useAuth.getState().refreshSession();
  }
  
  useAuth.getState().setLoading(false);
});

// Initialize auth immediately
initializeAuth();