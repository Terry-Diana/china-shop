import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AuthState {
  user: User | null;
  admin: Admin | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setAdmin: (admin: Admin | null) => void;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      admin: null,
      loading: true,
      setUser: (user) => set({ user }),
      setAdmin: (admin) => set({ admin }),
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
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
              // Create profile if it doesn't exist
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
            }

            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                first_name: profile?.first_name || data.user.user_metadata?.first_name,
                last_name: profile?.last_name || data.user.user_metadata?.last_name,
              }
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
          set({ user: null, admin: null });
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Supabase logout error:', error);
          }
          
          // Clear all storage
          localStorage.clear();
          sessionStorage.clear();
          
          // Force reload to ensure clean state
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
          // Force reload even if there's an error
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session?.user?.id);
  
  if (session?.user && event === 'SIGNED_IN') {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      useAuth.getState().setUser({
        id: session.user.id,
        email: session.user.email!,
        first_name: profile?.first_name || session.user.user_metadata?.first_name,
        last_name: profile?.last_name || session.user.user_metadata?.last_name,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    useAuth.getState().setUser(null);
  }
  
  useAuth.setState({ loading: false });
});