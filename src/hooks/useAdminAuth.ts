import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Admin } from '../types/admin';

interface AdminAuthState {
  admin: Admin | null;
  loading: boolean;
  setAdmin: (admin: Admin | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string, role: 'admin' | 'super_admin') => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: false, // Start with false to prevent infinite loading

      setAdmin: (admin) => {
        console.log('🔧 useAdminAuth: Setting admin:', admin);
        set({ admin, loading: false });
      },

      setLoading: (loading) => set({ loading }),

      refreshAdminSession: async () => {
        try {
          console.log('🔄 useAdminAuth: Refreshing admin session...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ useAdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ useAdminAuth: No active session');
            set({ admin: null, loading: false });
            return;
          }

          // Check if user is admin in the admins table - use maybeSingle() to handle no results gracefully
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ useAdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false });
            return;
          }

          if (adminData) {
            console.log('✅ useAdminAuth: Admin session refreshed');
            set({ admin: adminData, loading: false });
          } else {
            console.log('ℹ️ useAdminAuth: No admin record found');
            set({ admin: null, loading: false });
          }

        } catch (error) {
          console.error('💥 useAdminAuth: Error refreshing admin session:', error);
          set({ admin: null, loading: false });
        }
      },

      checkAdminStatus: async () => {
        try {
          console.log('🔍 useAdminAuth: Checking admin status...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ useAdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ useAdminAuth: No active session');
            set({ admin: null, loading: false });
            return;
          }

          console.log('✅ useAdminAuth: Active session found, checking admin status');

          // Check if user is admin in the admins table - use maybeSingle() to handle no results gracefully
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ useAdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false });
            return;
          }

          if (adminData) {
            console.log('✅ useAdminAuth: Admin status confirmed');
            set({ admin: adminData, loading: false });
          } else {
            console.log('ℹ️ useAdminAuth: No admin record found');
            set({ admin: null, loading: false });
          }

        } catch (error) {
          console.error('💥 useAdminAuth: Error checking admin status:', error);
          set({ admin: null, loading: false });
        }
      },

      logout: async () => {
        try {
          console.log('🚪 useAdminAuth: Logging out');
          const currentAdmin = get().admin;
          
          // Clear state immediately
          set({ admin: null, loading: false });
          
          // Only sign out from Supabase if not using default credentials
          if (currentAdmin && currentAdmin.id !== 'default-super-admin') {
            await supabase.auth.signOut();
          }
          
          console.log('✅ useAdminAuth: Logout successful');
        } catch (error) {
          console.error('💥 useAdminAuth: Logout error:', error);
          // Even if logout fails, clear local state
          set({ admin: null, loading: false });
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
          
          // Make request to server-side endpoint using the configured API base URL
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const response = await fetch(`${apiBaseUrl}/api/admin/register`, {
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

          // Clone the response so we can read it multiple times if needed
          const responseClone = response.clone();

          let result;
          try {
            result = await response.json();
          } catch (jsonError) {
            console.error('❌ useAdminAuth: Failed to parse JSON response:', jsonError);
            // Use the cloned response to get text for better error reporting
            try {
              const responseText = await responseClone.text();
              console.error('❌ useAdminAuth: Response text:', responseText);
              throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}. Response: ${responseText}`);
            } catch (textError) {
              console.error('❌ useAdminAuth: Failed to read response as text:', textError);
              throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
            }
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
      version: 4,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from older versions
        if (version === 0 || version === 1 || version === 2 || version === 3) {
          // For versions 0, 1, 2, and 3, keep the existing state structure
          return persistedState;
        }
        // For unknown versions, return a clean state
        return { admin: null };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      }
    }
  )
);

// Initialize admin auth state and set up auth listener
let authListenerInitialized = false;

export const initializeAdminAuth = () => {
  if (authListenerInitialized) return;
  
  authListenerInitialized = true;
  
  console.log('🔧 useAdminAuth: Initializing auth listener');
  
  // Set loading to false initially
  useAdminAuth.getState().setLoading(false);
  
  // Check initial admin status
  useAdminAuth.getState().checkAdminStatus();
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 useAdminAuth: Auth state change:', event, session?.user?.id);
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Check if the signed-in user is an admin
      await useAdminAuth.getState().checkAdminStatus();
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 useAdminAuth: User signed out, clearing admin state');
      useAdminAuth.getState().setAdmin(null);
    } else if (event === 'TOKEN_REFRESHED') {
      // Refresh admin session when token is refreshed
      await useAdminAuth.getState().refreshAdminSession();
    }
    
    // Always ensure loading is false
    useAdminAuth.getState().setLoading(false);
  });
};