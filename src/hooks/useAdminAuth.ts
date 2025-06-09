import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { adminService } from '../services/adminService';
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
          const result = await adminService.adminLogin(email, password);
          if (result.admin) {
            set({ admin: result.admin });
          } else {
            throw new Error('Login failed - no admin data returned');
          }
        } catch (error) {
          console.error('Admin login error:', error);
          // Clear any existing admin state on login failure
          set({ admin: null });
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ admin: null });
          localStorage.removeItem('admin-auth-storage');
        } catch (error) {
          console.error('Admin logout error:', error);
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
          
          await adminService.registerAdmin(email, password, name, role);
        } catch (error) {
          console.error('Admin registration error:', error);
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
  console.log('Auth state change:', event, session?.user?.id);
  
  if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    try {
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        // If admin lookup fails, clear admin state but don't throw
        useAdminAuth.getState().setAdmin(null);
      } else if (adminData) {
        console.log('Admin data found:', adminData);
        useAdminAuth.getState().setAdmin(adminData);
      } else {
        console.log('No admin data found for user');
        useAdminAuth.getState().setAdmin(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      useAdminAuth.getState().setAdmin(null);
    }
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out, clearing admin state');
    useAdminAuth.getState().setAdmin(null);
  }
  
  // Always set loading to false after processing auth state change
  useAdminAuth.setState({ loading: false });
});