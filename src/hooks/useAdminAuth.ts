import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Admin } from '../types/admin';

interface AdminAuthState {
  admin: Admin | null;
  loading: boolean;
  setAdmin: (admin: Admin | null) => void;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string, role: 'admin' | 'super_admin') => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: false,

      setAdmin: (admin) => {
        console.log('🔧 useAdminAuth: Setting admin:', admin);
        set({ admin });
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
          
          // Only allow registration if current user is super admin
          if (!currentAdmin || currentAdmin.role !== 'super_admin') {
            throw new Error('Only super admins can register new admins');
          }
          
          console.log('👤 useAdminAuth: Registering new admin:', email);
          
          // Validate inputs
          if (!email.trim() || !password || !name.trim()) {
            throw new Error('All fields are required');
          }
          
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          
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