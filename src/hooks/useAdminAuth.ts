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
          }
        } catch (error) {
          console.error('Admin login error:', error);
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
  if (session?.user && event === 'SIGNED_IN') {
    try {
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (adminData) {
        useAdminAuth.getState().setAdmin(adminData);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    useAdminAuth.getState().setAdmin(null);
  }
  
  useAdminAuth.setState({ loading: false });
});