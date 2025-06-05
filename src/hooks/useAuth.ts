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
  admin: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    name: string;
  } | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setAdmin: (admin: any | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      admin: null,
      token: null,
      setUser: (user) => set({ user }),
      setAdmin: (admin) => set({ admin }),
      setToken: (token) => set({ token }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, admin: null, token: null });
      },
      signUp: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirm: false // This is just metadata, not functional
            }
          }
        });
        if (error) throw error;
        return data;
      },
      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);