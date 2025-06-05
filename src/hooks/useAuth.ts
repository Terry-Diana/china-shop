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
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      signUp: async (email: string, password: string, userData?: Partial<User>) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              ...userData,
            });

          if (profileError) throw profileError;
        }

        return data;
      },
      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set({ 
            user: {
              id: data.user.id,
              email: data.user.email!,
              ...profile,
            }
          });
        }

        return data;
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
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    useAuth.getState().setUser({
      id: session.user.id,
      email: session.user.email!,
      ...profile,
    });
  } else {
    useAuth.getState().setUser(null);
  }
  useAuth.setState({ loading: false });
});