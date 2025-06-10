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
          
          console.log('👤 useAdminAuth: Registering new admin via server:', email);
          
          // Validate inputs
          if (!email.trim() || !password || !name.trim()) {
            throw new Error('All fields are required');
          }
          
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          
          // Make request to server-side endpoint
          const response = await fetch('/api/admin/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
              password: password,
              name: name.trim(),
              role: role,
              currentAdminId: currentAdmin.id
            }),
          });

          let result;
          try {
            result = await response.json();
          } catch (jsonError) {
            console.error('❌ useAdminAuth: Failed to parse JSON response:', jsonError);
            // Try to get response as text for better error reporting
            const responseText = await response.text();
            console.error('❌ useAdminAuth: Response text:', responseText);
            throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
          }

          if (!response.ok) {
            console.error('❌ useAdminAuth: Server registration error:', result);
            throw new Error(result.error || 'Failed to register admin');
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