import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Admin } from '../types/admin';

interface AdminAuthState {
  admin: Admin | null;
  loading: boolean;
  initialized: boolean;
  setAdmin: (admin: Admin | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string, role: 'admin' | 'super_admin') => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: false, // Start with false
      initialized: false,

      setAdmin: (admin) => {
        console.log('🔧 AdminAuth: Setting admin:', admin?.email || 'null');
        set({ admin, loading: false });
      },

      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      initialize: async () => {
        const state = get();
        if (state.initialized) {
          console.log('🔧 AdminAuth: Already initialized, skipping');
          return;
        }
        
        console.log('🔧 AdminAuth: Initializing...');
        set({ loading: true });
        
        try {
          await state.checkAdminStatus();
        } catch (error) {
          console.error('❌ AdminAuth: Initialization error:', error);
          set({ admin: null, loading: false });
        } finally {
          set({ initialized: true, loading: false });
        }
      },

      refreshAdminSession: async () => {
        try {
          console.log('🔄 AdminAuth: Refreshing admin session...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ AdminAuth: No active session');
            set({ admin: null, loading: false });
            return;
          }

          // Check if user is admin in the admins table
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ AdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false });
            return;
          }

          if (adminData) {
            console.log('✅ AdminAuth: Admin session refreshed');
            set({ admin: adminData, loading: false });
          } else {
            console.log('ℹ️ AdminAuth: No admin record found');
            set({ admin: null, loading: false });
          }

        } catch (error) {
          console.error('❌ AdminAuth: Error refreshing admin session:', error);
          set({ admin: null, loading: false });
        }
      },

      checkAdminStatus: async () => {
        try {
          console.log('🔍 AdminAuth: Checking admin status...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ AdminAuth: No active session');
            set({ admin: null, loading: false });
            return;
          }

          console.log('✅ AdminAuth: Active session found, checking admin status');

          // Check if user is admin in the admins table
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ AdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false });
            return;
          }

          if (adminData) {
            console.log('✅ AdminAuth: Admin status confirmed');
            set({ admin: adminData, loading: false });
          } else {
            console.log('ℹ️ AdminAuth: No admin record found');
            set({ admin: null, loading: false });
          }

        } catch (error) {
          console.error('❌ AdminAuth: Error checking admin status:', error);
          set({ admin: null, loading: false });
        }
      },

      logout: async () => {
        try {
          console.log('🚪 AdminAuth: Logging out');
          const currentAdmin = get().admin;
          
          // Clear state immediately
          set({ admin: null, loading: false });
          
          // Only sign out from Supabase if not using default credentials
          if (currentAdmin && currentAdmin.id !== 'default-super-admin') {
            await supabase.auth.signOut();
          }
          
          console.log('✅ AdminAuth: Logout successful');
        } catch (error) {
          console.error('❌ AdminAuth: Logout error:', error);
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
          
          console.log('👤 AdminAuth: Registering new admin via server:', email);
          
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

          let result;
          try {
            result = await response.json();
          } catch (jsonError) {
            console.error('❌ AdminAuth: Failed to parse JSON response:', jsonError);
            const responseText = await response.text();
            console.error('❌ AdminAuth: Response text:', responseText);
            throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
          }

          if (!response.ok) {
            console.error('❌ AdminAuth: Server registration error:', result);
            throw new Error(result.error || 'Failed to register admin');
          }

          console.log('✅ AdminAuth: Admin registration successful');
          
        } catch (error) {
          console.error('❌ AdminAuth: Registration error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ admin: state.admin }),
      version: 5,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from older versions
        if (version < 5) {
          return { admin: persistedState?.admin || null };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.initialized = false;
        }
      }
    }
  )
);

// Single admin auth listener setup
let adminAuthListenerInitialized = false;

export const initializeAdminAuth = () => {
  if (adminAuthListenerInitialized) {
    console.log('🔧 AdminAuth: Listener already initialized');
    return;
  }
  
  adminAuthListenerInitialized = true;
  console.log('🔧 AdminAuth: Setting up admin auth listener');
  
  // Initialize admin auth state
  useAdminAuth.getState().initialize();
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 AdminAuth: Auth state change:', event, session?.user?.id);
    
    const state = useAdminAuth.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Check if the signed-in user is an admin
      await state.checkAdminStatus();
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 AdminAuth: User signed out, clearing admin state');
      state.setAdmin(null);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Only refresh if we don't already have admin data
      if (!state.admin) {
        await state.refreshAdminSession();
      }
    }
    
    state.setLoading(false);
  });
};