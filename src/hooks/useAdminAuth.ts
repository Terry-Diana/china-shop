import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Admin } from '../types/admin';

interface AdminAuthState {
  admin: Admin | null;
  loading: boolean;
  setAdmin: (admin: Admin | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string, role: 'admin' | 'super_admin') => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: true,

      setAdmin: (admin) => set({ admin }),

      login: async (email: string, password: string) => {
        try {
          console.log('useAdminAuth: Starting login process');
          
          // Step 1: Authenticate with Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            console.error('useAdminAuth: Auth error:', authError);
            throw authError;
          }

          if (!authData.user) {
            throw new Error('No user data returned from authentication');
          }

          console.log('useAdminAuth: Auth successful, checking admin status');

          // Step 2: Check admin status
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (adminError) {
            console.error('useAdminAuth: Admin lookup error:', adminError);
            await supabase.auth.signOut();
            throw new Error('Access denied. This account does not have admin privileges.');
          }

          if (!adminData) {
            await supabase.auth.signOut();
            throw new Error('Access denied. Admin privileges required.');
          }

          console.log('useAdminAuth: Admin verification successful');
          set({ admin: adminData });
          
        } catch (error) {
          console.error('useAdminAuth: Login error:', error);
          set({ admin: null });
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log('useAdminAuth: Logging out');
          set({ admin: null });
          await supabase.auth.signOut();
          localStorage.removeItem('admin-auth-storage');
        } catch (error) {
          console.error('useAdminAuth: Logout error:', error);
          // Even if logout fails, clear local state
          set({ admin: null });
          localStorage.removeItem('admin-auth-storage');
          throw error;
        }
      },

      registerAdmin: async (email: string, password: string, name: string, role: 'admin' | 'super_admin') => {
        try {
          const currentAdmin = get().admin;
          if (!currentAdmin || currentAdmin.role !== 'super_admin') {
            throw new Error('Only super admins can register new admins');
          }
          
          console.log('useAdminAuth: Registering new admin');
          
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, role },
              emailRedirectTo: undefined,
            },
          });

          if (authError) {
            console.error('useAdminAuth: Registration auth error:', authError);
            throw authError;
          }

          if (!authData.user) {
            throw new Error('Failed to create user account');
          }

          // Create admin record
          const { error: adminError } = await supabase
            .from('admins')
            .insert({
              id: authData.user.id,
              email,
              name,
              role,
            });

          if (adminError) {
            console.error('useAdminAuth: Admin record creation error:', adminError);
            throw adminError;
          }

          console.log('useAdminAuth: Admin registration successful');
          
        } catch (error) {
          console.error('useAdminAuth: Registration error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);

// Initialize admin auth state
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('useAdminAuth: Auth state change:', event, session?.user?.id);
  
  if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    try {
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('useAdminAuth: Error checking admin status:', error);
        useAdminAuth.getState().setAdmin(null);
      } else if (adminData) {
        console.log('useAdminAuth: Admin data found:', adminData);
        useAdminAuth.getState().setAdmin(adminData);
      } else {
        console.log('useAdminAuth: No admin data found for user');
        useAdminAuth.getState().setAdmin(null);
      }
    } catch (error) {
      console.error('useAdminAuth: Error checking admin status:', error);
      useAdminAuth.getState().setAdmin(null);
    }
  } else if (event === 'SIGNED_OUT') {
    console.log('useAdminAuth: User signed out, clearing admin state');
    useAdminAuth.getState().setAdmin(null);
  }
  
  // Always set loading to false after processing auth state change
  useAdminAuth.setState({ loading: false });
});