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
      loading: false,

      setAdmin: (admin) => set({ admin }),

      login: async (email: string, password: string) => {
        try {
          console.log('useAdminAuth: Starting login process');
          
          // Check for default super admin credentials
          if (email.trim() === 'superadmin@chinasquare.com' && password === 'adminsuper@123') {
            console.log('useAdminAuth: Default super admin credentials verified');
            
            const defaultAdmin: Admin = {
              id: 'default-super-admin',
              email: 'superadmin@chinasquare.com',
              name: 'Super Admin',
              role: 'super_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set({ admin: defaultAdmin });
            return;
          }
          
          // For database-stored admins, try Supabase authentication
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            console.error('useAdminAuth: Auth error:', authError);
            throw new Error('Invalid credentials');
          }

          if (!authData.user) {
            throw new Error('No user data returned from authentication');
          }

          console.log('useAdminAuth: Auth successful, checking admin status');

          // Check admin status
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (adminError || !adminData) {
            console.error('useAdminAuth: Admin lookup error:', adminError);
            await supabase.auth.signOut();
            throw new Error('Access denied. This account does not have admin privileges.');
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
          
          // Only sign out from Supabase if not using default credentials
          const currentAdmin = get().admin;
          if (currentAdmin && currentAdmin.id !== 'default-super-admin') {
            await supabase.auth.signOut();
          }
          
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
          
          // Create auth user using admin API (bypasses email confirmation)
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: password,
            email_confirm: true,
            user_metadata: { 
              name: name.trim(),
              role: role
            }
          });

          if (authError) {
            console.error('useAdminAuth: Registration auth error:', authError);
            if (authError.message.includes('User already registered')) {
              throw new Error('An account with this email already exists.');
            }
            throw new Error(`Failed to create user account: ${authError.message}`);
          }

          if (!authData.user) {
            throw new Error('Failed to create user account');
          }

          // Create admin record
          const { error: adminError } = await supabase
            .from('admins')
            .insert({
              id: authData.user.id,
              email: email.trim(),
              name: name.trim(),
              role: role,
            });

          if (adminError) {
            console.error('useAdminAuth: Admin record creation error:', adminError);
            
            // Try to clean up the auth user
            try {
              await supabase.auth.admin.deleteUser(authData.user.id);
            } catch (cleanupError) {
              console.error('Failed to cleanup auth user:', cleanupError);
            }
            
            throw new Error(`Failed to create admin record: ${adminError.message}`);
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

// Initialize admin auth state - simplified for default credentials
export const initializeAdminAuth = () => {
  useAdminAuth.setState({ loading: false });
};

// Call initialization
initializeAdminAuth();