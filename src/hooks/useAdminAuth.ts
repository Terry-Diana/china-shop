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
          console.log('🔐 useAdminAuth: Starting login process for:', email);
          
          // Check for default super admin credentials
          if (email.trim() === 'superadmin@chinasquare.com' && password === 'adminsuper@123') {
            console.log('✅ useAdminAuth: Default super admin credentials verified');
            
            const defaultAdmin: Admin = {
              id: 'default-super-admin',
              email: 'superadmin@chinasquare.com',
              name: 'Super Admin',
              role: 'super_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            set({ admin: defaultAdmin });
            console.log('✅ useAdminAuth: Default admin set successfully');
            return;
          }
          
          // For database-stored admins, try Supabase authentication
          console.log('🔍 useAdminAuth: Attempting database admin login');
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (authError) {
            console.error('❌ useAdminAuth: Auth error:', authError);
            throw new Error('Invalid email or password');
          }

          if (!authData.user) {
            throw new Error('No user data returned from authentication');
          }

          console.log('✅ useAdminAuth: Auth successful, checking admin status');

          // Check admin status
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (adminError || !adminData) {
            console.error('❌ useAdminAuth: Admin lookup error:', adminError);
            await supabase.auth.signOut();
            throw new Error('Access denied. This account does not have admin privileges.');
          }

          console.log('✅ useAdminAuth: Admin verification successful');
          set({ admin: adminData });
          
        } catch (error) {
          console.error('💥 useAdminAuth: Login error:', error);
          set({ admin: null });
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log('🚪 useAdminAuth: Logging out');
          const currentAdmin = get().admin;
          
          set({ admin: null });
          
          // Only sign out from Supabase if not using default credentials
          if (currentAdmin && currentAdmin.id !== 'default-super-admin') {
            await supabase.auth.signOut();
          }
          
          localStorage.removeItem('admin-auth-storage');
          console.log('✅ useAdminAuth: Logout successful');
        } catch (error) {
          console.error('💥 useAdminAuth: Logout error:', error);
          // Even if logout fails, clear local state
          set({ admin: null });
          localStorage.removeItem('admin-auth-storage');
          throw error;
        }
      },

      registerAdmin: async (email: string, password: string, name: string, role: 'admin' | 'super_admin') => {
        try {
          const currentAdmin = get().admin;
          
          // Allow registration if:
          // 1. Current user is the default super admin, OR
          // 2. Current user is a database super admin, OR
          // 3. No current admin (for initial setup)
          const canRegister = !currentAdmin || 
                             currentAdmin.id === 'default-super-admin' || 
                             currentAdmin.role === 'super_admin';
          
          if (!canRegister) {
            throw new Error('Only super admins can register new admins');
          }
          
          console.log('👤 useAdminAuth: Registering new admin:', email);
          
          // Create auth user using admin API (bypasses email confirmation)
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { 
              name: name.trim(),
              role: role
            }
          });

          if (authError) {
            console.error('❌ useAdminAuth: Registration auth error:', authError);
            if (authError.message.includes('User already registered')) {
              throw new Error('An account with this email already exists.');
            }
            throw new Error(`Failed to create user account: ${authError.message}`);
          }

          if (!authData.user) {
            throw new Error('Failed to create user account');
          }

          console.log('✅ useAdminAuth: Auth user created, creating admin record');

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
            console.error('❌ useAdminAuth: Admin record creation error:', adminError);
            
            // Try to clean up the auth user
            try {
              await supabase.auth.admin.deleteUser(authData.user.id);
              console.log('🧹 useAdminAuth: Cleaned up auth user after admin record failure');
            } catch (cleanupError) {
              console.error('💥 useAdminAuth: Failed to cleanup auth user:', cleanupError);
            }
            
            throw new Error(`Failed to create admin record: ${adminError.message}`);
          }

          console.log('✅ useAdminAuth: Admin registration successful');
          
        } catch (error) {
          console.error('💥 useAdminAuth: Registration error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ admin: state.admin }),
    }
  )
);

// Initialize admin auth state
export const initializeAdminAuth = () => {
  console.log('🚀 Initializing admin auth');
  useAdminAuth.setState({ loading: false });
};

// Call initialization
initializeAdminAuth();